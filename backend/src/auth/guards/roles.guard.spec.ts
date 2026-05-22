import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  it('returns true when no roles are required', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(
      guard.canActivate({
        getHandler: () => undefined,
        getClass: () => undefined,
        switchToHttp: () => ({ getRequest: () => ({ user: {} }) }),
      } as any),
    ).toBe(true);
  });

  it('matches required role', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['SUPER_ADMIN']),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(
      guard.canActivate({
        getHandler: () => undefined,
        getClass: () => undefined,
        switchToHttp: () => ({ getRequest: () => ({ user: { roles: ['SUPER_ADMIN'] } }) }),
      } as any),
    ).toBe(true);
  });
});
