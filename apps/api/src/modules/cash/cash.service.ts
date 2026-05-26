import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCashRegisterDto } from './dto/create-cash-register.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class CashService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.cashRegister.findMany({ include: { transactions: true }, orderBy: { openedAt: 'desc' } });
  }

  open(dto: CreateCashRegisterDto) {
    return this.prisma.cashRegister.create({
      data: {
        ...dto,
        transactions: { create: { type: 'apertura', amount: dto.openingAmount, note: 'Apertura de caja' } },
      },
      include: { transactions: true },
    });
  }

  addTransaction(dto: CreateTransactionDto) {
    return this.prisma.transaction.create({ data: dto });
  }

  close(id: string, closingAmount: number) {
    return this.prisma.cashRegister.update({
      where: { id },
      data: {
        closingAmount,
        status: 'cerrada',
        closedAt: new Date(),
        transactions: { create: { type: 'cierre', amount: closingAmount, note: 'Cierre de caja' } },
      },
      include: { transactions: true },
    });
  }
}

