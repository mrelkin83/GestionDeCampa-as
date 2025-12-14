import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Acta } from './entities/acta.entity';
import { CreateActaDto } from './dto/create-acta.dto';
import { UpdateActaDto } from './dto/update-acta.dto';
import { QueryActasDto } from './dto/query-actas.dto';
import { ActasGateway } from './actas.gateway';

@Injectable()
export class ActasService {
  constructor(
    @InjectRepository(Acta)
    private readonly actaRepository: Repository<Acta>,
    @InjectQueue('actas')
    private readonly actasQueue: Queue,
    private readonly actasGateway: ActasGateway,
  ) {}

  async create(createActaDto: CreateActaDto, file?: Express.Multer.File) {
    const acta = this.actaRepository.create({
      ...createActaDto,
      imagen_url: file ? await this.uploadToS3(file) : null,
      estado: 'pendiente',
      created_at: new Date(),
    });

    const savedActa = await this.actaRepository.save(acta);

    // Emit WebSocket event
    this.actasGateway.notifyNewActa(savedActa);

    // Queue OCR processing if image exists
    if (file) {
      await this.actasQueue.add('process-ocr', {
        actaId: savedActa.id,
        imageUrl: savedActa.imagen_url,
      });
    }

    return savedActa;
  }

  async findAll(query: QueryActasDto) {
    const queryBuilder = this.actaRepository.createQueryBuilder('acta');

    if (query.campaignId) {
      queryBuilder.andWhere('acta.campaign_id = :campaignId', {
        campaignId: query.campaignId,
      });
    }

    if (query.estado) {
      queryBuilder.andWhere('acta.estado = :estado', { estado: query.estado });
    }

    if (query.mesaId) {
      queryBuilder.andWhere('acta.mesa_id = :mesaId', { mesaId: query.mesaId });
    }

    if (query.testigoId) {
      queryBuilder.andWhere('acta.testigo_id = :testigoId', {
        testigoId: query.testigoId,
      });
    }

    const [items, total] = await queryBuilder
      .orderBy('acta.created_at', 'DESC')
      .skip(query.offset || 0)
      .take(query.limit || 50)
      .getManyAndCount();

    return {
      items,
      total,
      offset: query.offset || 0,
      limit: query.limit || 50,
    };
  }

  async findOne(id: string) {
    const acta = await this.actaRepository.findOne({ where: { id } });
    if (!acta) {
      throw new NotFoundException(`Acta ${id} no encontrada`);
    }
    return acta;
  }

  async update(id: string, updateActaDto: UpdateActaDto) {
    const acta = await this.findOne(id);
    Object.assign(acta, updateActaDto);
    acta.updated_at = new Date();

    const updated = await this.actaRepository.save(acta);
    this.actasGateway.notifyActaUpdated(updated);

    return updated;
  }

  async validar(id: string) {
    const acta = await this.findOne(id);
    acta.estado = 'validada';
    acta.validada_at = new Date();
    acta.updated_at = new Date();

    const validated = await this.actaRepository.save(acta);
    this.actasGateway.notifyActaValidated(validated);

    return validated;
  }

  async rechazar(id: string, razon: string) {
    const acta = await this.findOne(id);
    acta.estado = 'rechazada';
    acta.rechazo_razon = razon;
    acta.updated_at = new Date();

    const rejected = await this.actaRepository.save(acta);
    this.actasGateway.notifyActaRejected(rejected);

    return rejected;
  }

  async procesarOcr(id: string) {
    const acta = await this.findOne(id);

    if (!acta.imagen_url) {
      throw new BadRequestException('Acta no tiene imagen para procesar');
    }

    await this.actasQueue.add('process-ocr', {
      actaId: acta.id,
      imageUrl: acta.imagen_url,
    });

    return { message: 'OCR procesamiento iniciado', actaId: id };
  }

  async findByMesa(mesaId: string) {
    return this.actaRepository.find({
      where: { mesa_id: mesaId },
      order: { created_at: 'DESC' },
    });
  }

  async findByTestigo(testigoId: string) {
    return this.actaRepository.find({
      where: { testigo_id: testigoId },
      order: { created_at: 'DESC' },
    });
  }

  private async uploadToS3(file: Express.Multer.File): Promise<string> {
    // TODO: Implement S3 upload
    // For now, return placeholder
    const timestamp = Date.now();
    return `https://s3.amazonaws.com/electoral-actas/actas/${timestamp}-${file.originalname}`;
  }
}
