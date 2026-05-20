import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(loginDto: LoginDto): Promise<any> {
    try {
      const user = await this.usersService.findByUsername(loginDto.username);
      if (user && user.password && await bcrypt.compare(loginDto.password, user.password)) {
        const { password, ...result } = user.toObject();
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
    
    const payload = { username: user.username, sub: user._id, roles: user.roles };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
