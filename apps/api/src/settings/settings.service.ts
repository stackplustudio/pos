import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getTenantProfile(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        nama_bisnis: true,
        alamat: true,
        no_hp: true,
        pajak_persen: true,
        lebar_printer: true,
        footer_struk: true,
        status_langganan: true,
      },
    });
    if (!tenant) throw new NotFoundException('Data bisnis tidak ditemukan');
    return tenant;
  }

  async updateTenantProfile(
    tenantId: string,
    data: {
      nama_bisnis?: string;
      alamat?: string;
      no_hp?: string;
      pajak_persen?: number;
      lebar_printer?: number;
      footer_struk?: string;
    },
  ) {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(data.nama_bisnis !== undefined && { nama_bisnis: data.nama_bisnis }),
        ...(data.alamat !== undefined && { alamat: data.alamat }),
        ...(data.no_hp !== undefined && { no_hp: data.no_hp }),
        ...(data.pajak_persen !== undefined && { pajak_persen: Number(data.pajak_persen) }),
        ...(data.lebar_printer !== undefined && { lebar_printer: Number(data.lebar_printer) }),
        ...(data.footer_struk !== undefined && { footer_struk: data.footer_struk }),
      },
      select: {
        id: true,
        nama_bisnis: true,
        alamat: true,
        no_hp: true,
        pajak_persen: true,
        lebar_printer: true,
        footer_struk: true,
      },
    });
  }
}
