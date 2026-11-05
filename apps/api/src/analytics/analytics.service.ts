import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getTodaySummary(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orders = await this.prisma.order.findMany({
      where: { tenantId, createdAt: { gte: today, lt: tomorrow }, status: 'COMPLETED' },
    });

    const transaksi = orders.length;
    const omzet = orders.reduce((sum, order) => sum + order.total, 0);
    const rataRata = transaksi > 0 ? Math.round(omzet / transaksi) : 0;

    return { omzet, transaksi, rataRata };
  }

  async getProfitLoss(tenantId: string, startDate?: string, endDate?: string) {
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate
      ? new Date(endDate)
      : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

    // 1. Ambil semua pesanan COMPLETED dengan order items & BOM recipes
    const orders = await this.prisma.order.findMany({
      where: {
        tenantId,
        status: 'COMPLETED',
        createdAt: { gte: start, lte: end },
      },
      include: {
        orderItems: {
          include: {
            menuItem: {
              include: {
                category: true,
                recipes: {
                  include: {
                    ingredient: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    let totalPemasukan = 0;
    let totalSubtotal = 0;
    let totalDiskon = 0;
    let totalPajak = 0;
    let totalHPP = 0;

    const menuAgg: Record<
      string,
      {
        id: string;
        nama: string;
        kategori: string;
        qty: number;
        omzet: number;
        hpp: number;
      }
    > = {};

    const categoryAgg: Record<string, { nama: string; qty: number; omzet: number }> = {};

    for (const order of orders) {
      totalPemasukan += order.total;
      totalSubtotal += order.subtotal;
      totalDiskon += order.diskon;
      totalPajak += order.pajak;

      for (const item of order.orderItems) {
        // Hitung HPP riil item dari resep bahan baku
        const unitHpp = (item.menuItem?.recipes || []).reduce(
          (sum, r) => sum + (r.jumlah_takaran * (r.ingredient?.harga_beli_terakhir || 0)),
          0,
        );
        const itemTotalHpp = Math.round(unitHpp * item.qty);
        totalHPP += itemTotalHpp;

        // Agregasi Menu Terlaris
        const mId = item.menuItemId;
        const mName = item.menuItem?.nama || 'Item';
        const cName = item.menuItem?.category?.nama_kategori || 'Umum';
        const itemOmzet = item.harga * item.qty;

        if (!menuAgg[mId]) {
          menuAgg[mId] = {
            id: mId,
            nama: mName,
            kategori: cName,
            qty: 0,
            omzet: 0,
            hpp: 0,
          };
        }
        menuAgg[mId].qty += item.qty;
        menuAgg[mId].omzet += itemOmzet;
        menuAgg[mId].hpp += itemTotalHpp;

        // Agregasi Kategori
        if (!categoryAgg[cName]) {
          categoryAgg[cName] = { nama: cName, qty: 0, omzet: 0 };
        }
        categoryAgg[cName].qty += item.qty;
        categoryAgg[cName].omzet += itemOmzet;
      }
    }

    // 2. Pengeluaran (Total Belanja Supplier dari PO yang sudah SELESAI)
    const purchaseOrders = await this.prisma.purchaseOrder.findMany({
      where: {
        tenantId,
        status: 'SELESAI',
        createdAt: { gte: start, lte: end },
      },
    });
    const totalPengeluaran = purchaseOrders.reduce((sum, po) => sum + po.total, 0);

    // 3. Kalkulasi Laba Kotor & Bersih
    const labaKotor = totalPemasukan - totalHPP;
    const marginLabaKotor = totalPemasukan > 0 ? Number(((labaKotor / totalPemasukan) * 100).toFixed(1)) : 0;
    const labaBersih = totalPemasukan - totalPengeluaran;

    // 4. Urutkan Menu Terlaris
    const topMenus = Object.values(menuAgg)
      .map((m) => ({
        ...m,
        labaKotor: m.omzet - m.hpp,
        marginPersen: m.omzet > 0 ? Number((((m.omzet - m.hpp) / m.omzet) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.qty - a.qty);

    const categories = Object.values(categoryAgg).sort((a, b) => b.omzet - a.omzet);

    return {
      periode: { start, end },
      pemasukan: totalPemasukan,
      subtotal: totalSubtotal,
      diskon: totalDiskon,
      pajak: totalPajak,
      totalHPP,
      labaKotor,
      marginLabaKotor,
      pengeluaran: totalPengeluaran,
      labaBersih,
      transaksi: orders.length,
      rataRataTransaksi: orders.length > 0 ? Math.round(totalPemasukan / orders.length) : 0,
      topMenus,
      categories,
    };
  }
}
