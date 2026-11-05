import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderType, OrderStatus, MovementType } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(
    tenantId: string, 
    kasirId: string, 
    data: {
      tipe: OrderType;
      tableId?: string;
      metode_bayar: string;
      discountId?: string;
      diskon_nominal?: number;
      nama_pelanggan?: string;
      no_hp_pelanggan?: string;
      status?: OrderStatus;
      items: any[];
    }
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
      // 1. Buat Header Pesanan
      const order = await tx.order.create({
        data: {
          tenantId,
          kasirId,
          tipe: data.tipe,
          tableId: data.tableId,
          status: data.status || 'PROCESSING', 
          subtotal,
          diskon,
          discountId: data.discountId,
          pajak,
          total,
          metode_bayar: data.metode_bayar,
          nama_pelanggan: data.nama_pelanggan,
          no_hp_pelanggan: data.no_hp_pelanggan,
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
        where: { tenantId, kasirId, waktu_tutup: null },
        orderBy: { waktu_buka: 'desc' }
      });

      if (activeShift) {
        if (data.metode_bayar === 'TUNAI') {
          await tx.shift.update({
            where: { id: activeShift.id },
            data: { kas_sistem: { increment: total } }
          });
        }
      }

      return order;
    });
  }

  // Fungsi Read Riwayat & KDS
  async findAll(tenantId: string, statusFilter?: string) {
    const where: any = { tenantId };
    if (statusFilter === 'active') {
      where.status = { in: ['NEW', 'PROCESSING', 'READY'] };
    } else if (statusFilter) {
      where.status = statusFilter;
    }

    return this.prisma.order.findMany({
      where,
      include: {
        kasir: { select: { name: true } },
        table: true,
        orderItems: { include: { menuItem: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Update Status Pesanan (KDS: PROCESSING -> READY -> COMPLETED)
  async updateOrderStatus(tenantId: string, orderId: string, status: OrderStatus) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
    });
    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan.');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        table: true,
        orderItems: { include: { menuItem: true } },
      },
    });

    // Jika pesanan selesai disajikan dan bertipe Dine In, bebaskan status meja
    if (status === 'COMPLETED' && order.tableId) {
      await this.prisma.table.update({
        where: { id: order.tableId },
        data: { status: 'KOSONG' },
      });
    }

    return updated;
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

      // 3. Jika bertipe DINE_IN, kosongkan meja
      if (order.tipe === 'DINE_IN' && order.tableId) {
        await tx.table.update({
          where: { id: order.tableId },
          data: { status: 'KOSONG' },
        });
      }

      // 4. Jika order dibayar tunai, kurangi kas_sistem di shift kasir aktif
      if (order.metode_bayar === 'TUNAI') {
        const activeShift = await tx.shift.findFirst({
          where: { tenantId, waktu_tutup: null },
          orderBy: { waktu_buka: 'desc' },
        });

        if (activeShift) {
          await tx.shift.update({
            where: { id: activeShift.id },
            data: { kas_sistem: { decrement: order.total } },
          });
        }
      }

      return updatedOrder;
    });
  }
}
