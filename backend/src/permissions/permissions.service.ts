import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

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

  async create(createPermissionDto: CreatePermissionDto, actorId?: string) {
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
      createdBy: actorId ? new Types.ObjectId(actorId) : undefined,
    });
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto, actorId?: string) {
    const existingPermission = await this.permissionModel.findById(id).exec();

    if (!existingPermission) {
      throw new NotFoundException('Permission not found');
    }

    // Check if key is being updated and if it already exists
    if (updatePermissionDto.key && updatePermissionDto.key !== existingPermission.key) {
      const permissionWithKey = await this.permissionModel
        .findOne({ key: updatePermissionDto.key })
        .exec();

      if (permissionWithKey) {
        throw new ConflictException('Permission key already exists');
      }
    }

    return this.permissionModel.findByIdAndUpdate(
      id,
      {
        ...updatePermissionDto,
        key: updatePermissionDto.key?.trim() ?? undefined,
        module: updatePermissionDto.module?.trim() ?? undefined,
        updatedBy: actorId ? new Types.ObjectId(actorId) : undefined,
      },
      { new: true },
    ).exec();
  }

  async remove(id: string) {
    const existingPermission = await this.permissionModel.findById(id).exec();

    if (!existingPermission) {
      throw new NotFoundException('Permission not found');
    }

    return this.permissionModel.findByIdAndDelete(id).exec();
  }
}
