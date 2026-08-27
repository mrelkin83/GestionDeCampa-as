import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { PreconteoGateway } from './preconteo.gateway';

/**
 * RedisPreconteoSubscriberService
 *
 * backend-core (Laravel) publica en el canal Redis "preconteo:actualizaciones"
 * cada vez que un acta es validada (ver RecalcularAgregadosJob::emitirActualizacionWebSocket
 * en backend-core). Sin este suscriptor, PreconteoGateway.emitirActualizacionResultados()
 * nunca se invocaba desde ningún sitio: los clientes WebSocket jamás recibían
 * actualizaciones en tiempo real de resultados, pese a que la infraestructura
 * de broadcast ya existía en el gateway.
 */
@Injectable()
export class RedisPreconteoSubscriberService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisPreconteoSubscriberService.name);
  private readonly channel = 'preconteo:actualizaciones';
  private subClient: RedisClientType;

  constructor(
    private readonly configService: ConfigService,
    private readonly preconteoGateway: PreconteoGateway,
  ) {}

  async onModuleInit(): Promise<void> {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD');

    this.subClient = createClient({
      url: password ? `redis://:${password}@${host}:${port}` : `redis://${host}:${port}`,
    });

    this.subClient.on('error', (error) =>
      this.logger.error(`❌ Error en cliente Redis (subscriber): ${error.message}`),
    );

    await this.subClient.connect();
    await this.subClient.subscribe(this.channel, (message) => this.handleMessage(message));

    this.logger.log(`📡 Suscrito al canal Redis "${this.channel}"`);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.subClient) {
      await this.subClient.unsubscribe(this.channel);
      await this.subClient.disconnect();
    }
  }

  private handleMessage(message: string): void {
    try {
      const payload = JSON.parse(message);
      const { scope_type, scope_id, election_position_id } = payload;

      if (!scope_type || scope_id === undefined || election_position_id === undefined) {
        this.logger.warn(`⚠️  Mensaje de "${this.channel}" con payload incompleto`, payload);
        return;
      }

      this.preconteoGateway.emitirActualizacionResultados(
        scope_type,
        scope_id,
        election_position_id,
        payload,
      );
    } catch (error) {
      this.logger.error(`❌ Error procesando mensaje de "${this.channel}": ${error.message}`);
    }
  }
}
