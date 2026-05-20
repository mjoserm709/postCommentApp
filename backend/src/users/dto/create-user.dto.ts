import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'johndoe', description: 'Nombre de usuario único' })
  @IsNotEmpty()
  @IsString()
  username!: string;

  @ApiProperty({ example: 'john@example.com', description: 'Correo electrónico único' })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123', description: 'Contraseña (mínimo 6 caracteres)' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'John', description: 'Nombre' })
  @IsNotEmpty()
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'Doe', description: 'Apellido' })
  @IsNotEmpty()
  @IsString()
  lastName!: string;

  @ApiProperty({ example: '+1234567890', description: 'Teléfono de contacto', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}
