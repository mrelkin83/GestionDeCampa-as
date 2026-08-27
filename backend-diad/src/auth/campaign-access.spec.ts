import { ForbiddenException } from '@nestjs/common';
import { hasCampaignAccess, assertCampaignAccess, JwtUser } from './campaign-access';

describe('hasCampaignAccess', () => {
  it('deniega el acceso si no hay usuario', () => {
    expect(hasCampaignAccess(undefined, '1')).toBe(false);
  });

  it('super_admin tiene acceso sin importar el campaignId (incluso undefined)', () => {
    const user: JwtUser = { sub: 1, email: 'a@b.com', role: 'super_admin' };
    expect(hasCampaignAccess(user, 'cualquier-uuid')).toBe(true);
    expect(hasCampaignAccess(user, undefined)).toBe(true);
  });

  it('deniega el acceso si no se pide ningún campaignId y el usuario no es super_admin', () => {
    const user: JwtUser = { sub: 1, email: 'a@b.com', role: 'coordinador', campanas: [1, 2] };
    expect(hasCampaignAccess(user, undefined)).toBe(false);
  });

  it('permite el acceso si el campaignId (entero) está en los claims del usuario', () => {
    const user: JwtUser = { sub: 1, email: 'a@b.com', role: 'coordinador', campanas: [1, 2, 3] };
    expect(hasCampaignAccess(user, 2)).toBe(true);
    expect(hasCampaignAccess(user, '2')).toBe(true);
  });

  it('deniega el acceso a una campaña que no está en los claims del usuario', () => {
    const user: JwtUser = { sub: 1, email: 'a@b.com', role: 'coordinador', campanas: [1, 2, 3] };
    expect(hasCampaignAccess(user, 99)).toBe(false);
  });

  it('un campaignId con formato UUID nunca coincide con los IDs enteros del JWT', () => {
    const user: JwtUser = { sub: 1, email: 'a@b.com', role: 'coordinador', campanas: [1, 2, 3] };
    expect(hasCampaignAccess(user, '550e8400-e29b-41d4-a716-446655440000')).toBe(false);
  });
});

describe('assertCampaignAccess', () => {
  it('no lanza si el acceso está permitido', () => {
    const user: JwtUser = { sub: 1, email: 'a@b.com', role: 'super_admin' };
    expect(() => assertCampaignAccess(user, 'x')).not.toThrow();
  });

  it('lanza ForbiddenException si el acceso está denegado', () => {
    const user: JwtUser = { sub: 1, email: 'a@b.com', role: 'coordinador', campanas: [1] };
    expect(() => assertCampaignAccess(user, 2)).toThrow(ForbiddenException);
  });
});
