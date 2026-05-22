import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let rolesService: jest.Mocked<RolesService>;

  beforeEach(() => {
    usersService = {
      findByUsername: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;
    jwtService = {
      sign: jest.fn().mockReturnValue('signed-token'),
    } as unknown as jest.Mocked<JwtService>;
    rolesService = {
      findActiveByKeys: jest.fn().mockResolvedValue([{ permissions: ['users.read', 'users.update'] } as any]),
    } as unknown as jest.Mocked<RolesService>;

    service = new AuthService(usersService, jwtService, rolesService);
  });

  it('returns token and merged permissions for active user', async () => {
    usersService.findByUsername.mockResolvedValue({
      password: 'hashed',
      toObject: () => ({
        _id: 'user-1',
        username: 'maria',
        roles: ['ADMIN'],
        isActive: true,
      }),
    } as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.login({ username: 'maria', password: 'secret' });

    expect(result.access_token).toBe('signed-token');
    expect(result.user.permissions).toEqual(['users.read', 'users.update']);
    expect(jwtService.sign).toHaveBeenCalled();
  });

  it('rejects invalid credentials', async () => {
    usersService.findByUsername.mockRejectedValue(new Error('not found'));

    await expect(service.login({ username: 'bad', password: 'bad' })).rejects.toThrow(UnauthorizedException);
  });

  it('rejects inactive users', async () => {
    usersService.findByUsername.mockResolvedValue({
      password: 'hashed',
      toObject: () => ({
        _id: 'user-1',
        username: 'maria',
        roles: ['ADMIN'],
        isActive: false,
      }),
    } as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await expect(service.login({ username: 'maria', password: 'secret' })).rejects.toThrow(ForbiddenException);
  });
});
