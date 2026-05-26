import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async daily() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const payments = await this.prisma.payment.groupBy({
      by: ['method'],
      where: { confirmed: true, createdAt: { gte: start } },
      _sum: { amount: true },
      _count: true,
    });
    const topProducts = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });
    return { payments, topProducts };
  }
}
