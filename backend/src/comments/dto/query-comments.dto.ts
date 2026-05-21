import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class QueryCommentsDto {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  postId!: string;
}
