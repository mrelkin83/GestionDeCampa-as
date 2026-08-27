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

@Controller('actas')
export class ActasController {
  constructor(private readonly actasService: ActasService) {}

  @Post()
  @UseInterceptors(FileInterceptor('imagen'))
  @HttpCode(HttpStatus.CREATED)
  async create(@UploadedFile() file: Express.Multer.File, @Body() createActaDto: CreateActaDto) {
    return this.actasService.create(createActaDto, file);
  }

  @Get()
  async findAll(@Query() query: QueryActasDto) {
    return this.actasService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.actasService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateActaDto: UpdateActaDto) {
    return this.actasService.update(id, updateActaDto);
  }

  @Put(':id/validar')
  async validar(@Param('id') id: string) {
    return this.actasService.validar(id);
  }

  @Put(':id/rechazar')
  async rechazar(@Param('id') id: string, @Body('razon') razon: string) {
    return this.actasService.rechazar(id, razon);
  }

  @Post(':id/procesar-ocr')
  async procesarOcr(@Param('id') id: string) {
    return this.actasService.procesarOcr(id);
  }

  @Get('mesa/:mesaId')
  async findByMesa(@Param('mesaId') mesaId: string) {
    return this.actasService.findByMesa(mesaId);
  }

  @Get('testigo/:testigoId')
  async findByTestigo(@Param('testigoId') testigoId: string) {
    return this.actasService.findByTestigo(testigoId);
  }
}
