import { Module } from '@nestjs/common';
import { PreconteoGateway } from './preconteo.gateway';
import { RedisPreconteoSubscriberService } from './redis-subscriber.service';

/**
 * PreconteoModule
 *
 * Módulo para el sistema de preconteo electoral con WebSockets.
 * Proporciona actualizaciones en tiempo real de resultados.
 *
 * PreconteoService (procesarNuevaActa/calcularAgregados/obtenerProgreso)
 * se eliminó: era código muerto -nunca se inyectaba en ningún controlador
 * ni gateway, solo devolvía ceros hardcodeados. Los datos reales de
 * preconteo viven en backend-core (Laravel); este módulo solo retransmite
 * por WebSocket lo que backend-core publica en Redis
 * (RedisPreconteoSubscriberService).
 */
@Module({
  providers: [PreconteoGateway, RedisPreconteoSubscriberService],
  exports: [PreconteoGateway],
})
export class PreconteoModule {}
