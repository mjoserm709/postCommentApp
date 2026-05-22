import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  ArrayMaxSize,
  ArrayUnique,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PostStatus } from '../schemas/post.schema';

export class CreatePostDto {
  @ApiProperty({ example: 'Mi primer post' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title!: string;

  @ApiProperty({ example: 'mi-primer-post' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(140)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must use lowercase letters, numbers, and hyphens only',
  })
  slug!: string;

  @ApiProperty({ example: 'Resumen corto del post.' })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(280)
  excerpt!: string;

  @ApiProperty({ example: 'Contenido completo del post.' })
  @IsNotEmpty()
  @IsString()
  @MinLength(20)
  @MaxLength(20000)
  content!: string;

  @ApiProperty({ example: 'terror' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'categorySlug must use lowercase letters, numbers, and hyphens only',
  })
  categorySlug!: string;

  @ApiProperty({ example: ['cuento', 'suspenso'], required: false })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
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
