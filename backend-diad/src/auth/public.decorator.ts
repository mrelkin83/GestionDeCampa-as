import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marca un endpoint HTTP como accesible sin JWT (p. ej. health checks).
 * Usar con moderación: por defecto todo el API REST requiere autenticación.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
