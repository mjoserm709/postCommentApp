import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions('roles.read')
  findAll() {
    return this.rolesService.findAll();
  }

  @Post()
  @RequirePermissions('roles.create')
  create(@Body() createRoleDto: CreateRoleDto, @Req() request: Request) {
    return this.rolesService.create(createRoleDto, (request.user as { userId?: string } | undefined)?.userId);
  }

  @Patch(':id')
  @RequirePermissions('roles.update')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto, @Req() request: Request) {
    return this.rolesService.update(id, updateRoleDto, (request.user as { userId?: string } | undefined)?.userId);
  }

  @Delete(':id')
  @RequirePermissions('roles.delete')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
