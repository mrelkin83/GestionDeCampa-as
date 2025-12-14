import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { TestigosService } from './testigos.service';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { QueryTestigosDto } from './dto/query-testigos.dto';

@Controller('testigos')
export class TestigosController {
  constructor(private readonly testigosService: TestigosService) {}

  @Get()
  async findAll(@Query() query: QueryTestigosDto) {
    return this.testigosService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.testigosService.findOne(id);
  }

  @Put(':id/estado')
  async updateEstado(@Param('id') id: string, @Body() dto: UpdateEstadoDto) {
    return this.testigosService.updateEstado(id, dto);
  }

  @Get(':id/actividad')
  async getActividad(@Param('id') id: string) {
    return this.testigosService.getActividad(id);
  }

  @Post(':id/checkin')
  async checkin(@Param('id') id: string, @Body() body: any) {
    return this.testigosService.checkin(id, body);
  }

  @Get('campaign/:campaignId/activos')
  async getActivosByCampaign(@Param('campaignId') campaignId: string) {
    return this.testigosService.getActivosByCampaign(campaignId);
  }
}
