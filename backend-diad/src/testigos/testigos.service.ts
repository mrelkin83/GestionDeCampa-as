import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testigo } from './entities/testigo.entity';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { QueryTestigosDto } from './dto/query-testigos.dto';
import { TestigosGateway } from './testigos.gateway';
import { assertCampaignAccess, JwtUser } from '../auth/campaign-access';

@Injectable()
export class TestigosService {
  constructor(
    @InjectRepository(Testigo)
    private readonly testigoRepository: Repository<Testigo>,
    private readonly testigosGateway: TestigosGateway,
  ) {}

  async findAll(query: QueryTestigosDto, user: JwtUser) {
    // Sin campaignId, esto listaba testigos de TODAS las campañas. Se
    // exige el campaignId y se valida acceso (fail closed).
    assertCampaignAccess(user, query.campaignId);

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

  async findOne(id: string, user?: JwtUser) {
    const testigo = await this.testigoRepository.findOne({ where: { id } });
    if (!testigo) {
      throw new NotFoundException(`Testigo ${id} no encontrado`);
    }
    if (user) {
      assertCampaignAccess(user, testigo.campaign_id);
    }
    return testigo;
  }

  async updateEstado(id: string, dto: UpdateEstadoDto, user: JwtUser) {
    const testigo = await this.findOne(id, user);
    testigo.estado_conexion = dto.estado;
    testigo.last_seen_at = new Date();

    if (dto.ubicacion_gps) {
      testigo.ubicacion_gps = dto.ubicacion_gps;
    }

    const updated = await this.testigoRepository.save(testigo);
    this.testigosGateway.notifyEstadoChanged(updated);

    return updated;
  }

  async getActividad(id: string, user: JwtUser) {
    await this.findOne(id, user);
    // TODO: Get activity from logs table
    return { testigoId: id, actividades: [] };
  }

  async checkin(id: string, body: any, user: JwtUser) {
    const testigo = await this.findOne(id, user);
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
