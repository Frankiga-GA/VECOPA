import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.payment.findMany({ include: { order: true }, orderBy: { createdAt: 'desc' } });
  }

  async create(dto: CreatePaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({ data: { ...dto, confirmed: dto.confirmed ?? true } });
      if (payment.confirmed) {
        const order = await tx.order.update({ where: { id: dto.orderId }, data: { status: 'pagado' } });
        await tx.diningTable.update({ where: { id: order.tableId }, data: { status: 'libre' } });
      }
      return payment;
    });
  }
}

