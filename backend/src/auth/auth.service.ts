import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private rolesService: RolesService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<any> {
    try {
      const user = await this.usersService.findByUsername(loginDto.username);
      if (user && user.password && await bcrypt.compare(loginDto.password, user.password)) {
        const { password, passwordHistory, ...result } = user.toObject();
        return result;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isActive === false) {
      throw new ForbiddenException('User account is inactive');
    }
    
    const roles = await this.rolesService.findActiveByKeys(user.roles ?? []);
    const permissions = Array.from(
      new Set(roles.flatMap((role) => role.permissions ?? [])),
    );
    const authUser = { ...user, permissions };
    const payload = {
      username: user.username,
      sub: user._id,
      roles: user.roles,
      permissions,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: authUser,
    };
  }
}
