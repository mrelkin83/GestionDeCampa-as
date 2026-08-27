import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ActasService } from './actas.service';
import { CreateActaDto } from './dto/create-acta.dto';
import { UpdateActaDto } from './dto/update-acta.dto';
import { QueryActasDto } from './dto/query-actas.dto';
import { assertCampaignAccess, JwtUser } from '../auth/campaign-access';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('actas')
export class ActasController {
  constructor(private readonly actasService: ActasService) {}

  @Post()
  @UseInterceptors(FileInterceptor('imagen'))
  @HttpCode(HttpStatus.CREATED)
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createActaDto: CreateActaDto,
    @CurrentUser() user: JwtUser,
  ) {
    assertCampaignAccess(user, createActaDto.campaign_id);
    return this.actasService.create(createActaDto, file);
  }

  @Get()
  async findAll(@Query() query: QueryActasDto, @CurrentUser() user: JwtUser) {
    return this.actasService.findAll(query, user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.actasService.findOne(id, user);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateActaDto: UpdateActaDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.actasService.update(id, updateActaDto, user);
  }

  @Put(':id/validar')
  async validar(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.actasService.validar(id, user);
  }

  @Put(':id/rechazar')
  async rechazar(
    @Param('id') id: string,
    @Body('razon') razon: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.actasService.rechazar(id, razon, user);
  }

  @Post(':id/procesar-ocr')
  async procesarOcr(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.actasService.procesarOcr(id, user);
  }

  @Get('mesa/:mesaId')
  async findByMesa(@Param('mesaId') mesaId: string, @CurrentUser() user: JwtUser) {
    return this.actasService.findByMesa(mesaId, user);
  }

  @Get('testigo/:testigoId')
  async findByTestigo(@Param('testigoId') testigoId: string, @CurrentUser() user: JwtUser) {
    return this.actasService.findByTestigo(testigoId, user);
  }
}
