import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ example: 'posts.publish' })
  @IsNotEmpty()
  @IsString()
  key!: string;

  @ApiProperty({ example: 'Publicar posts' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 'posts' })
  @IsNotEmpty()
  @IsString()
  module!: string;

  @ApiProperty({ example: 'Permite publicar posts para que sean visibles.' })
  @IsNotEmpty()
  @IsString()
  description!: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
