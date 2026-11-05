import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, OrderType } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles(Role.KASIR, Role.OWNER, Role.MANAGER)
  @Post()
  create(
    @Request() req: any,
    @Body() body: { tipe: OrderType; tableId?: string; metode_bayar: string; discountId?: string; diskon_nominal?: number; items: any[] }
  ) {
    return this.ordersService.createOrder(req.user.tenantId, req.user.id, body);
  }

  @Roles(Role.OWNER, Role.MANAGER, Role.KASIR)
  @Get()
  findAll(@Request() req: any) {
    return this.ordersService.findAll(req.user.tenantId);
  }

  // 🔒 Void Order / Batalkan Transaksi (FR-POS-09)
  @Roles(Role.OWNER, Role.MANAGER, Role.KASIR)
  @Post(':id/void')
  voidOrder(@Request() req: any, @Param('id') id: string, @Body() body: { alasan: string }) {
    return this.ordersService.voidOrder(req.user.tenantId, req.user.id, id, body.alasan);
  }
}
