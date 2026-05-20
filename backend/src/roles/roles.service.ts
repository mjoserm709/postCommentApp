import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  findAll() {
    return this.roleModel.find().sort({ key: 1 }).exec();
  }

  findActiveByKeys(keys: string[]) {
    return this.roleModel.find({ key: { $in: keys }, isActive: true }).exec();
  }

  async create(createRoleDto: CreateRoleDto) {
    const key = createRoleDto.key.trim().toUpperCase();
    const existingRole = await this.roleModel.findOne({ key }).exec();

    if (existingRole) {
      throw new ConflictException('Role key already exists');
    }

    return this.roleModel.create({
      ...createRoleDto,
      key,
      permissions: createRoleDto.permissions ?? [],
      isSystem: false,
      isActive: createRoleDto.isActive ?? true,
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const existingRole = await this.roleModel.findById(id).exec();

    if (!existingRole) {
      throw new NotFoundException('Role not found');
    }

    // Check if key is being updated and if it already exists
    if (updateRoleDto.key && updateRoleDto.key.trim().toUpperCase() !== existingRole.key) {
      const key = updateRoleDto.key.trim().toUpperCase();
      const roleWithKey = await this.roleModel.findOne({ key }).exec();

      if (roleWithKey) {
        throw new ConflictException('Role key already exists');
      }
    }

    return this.roleModel.findByIdAndUpdate(
      id,
      {
        ...updateRoleDto,
        key: updateRoleDto.key?.trim().toUpperCase() ?? undefined,
        permissions: updateRoleDto.permissions ?? [],
      },
      { new: true },
    ).exec();
  }

  async remove(id: string) {
    const existingRole = await this.roleModel.findById(id).exec();

    if (!existingRole) {
      throw new NotFoundException('Role not found');
    }

    return this.roleModel.findByIdAndDelete(id).exec();
  }
}
