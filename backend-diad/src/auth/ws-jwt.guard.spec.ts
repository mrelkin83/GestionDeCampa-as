import { Socket } from 'socket.io';
import { canAccessCampaign } from './ws-jwt.guard';

function mockClient(user: any): Socket {
  return { data: { user } } as unknown as Socket;
}

describe('canAccessCampaign', () => {
  it('deniega el acceso si el socket no tiene usuario autenticado', () => {
    expect(canAccessCampaign(mockClient(undefined), '1')).toBe(false);
  });

  it('permite el acceso si la campaña está en los claims del usuario', () => {
    const client = mockClient({ role: 'coordinador', campanas: [1, 2, 3] });
    expect(canAccessCampaign(client, '2')).toBe(true);
    expect(canAccessCampaign(client, 2)).toBe(true);
  });

  it('deniega el acceso a una campaña que no está en los claims del usuario', () => {
    const client = mockClient({ role: 'coordinador', campanas: [1, 2, 3] });
    expect(canAccessCampaign(client, '99')).toBe(false);
  });

  it('super_admin tiene acceso a cualquier campaña sin importar sus claims de campanas', () => {
    const client = mockClient({ role: 'super_admin', campanas: [] });
    expect(canAccessCampaign(client, '999')).toBe(true);
  });

  it('trata "campanas" ausente o mal formado como sin acceso', () => {
    const client = mockClient({ role: 'coordinador' });
    expect(canAccessCampaign(client, '1')).toBe(false);
  });
});
