import { ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Permission } from './schemas/permission.schema';
import { PermissionsService } from './permissions.service';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let permissionModel: any;

  beforeEach(async () => {
    permissionModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        { provide: getModelToken(Permission.name), useValue: permissionModel },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
  });

  it('rejects duplicate key on create', async () => {
    permissionModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: '1' }) });

    await expect(
      service.create({ key: 'posts.read', name: 'Read posts', module: 'posts', description: 'Read posts' }),
    ).rejects.toThrow(ConflictException);
  });

  it('rejects update when permission does not exist', async () => {
    permissionModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

    await expect(service.update('404', { name: 'x' })).rejects.toThrow(NotFoundException);
  });
});
