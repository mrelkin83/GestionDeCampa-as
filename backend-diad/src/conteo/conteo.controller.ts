import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ConteoService } from './conteo.service';
import { CampaignParamGuard } from '../auth/campaign-access';

// Todas las rutas de este controlador toman :campaignId directo en la URL.
@Controller('conteo')
@UseGuards(CampaignParamGuard)
export class ConteoController {
  constructor(private readonly conteoService: ConteoService) {}

  @Get('campaign/:campaignId/tiempo-real')
  async getTiempoReal(@Param('campaignId') campaignId: string) {
    return this.conteoService.getTiempoReal(campaignId);
  }

  @Get('campaign/:campaignId/por-circunscripcion')
  async getPorCircunscripcion(
    @Param('campaignId') campaignId: string,
    @Query('circunscripcionId') circunscripcionId?: string,
  ) {
    return this.conteoService.getPorCircunscripcion(campaignId, circunscripcionId);
  }

  @Get('campaign/:campaignId/por-zona')
  async getPorZona(@Param('campaignId') campaignId: string, @Query('zonaId') zonaId?: string) {
    return this.conteoService.getPorZona(campaignId, zonaId);
  }

  @Get('campaign/:campaignId/resumen')
  async getResumen(@Param('campaignId') campaignId: string) {
    return this.conteoService.getResumen(campaignId);
  }

  @Get('campaign/:campaignId/tendencias')
  async getTendencias(@Param('campaignId') campaignId: string) {
    return this.conteoService.getTendencias(campaignId);
  }
}
