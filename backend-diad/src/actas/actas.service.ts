import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Acta } from './entities/acta.entity';
import { CreateActaDto } from './dto/create-acta.dto';
import { UpdateActaDto } from './dto/update-acta.dto';
import { QueryActasDto } from './dto/query-actas.dto';
import { ActasGateway } from './actas.gateway';

@Injectable()
export class ActasService {
  private readonly logger = new Logger(ActasService.name);

  constructor(
    @InjectRepository(Acta)
    private readonly actaRepository: Repository<Acta>,
    @InjectQueue('actas')
    private readonly actasQueue: Queue,
    private readonly actasGateway: ActasGateway,
    private readonly configService: ConfigService,
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
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    const bucket = this.configService.get<string>('AWS_S3_BUCKET_ACTAS');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

    if (!bucket || !accessKeyId || !secretAccessKey) {
      // Sin credenciales no hay forma real de subir el archivo: antes esto
      // devolvía una URL falsa (https://s3.amazonaws.com/.../{timestamp}-...)
      // que nunca apuntaba a nada real, perdiendo silenciosamente la foto del
      // acta. Es preferible fallar la petición explícitamente.
      this.logger.error(
        '❌ Credenciales de S3 no configuradas: no se puede subir la evidencia del acta',
      );
      throw new BadRequestException(
        'El almacenamiento de evidencias no está configurado en el servidor',
      );
    }

    const client = new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
    const key = `actas/${Date.now()}-${file.originalname}`;

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  }
}
