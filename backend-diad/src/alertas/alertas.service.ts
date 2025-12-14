import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alerta } from './entities/alerta.entity';
import { CreateAlertaDto } from './dto/create-alerta.dto';
import { AlertasGateway } from './alertas.gateway';

@Injectable()
export class AlertasService {
  constructor(
    @InjectRepository(Alerta)
    private readonly alertaRepository: Repository<Alerta>,
    private readonly alertasGateway: AlertasGateway,
  ) {}

  async create(createAlertaDto: CreateAlertaDto) {
    const alerta = this.alertaRepository.create({
      ...createAlertaDto,
      estado: 'pendiente',
      created_at: new Date(),
    });

    const saved = await this.alertaRepository.save(alerta);
    this.alertasGateway.notifyNewAlerta(saved);

    return saved;
  }

  async findByCampaign(campaignId: string, estado?: string) {
    const query = this.alertaRepository
      .createQueryBuilder('alerta')
      .where('alerta.campaign_id = :campaignId', { campaignId });

    if (estado) {
      query.andWhere('alerta.estado = :estado', { estado });
    }

    return query.orderBy('alerta.created_at', 'DESC').getMany();
  }

  async findOne(id: string) {
    const alerta = await this.alertaRepository.findOne({ where: { id } });
    if (!alerta) {
      throw new NotFoundException(`Alerta ${id} no encontrada`);
    }
    return alerta;
  }

  async resolver(id: string, resolucion: string) {
    const alerta = await this.findOne(id);
    alerta.estado = 'resuelta';
    alerta.resolucion = resolucion;
    alerta.resuelta_at = new Date();

    const resolved = await this.alertaRepository.save(alerta);
    this.alertasGateway.notifyAlertaResuelta(resolved);

    return resolved;
  }

  async descartar(id: string) {
    const alerta = await this.findOne(id);
    alerta.estado = 'descartada';
    alerta.updated_at = new Date();

    const discarded = await this.alertaRepository.save(alerta);
    this.alertasGateway.notifyAlertaDescartada(discarded);

    return discarded;
  }

  async getCriticas(campaignId: string) {
    return this.alertaRepository.find({
      where: {
        campaign_id: campaignId,
        severidad: 'critica',
        estado: 'pendiente',
      },
      order: { created_at: 'DESC' },
    });
  }
}
