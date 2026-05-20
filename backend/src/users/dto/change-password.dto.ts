import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'new_secure_password', description: 'La nueva contraseña para el usuario' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  newPassword!: string;
}
