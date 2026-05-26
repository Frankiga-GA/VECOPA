import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateTableDto, TableStatusDto } from './dto/create-table.dto';
import { TablesService } from './tables.service';

@UseGuards(JwtAuthGuard)
@Controller('tables')
export class TablesController {
  constructor(private readonly tables: TablesService) {}

  @Get()
  findAll() {
    return this.tables.findAll();
  }

  @Post()
  create(@Body() dto: CreateTableDto) {
    return this.tables.create(dto);
  }

  @Patch(':id/status')
  setStatus(@Param('id') id: string, @Body('status') status: TableStatusDto) {
    return this.tables.setStatus(id, status);
  }
}

