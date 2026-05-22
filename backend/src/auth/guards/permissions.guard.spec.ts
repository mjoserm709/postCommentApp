import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  it('allows when no permissions are required', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as unknown as Reflector;
    const guard = new PermissionsGuard(reflector);

    const result = guard.canActivate({
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({ getRequest: () => ({ user: {} }) }),
    } as any);

    expect(result).toBe(true);
  });

  it('allows super admin', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['users.read']),
    } as unknown as Reflector;
    const guard = new PermissionsGuard(reflector);

    const result = guard.canActivate({
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({ getRequest: () => ({ user: { roles: ['SUPER_ADMIN'] } }) }),
    } as any);

    expect(result).toBe(true);
  });
});
