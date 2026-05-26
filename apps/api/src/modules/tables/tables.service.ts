import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTableDto, TableStatusDto } from './dto/create-table.dto';

@Injectable()
export class TablesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.diningTable.findMany({ where: { deletedAt: null }, orderBy: { name: 'asc' } });
  }

  create(dto: CreateTableDto) {
    return this.prisma.diningTable.create({ data: dto });
  }

  setStatus(id: string, status: TableStatusDto) {
    return this.prisma.diningTable.update({ where: { id }, data: { status } });
  }
}
