import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConteoResultado } from './entities/conteo-resultado.entity';
import { ConteoGateway } from './conteo.gateway';

@Injectable()
export class ConteoService {
  constructor(
    @InjectRepository(ConteoResultado)
    private readonly conteoRepository: Repository<ConteoResultado>,
    private readonly conteoGateway: ConteoGateway,
  ) {}

  async getTiempoReal(campaignId: string) {
    // Get latest counting results for all candidates
    const resultados = await this.conteoRepository
      .createQueryBuilder('conteo')
      .where('conteo.campaign_id = :campaignId', { campaignId })
      .orderBy('conteo.updated_at', 'DESC')
      .getMany();

    return {
      campaignId,
      timestamp: new Date(),
      resultados,
    };
  }

  async getPorCircunscripcion(campaignId: string, circunscripcionId?: string) {
    const query = this.conteoRepository
      .createQueryBuilder('conteo')
      .where('conteo.campaign_id = :campaignId', { campaignId });

    if (circunscripcionId) {
      query.andWhere('conteo.circunscripcion_id = :circunscripcionId', {
        circunscripcionId,
      });
    }

    const resultados = await query.getMany();

    return {
      campaignId,
      circunscripcionId,
      resultados,
    };
  }

  async getPorZona(campaignId: string, zonaId?: string) {
    const query = this.conteoRepository
      .createQueryBuilder('conteo')
      .where('conteo.campaign_id = :campaignId', { campaignId });

    if (zonaId) {
      query.andWhere('conteo.zona_id = :zonaId', { zonaId });
    }

    const resultados = await query.getMany();

    return {
      campaignId,
      zonaId,
      resultados,
    };
  }

  async getResumen(campaignId: string) {
    const resultados = await this.conteoRepository
      .createQueryBuilder('conteo')
      .select('SUM(conteo.total_votos)', 'total_votos')
      .addSelect('SUM(conteo.total_mesas)', 'total_mesas')
      .addSelect('SUM(conteo.mesas_reportadas)', 'mesas_reportadas')
      .addSelect('conteo.campaign_id', 'campaign_id')
      .where('conteo.campaign_id = :campaignId', { campaignId })
      .groupBy('conteo.campaign_id')
      .getRawOne();

    const porcentaje_avance = resultados
      ? (resultados.mesas_reportadas / resultados.total_mesas) * 100
      : 0;

    return {
      campaignId,
      timestamp: new Date(),
      total_votos: parseInt(resultados?.total_votos || '0'),
      total_mesas: parseInt(resultados?.total_mesas || '0'),
      mesas_reportadas: parseInt(resultados?.mesas_reportadas || '0'),
      porcentaje_avance: Math.round(porcentaje_avance * 100) / 100,
    };
  }

  async getTendencias(campaignId: string) {
    // Get counting trends over time
    const resultados = await this.conteoRepository
      .createQueryBuilder('conteo')
      .where('conteo.campaign_id = :campaignId', { campaignId })
      .orderBy('conteo.created_at', 'ASC')
      .getMany();

    return {
      campaignId,
      timestamp: new Date(),
      tendencias: resultados,
    };
  }

  async actualizarConteo(campaignId: string, data: any) {
    // Update counting and notify via WebSocket
    this.conteoGateway.notifyConteoActualizado(campaignId, data);
  }
}
