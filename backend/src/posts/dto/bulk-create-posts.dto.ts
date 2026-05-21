import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreatePostDto } from './create-post.dto';

export class BulkCreatePostsDto {
  @ApiProperty({ required: false, example: 'lote-mayo-2026' })
  @IsOptional()
  @IsString()
  importId?: string;

  @ApiProperty({ type: [CreatePostDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => CreatePostDto)
  posts!: CreatePostDto[];
}
