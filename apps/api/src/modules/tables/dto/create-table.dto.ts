import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export enum TableStatusDto {
  libre = 'libre',
  ocupada = 'ocupada',
  reservada = 'reservada',
}

export class CreateTableDto {
  @IsString()
  @MinLength(2)
  name: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity: number;

  @IsOptional()
  @IsEnum(TableStatusDto)
  status?: TableStatusDto;
}

