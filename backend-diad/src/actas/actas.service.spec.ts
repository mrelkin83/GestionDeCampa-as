import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ActasService } from './actas.service';
import { JwtUser } from '../auth/campaign-access';

describe('ActasService - autorización por campaña', () => {
  let service: ActasService;
  let repo: { findOne: jest.Mock; save: jest.Mock };
  let gateway: { notifyActaValidated: jest.Mock };

  const acta = { id: 'acta-1', campaign_id: 'campaign-uuid-1', estado: 'pendiente' };

  beforeEach(() => {
    repo = {
      findOne: jest.fn().mockResolvedValue(acta),
      save: jest.fn().mockImplementation((a) => Promise.resolve(a)),
    };
    gateway = { notifyActaValidated: jest.fn() };

    service = new ActasService(
      repo as any,
      {} as any, // Queue (no se usa en validar())
      gateway as any,
      {} as any, // ConfigService (no se usa en validar())
    );
  });

  it('rechaza validar() de un usuario sin acceso a la campaña del acta', async () => {
    const user: JwtUser = { sub: 1, email: 'a@b.com', role: 'coordinador', campanas: [] };

    await expect(service.validar('acta-1', user)).rejects.toThrow(ForbiddenException);
    expect(gateway.notifyActaValidated).not.toHaveBeenCalled();
  });

  it('super_admin puede validar() cualquier acta', async () => {
    const user: JwtUser = { sub: 1, email: 'a@b.com', role: 'super_admin' };

    const result = await service.validar('acta-1', user);

    expect(result.estado).toBe('validada');
    expect(gateway.notifyActaValidated).toHaveBeenCalled();
  });

  it('propaga NotFoundException si el acta no existe, antes de revisar campaña', async () => {
    repo.findOne.mockResolvedValue(null);
    const user: JwtUser = { sub: 1, email: 'a@b.com', role: 'super_admin' };

    await expect(service.findOne('no-existe', user)).rejects.toThrow(NotFoundException);
  });
});
