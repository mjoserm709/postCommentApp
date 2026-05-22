import { ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from './schemas/role.schema';
import { RolesService } from './roles.service';

describe('RolesService', () => {
  let service: RolesService;
  let roleModel: any;

  beforeEach(async () => {
    roleModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: getModelToken(Role.name), useValue: roleModel },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('rejects duplicate key on create', async () => {
    roleModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: '1' }) });

    await expect(
      service.create({ key: 'ADMIN', name: 'Admin', description: 'Admin role' }),
    ).rejects.toThrow(ConflictException);
  });

  it('rejects update when role does not exist', async () => {
    roleModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

    await expect(service.update('404', { name: 'x' })).rejects.toThrow(NotFoundException);
  });
});
