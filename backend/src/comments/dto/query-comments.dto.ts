import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryCommentsDto extends PaginationQueryDto {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  postId!: string;
}
