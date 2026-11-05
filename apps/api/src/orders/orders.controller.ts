import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, OrderType, OrderStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles(Role.KASIR, Role.OWNER, Role.MANAGER)
  @Post()
  create(
    @Request() req: any,
    @Body()
    body: {
      tipe: OrderType;
      tableId?: string;
      metode_bayar: string;
      discountId?: string;
      diskon_nominal?: number;
      nama_pelanggan?: string;
      no_hp_pelanggan?: string;
      status?: OrderStatus;
      items: any[];
    },
  ) {
    return this.ordersService.createOrder(req.user.tenantId, req.user.id, body);
  }

  @Roles(Role.OWNER, Role.MANAGER, Role.KASIR)
  @Get()
  findAll(@Request() req: any, @Query('status') status?: string) {
    return this.ordersService.findAll(req.user.tenantId, status);
  }

  // 🍳 Update Status Pesanan (KDS: PROCESSING -> READY -> COMPLETED)
  @Roles(Role.OWNER, Role.MANAGER, Role.KASIR)
  @Patch(':id/status')
  updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { status: OrderStatus },
  ) {
    return this.ordersService.updateOrderStatus(req.user.tenantId, id, body.status);
  }

  // 🔒 Void Order / Batalkan Transaksi (FR-POS-09)
  @Roles(Role.OWNER, Role.MANAGER, Role.KASIR)
  @Post(':id/void')
  voidOrder(@Request() req: any, @Param('id') id: string, @Body() body: { alasan: string }) {
    return this.ordersService.voidOrder(req.user.tenantId, req.user.id, id, body.alasan);
  }
}
