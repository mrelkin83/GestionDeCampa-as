import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testigo } from './entities/testigo.entity';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { QueryTestigosDto } from './dto/query-testigos.dto';
import { TestigosGateway } from './testigos.gateway';

@Injectable()
export class TestigosService {
  constructor(
    @InjectRepository(Testigo)
    private readonly testigoRepository: Repository<Testigo>,
    private readonly testigosGateway: TestigosGateway,
  ) {}

  async findAll(query: QueryTestigosDto) {
    const queryBuilder = this.testigoRepository.createQueryBuilder('testigo');

    if (query.campaignId) {
      queryBuilder.andWhere('testigo.campaign_id = :campaignId', {
        campaignId: query.campaignId,
      });
    }

    if (query.estado) {
      queryBuilder.andWhere('testigo.estado_conexion = :estado', {
        estado: query.estado,
      });
    }

    const [items, total] = await queryBuilder
      .orderBy('testigo.last_seen_at', 'DESC')
      .skip(query.offset || 0)
      .take(query.limit || 50)
      .getManyAndCount();

    return { items, total, offset: query.offset || 0, limit: query.limit || 50 };
  }

  async findOne(id: string) {
    const testigo = await this.testigoRepository.findOne({ where: { id } });
    if (!testigo) {
      throw new NotFoundException(`Testigo ${id} no encontrado`);
    }
    return testigo;
  }

  async updateEstado(id: string, dto: UpdateEstadoDto) {
    const testigo = await this.findOne(id);
    testigo.estado_conexion = dto.estado;
    testigo.last_seen_at = new Date();

    if (dto.ubicacion_gps) {
      testigo.ubicacion_gps = dto.ubicacion_gps;
    }

    const updated = await this.testigoRepository.save(testigo);
    this.testigosGateway.notifyEstadoChanged(updated);

    return updated;
  }

  async getActividad(id: string) {
    // TODO: Get activity from logs table
    return { testigoId: id, actividades: [] };
  }

  async checkin(id: string, body: any) {
    const testigo = await this.findOne(id);
    testigo.estado_conexion = 'activo';
    testigo.last_seen_at = new Date();

    if (body.ubicacion_gps) {
      testigo.ubicacion_gps = body.ubicacion_gps;
    }

    const updated = await this.testigoRepository.save(testigo);
    this.testigosGateway.notifyCheckin(updated);

    return updated;
  }

  async getActivosByCampaign(campaignId: string) {
    return this.testigoRepository.find({
      where: {
        campaign_id: campaignId,
        estado_conexion: 'activo',
      },
      order: { last_seen_at: 'DESC' },
    });
  }
}
