import { Type } from 'class-transformer';
import { IsNumber, IsString, Min } from 'class-validator';

export class CreateCashRegisterDto {
  @IsString()
  openedBy: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  openingAmount: number;
}

