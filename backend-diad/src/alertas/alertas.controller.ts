import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AlertasService } from './alertas.service';
import { CreateAlertaDto } from './dto/create-alerta.dto';
import { CampaignParamGuard, assertCampaignAccess, JwtUser } from '../auth/campaign-access';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('alertas')
export class AlertasController {
  constructor(private readonly alertasService: AlertasService) {}

  @Post()
  async create(@Body() createAlertaDto: CreateAlertaDto, @CurrentUser() user: JwtUser) {
    assertCampaignAccess(user, createAlertaDto.campaign_id);
    return this.alertasService.create(createAlertaDto);
  }

  @Get('campaign/:campaignId')
  @UseGuards(CampaignParamGuard)
  async findByCampaign(@Param('campaignId') campaignId: string, @Query('estado') estado?: string) {
    return this.alertasService.findByCampaign(campaignId, estado);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.alertasService.findOne(id, user);
  }

  @Put(':id/resolver')
  async resolver(
    @Param('id') id: string,
    @Body('resolucion') resolucion: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.alertasService.resolver(id, resolucion, user);
  }

  @Put(':id/descartar')
  async descartar(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.alertasService.descartar(id, user);
  }

  @Get('campaign/:campaignId/criticas')
  @UseGuards(CampaignParamGuard)
  async getCriticas(@Param('campaignId') campaignId: string) {
    return this.alertasService.getCriticas(campaignId);
  }
}
