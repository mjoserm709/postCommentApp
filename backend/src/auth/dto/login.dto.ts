import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin', description: 'El nombre de usuario' })
  @IsNotEmpty()
  @IsString()
  username!: string;

  @ApiProperty({ example: 'admin123', description: 'La contraseña del usuario' })
  @IsNotEmpty()
  @IsString()
  password!: string;
}
