import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CashService } from './cash.service';
import { CreateCashRegisterDto } from './dto/create-cash-register.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@UseGuards(JwtAuthGuard)
@Controller('cash-registers')
export class CashController {
  constructor(private readonly cash: CashService) {}

  @Get()
  findAll() {
    return this.cash.findAll();
  }

  @Post('open')
  open(@Body() dto: CreateCashRegisterDto) {
    return this.cash.open(dto);
  }

  @Post('transactions')
  addTransaction(@Body() dto: CreateTransactionDto) {
    return this.cash.addTransaction(dto);
  }

  @Patch(':id/close')
  close(@Param('id') id: string, @Body('closingAmount') closingAmount: number) {
    return this.cash.close(id, Number(closingAmount));
  }
}

