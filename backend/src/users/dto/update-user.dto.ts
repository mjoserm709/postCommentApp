import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ example: true, description: 'Estado activo del usuario', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
