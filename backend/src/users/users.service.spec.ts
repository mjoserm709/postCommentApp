import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';

jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn().mockResolvedValue(false),
}));

describe('UsersService', () => {
  let service: UsersService;
  let mockUserModel: any;

  beforeEach(async () => {
    mockUserModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('throws on duplicated username/email during create', async () => {
    mockUserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: '1' }) });

    await expect(
      service.create({
        username: 'maria',
        email: 'maria@test.com',
        password: '123456',
        firstName: 'Maria',
        lastName: 'Ramirez',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('throws when update payload tries to include password', async () => {
    mockUserModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: '1' }) });

    await expect(service.update('1', { password: 'hack' } as any)).rejects.toThrow(BadRequestException);
  });

  it('throws when user is missing on remove', async () => {
    mockUserModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

    await expect(service.remove('404')).rejects.toThrow(NotFoundException);
  });
});
