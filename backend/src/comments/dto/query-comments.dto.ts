import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class QueryCommentsDto {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  postId!: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}
