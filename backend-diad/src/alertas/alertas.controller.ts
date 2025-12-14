import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { AlertasService } from './alertas.service';
import { CreateAlertaDto } from './dto/create-alerta.dto';

@Controller('alertas')
export class AlertasController {
  constructor(private readonly alertasService: AlertasService) {}

  @Post()
  async create(@Body() createAlertaDto: CreateAlertaDto) {
    return this.alertasService.create(createAlertaDto);
  }

  @Get('campaign/:campaignId')
  async findByCampaign(
    @Param('campaignId') campaignId: string,
    @Query('estado') estado?: string,
  ) {
    return this.alertasService.findByCampaign(campaignId, estado);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.alertasService.findOne(id);
  }

  @Put(':id/resolver')
  async resolver(@Param('id') id: string, @Body('resolucion') resolucion: string) {
    return this.alertasService.resolver(id, resolucion);
  }

  @Put(':id/descartar')
  async descartar(@Param('id') id: string) {
    return this.alertasService.descartar(id);
  }

  @Get('campaign/:campaignId/criticas')
  async getCriticas(@Param('campaignId') campaignId: string) {
    return this.alertasService.getCriticas(campaignId);
  }
}
