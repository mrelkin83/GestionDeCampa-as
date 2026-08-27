import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TestigosService } from './testigos.service';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { QueryTestigosDto } from './dto/query-testigos.dto';
import { CampaignParamGuard, JwtUser } from '../auth/campaign-access';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('testigos')
export class TestigosController {
  constructor(private readonly testigosService: TestigosService) {}

  @Get()
  async findAll(@Query() query: QueryTestigosDto, @CurrentUser() user: JwtUser) {
    return this.testigosService.findAll(query, user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.testigosService.findOne(id, user);
  }

  @Put(':id/estado')
  async updateEstado(
    @Param('id') id: string,
    @Body() dto: UpdateEstadoDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.testigosService.updateEstado(id, dto, user);
  }

  @Get(':id/actividad')
  async getActividad(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.testigosService.getActividad(id, user);
  }

  @Post(':id/checkin')
  async checkin(@Param('id') id: string, @Body() body: any, @CurrentUser() user: JwtUser) {
    return this.testigosService.checkin(id, body, user);
  }

  @Get('campaign/:campaignId/activos')
  @UseGuards(CampaignParamGuard)
  async getActivosByCampaign(@Param('campaignId') campaignId: string) {
    return this.testigosService.getActivosByCampaign(campaignId);
  }
}
