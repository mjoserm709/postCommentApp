import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';
import { PostStatus } from '../schemas/post.schema';

export class CreatePostDto {
  @ApiProperty({ example: 'Mi primer post' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiProperty({ example: 'mi-primer-post' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  slug!: string;

  @ApiProperty({ example: 'Resumen corto del post.' })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  excerpt!: string;

  @ApiProperty({ example: 'Contenido completo del post.' })
  @IsNotEmpty()
  @IsString()
  @MinLength(20)
  content!: string;

  @ApiProperty({ example: 'terror' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  categorySlug!: string;

  @ApiProperty({ example: ['cuento', 'suspenso'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ enum: PostStatus, required: false })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  commentsEnabled?: boolean;

  @ApiProperty({ example: 'https://example.com/cover.jpg', required: false })
  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

  @ApiProperty({ example: '2026-05-21T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
