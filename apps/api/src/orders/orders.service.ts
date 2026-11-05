import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderType, MovementType } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(
    tenantId: string, 
    kasirId: string, 
    data: { tipe: OrderType; tableId?: string; metode_bayar: string; discountId?: string; diskon_nominal?: number; items: any[] }
  ) {
    if (!data.items || data.items.length === 0) {
      throw new BadRequestException('Keranjang belanja kosong.');
    }

    const subtotal = data.items.reduce((sum, item) => sum + (item.harga * item.qty), 0);
    const diskon = data.diskon_nominal || 0; // Nominal diskon yang sudah dihitung oleh Frontend POS
    const subtotalSetelahDiskon = subtotal - diskon;
    
    // Pastikan tidak minus
    const finalSubtotal = subtotalSetelahDiskon > 0 ? subtotalSetelahDiskon : 0;
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { pajak_persen: true },
    });
    const taxRate = ((tenant?.pajak_persen ?? 11)) / 100;
    const pajak = Math.round(finalSubtotal * taxRate);
    const total = finalSubtotal + pajak;

    return this.prisma.$transaction(async (tx) => {
      // 1. Buat Header Pesanan (Tambahkan diskon dan discountId)
      const order = await tx.order.create({
        data: {
          tenantId,
          kasirId,
          tipe: data.tipe,
          tableId: data.tableId,
          status: 'COMPLETED', 
          subtotal,
          diskon,
          discountId: data.discountId,
          pajak,
          total,
          metode_bayar: data.metode_bayar,
        }
      });

      // 2. Loop setiap item pesanan & Potong Stok
      for (const item of data.items) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            menuItemId: item.menuItemId,
            qty: item.qty,
            harga: item.harga,
            catatan: item.catatan
          }
        });

        const recipes = await tx.recipe.findMany({
          where: { menuItemId: item.menuItemId }
        });

        for (const recipe of recipes) {
          const totalPotongan = recipe.jumlah_takaran * item.qty;
          await tx.ingredient.update({
            where: { id: recipe.ingredientId },
            data: { stok_saat_ini: { decrement: totalPotongan } }
          });

          await tx.stockMovement.create({
            data: {
              tenantId,
              ingredientId: recipe.ingredientId,
              tipe: 'SALE',
              jumlah: totalPotongan,
              referensi_id: order.id,
              catatan: `Terjual ${item.qty} porsi menu ID: ${item.menuItemId}`
            }
          });
        }
      }

      // 3. Update Meja jika Dine In
      if (data.tipe === 'DINE_IN' && data.tableId) {
        await tx.table.update({
          where: { id: data.tableId },
          data: { status: 'TERISI' }
        });
      }

      // 4. Tambahkan uang pemasukan ke laci Shift Kasir yang sedang aktif jika pembayaran tunai
      const activeShift = await tx.shift.findFirst({
        where: { tenantId, kasirId, waktu_tutup: null }
      });

      if (activeShift && data.metode_bayar === 'TUNAI') {
        await tx.shift.update({
          where: { id: activeShift.id },
          data: { kas_sistem: { increment: total } }
        });
      }

      return order;
    });
  }

  // Fungsi Read Riwayat
  async findAll(tenantId: string) {
    return this.prisma.order.findMany({
      where: { tenantId },
      include: {
        kasir: { select: { name: true } },
        table: true,
        orderItems: { include: { menuItem: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Fungsi Void / Batalkan Transaksi (FR-POS-09)
  async voidOrder(tenantId: string, userId: string, orderId: string, alasan: string) {
    if (!alasan || !alasan.trim()) {
      throw new BadRequestException('Alasan pembatalan (void) pesanan wajib diisi.');
    }

    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
      include: {
        orderItems: {
          include: {
            menuItem: {
              include: {
                recipes: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Data transaksi pesanan tidak ditemukan.');
    }

    if (order.status === 'CANCELLED') {
      throw new BadRequestException('Pesanan ini sudah pernah dibatalkan (void).');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Ubah status pesanan menjadi CANCELLED
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      });

      // 2. Kembalikan stok bahan baku
      for (const item of order.orderItems) {
        for (const recipe of item.menuItem.recipes) {
          const totalKembali = recipe.jumlah_takaran * item.qty;
          await tx.ingredient.update({
            where: { id: recipe.ingredientId },
            data: { stok_saat_ini: { increment: totalKembali } },
          });

          await tx.stockMovement.create({
            data: {
              tenantId,
              ingredientId: recipe.ingredientId,
              tipe: 'IN' as MovementType,
              jumlah: totalKembali,
              referensi_id: order.id,
              catatan: `Void Order #${order.id.slice(-6)}: ${alasan.trim()} (${item.qty}x ${item.menuItem.nama})`,
            },
          });
        }
      }

      // 3. Jika pembayaran TUNAI, potong kas_sistem pada shift kasir aktif
      if (order.metode_bayar === 'TUNAI') {
        const activeShift = await tx.shift.findFirst({
          where: { tenantId, kasirId: userId, waktu_tutup: null },
        });

        if (activeShift) {
          await tx.shift.update({
            where: { id: activeShift.id },
            data: { kas_sistem: { decrement: order.total } },
          });
        }
      }

      // 4. Jika pesanan memiliki nomor meja, kembalikan meja menjadi KOSONG
      if (order.tableId) {
        await tx.table.update({
          where: { id: order.tableId },
          data: { status: 'KOSONG' },
        });
      }

      return updatedOrder;
    });
  }
}
