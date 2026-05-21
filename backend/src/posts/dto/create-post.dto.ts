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
} from 'class-validator';
import { PostStatus } from '../schemas/post.schema';

export class CreatePostDto {
  @ApiProperty({ example: 'Mi primer post' })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiProperty({ example: 'mi-primer-post' })
  @IsNotEmpty()
  @IsString()
  slug!: string;

  @ApiProperty({ example: 'Resumen corto del post.' })
  @IsNotEmpty()
  @IsString()
  excerpt!: string;

  @ApiProperty({ example: 'Contenido completo del post.' })
  @IsNotEmpty()
  @IsString()
  content!: string;

  @ApiProperty({ example: 'terror' })
  @IsNotEmpty()
  @IsString()
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
