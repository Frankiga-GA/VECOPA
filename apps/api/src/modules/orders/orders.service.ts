import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  findActive() {
    return this.prisma.order.findMany({
      where: { status: 'abierto' },
      include: { table: true, items: { include: { product: true } }, payments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateOrderDto) {
    const products = await this.prisma.product.findMany({
      where: { id: { in: dto.items.map((item) => item.productId) } },
    });
    if (products.length !== dto.items.length) throw new BadRequestException('Producto no encontrado');

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          tableId: dto.tableId,
          waiter: dto.waiter,
          notes: dto.notes,
          items: {
            create: dto.items.map((item) => {
              const product = products.find((candidate) => candidate.id === item.productId)!;
              return { productId: item.productId, quantity: item.quantity, unitPrice: product.price, note: item.note };
            }),
          },
        },
        include: { items: true },
      });
      await tx.diningTable.update({ where: { id: dto.tableId }, data: { status: 'ocupada' } });
      return order;
    });
  }

  setStatus(id: string, status: OrderStatus) {
    return this.prisma.order.update({ where: { id }, data: { status } });
  }
}

