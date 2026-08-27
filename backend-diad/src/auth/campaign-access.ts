import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

export interface JwtUser {
  sub: number;
  email: string;
  role?: string;
  campanas?: number[];
}

/**
 * Autorización por campaña para el API REST de Actas/Alertas/Conteo/
 * Testigos. Antes ningún endpoint verificaba pertenencia a campaña más
 * allá de "tener un JWT válido": cualquier usuario autenticado podía leer,
 * validar, rechazar o actualizar actas/alertas/testigos de CUALQUIER
 * campaña con solo conocer el ID -el resto del sistema (backend-core)
 * siempre valida esto vía User::hasAccessToCampana().
 *
 * Nota importante: las entidades de estos módulos usan campaign_id como
 * UUID (ver entities/*.entity.ts), mientras que "campanas" en el JWT trae
 * los IDs enteros reales de backend-core (campanas.id). No existe ninguna
 * correspondencia válida entre ambos formatos hoy -nada en el sistema real
 * crea o asocia estos UUIDs a una campaña real (este subsistema no tiene
 * ningún consumidor actual en frontend-web/pwa-testigos/app-movil-testigos;
 * el único puente real Laravel->backend-diad es el WebSocket de
 * preconteo). Por eso Number(uuid) nunca coincide con ningún elemento de
 * "campanas": el resultado práctico es que solo super_admin puede usar
 * estos endpoints hasta que exista una relación real de pertenencia -es el
 * comportamiento seguro por defecto (fail closed), no un bug de esta
 * función.
 */
export function hasCampaignAccess(
  user: JwtUser | undefined,
  campaignId: string | number | undefined | null,
): boolean {
  if (!user) {
    return false;
  }
  if (user.role === 'super_admin') {
    return true;
  }
  if (campaignId === undefined || campaignId === null) {
    return false;
  }
  const campanas = Array.isArray(user.campanas) ? user.campanas : [];
  return campanas.includes(Number(campaignId));
}

export function assertCampaignAccess(
  user: JwtUser | undefined,
  campaignId: string | number | undefined | null,
): void {
  if (!hasCampaignAccess(user, campaignId)) {
    throw new ForbiddenException('No tiene acceso a esta campaña');
  }
}

/**
 * Para rutas donde campaignId viene directo en los params (ej.
 * GET /conteo/campaign/:campaignId/tiempo-real).
 */
@Injectable()
export class CampaignParamGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    assertCampaignAccess(request.user, request.params?.campaignId);
    return true;
  }
}
