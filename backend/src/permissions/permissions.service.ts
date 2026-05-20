import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
  ) {}

  findAll() {
    return this.permissionModel.find().sort({ module: 1, key: 1 }).exec();
  }

  findActive() {
    return this.permissionModel.find({ isActive: true }).sort({ module: 1, key: 1 }).exec();
  }

  async create(createPermissionDto: CreatePermissionDto) {
    const existingPermission = await this.permissionModel
      .findOne({ key: createPermissionDto.key })
      .exec();

    if (existingPermission) {
      throw new ConflictException('Permission key already exists');
    }

    return this.permissionModel.create({
      ...createPermissionDto,
      key: createPermissionDto.key.trim(),
      module: createPermissionDto.module.trim(),
      isActive: createPermissionDto.isActive ?? true,
    });
  }
}
