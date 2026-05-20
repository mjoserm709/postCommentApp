import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'MODERATOR' })
  @IsNotEmpty()
  @IsString()
  key!: string;

  @ApiProperty({ example: 'Moderador' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Puede moderar comentarios y revisar posts.' })
  @IsNotEmpty()
  @IsString()
  description!: string;

  @ApiProperty({ example: ['posts.read', 'comments.moderate'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
