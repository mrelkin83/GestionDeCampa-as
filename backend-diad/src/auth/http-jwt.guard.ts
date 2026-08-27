import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { IS_PUBLIC_KEY } from './public.decorator';

/**
 * HttpJwtGuard
 *
 * Guard global para el API REST. Antes de este guard, actas/alertas/conteo/
 * testigos.controller.ts no tenían ningún @UseGuards: cualquiera en internet
 * podía crear, editar, validar o rechazar actas sin token. A diferencia de
 * WsJwtGuard (que permite conexiones sin token fuera de NODE_ENV=production
 * por conveniencia de desarrollo), este guard falla cerrado siempre: no hay
 * forma segura de "modo desarrollo sin auth" para un API REST cuando el
 * despliegue real depende de que NODE_ENV esté bien configurado.
 */
@Injectable()
export class HttpJwtGuard implements CanActivate {
  private readonly logger = new Logger(HttpJwtGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers?.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    if (!token) {
      throw new UnauthorizedException('Token requerido');
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      this.logger.error('❌ JWT_SECRET no configurado: rechazando petición HTTP');
      throw new UnauthorizedException('Autenticación no disponible');
    }

    try {
      const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
      request.user = payload;
      return true;
    } catch (error) {
      this.logger.warn(`⚠️  Token inválido: ${error.message}`);
      throw new UnauthorizedException('Token inválido');
    }
  }
}
