import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsString, IsUUID, Min } from 'class-validator';

export enum TransactionTypeDto {
  ingreso = 'ingreso',
  egreso = 'egreso',
}

export class CreateTransactionDto {
  @IsUUID()
  cashRegisterId: string;

  @IsEnum(TransactionTypeDto)
  type: TransactionTypeDto;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  note: string;
}

