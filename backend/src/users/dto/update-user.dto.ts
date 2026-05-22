import { OmitType, PartialType, ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

class UpdateUserBaseDto extends OmitType(CreateUserDto, ['password'] as const) {}

export class UpdateUserDto extends PartialType(UpdateUserBaseDto) {
  @ApiProperty({ example: true, description: 'Estado activo del usuario', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
