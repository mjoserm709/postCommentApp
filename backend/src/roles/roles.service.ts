import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { CreateRoleDto } from './dto/create-role.dto';

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
}
