import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { CreateCommentDto } from './create-comment.dto';

export class CreateCommentRequestDto extends CreateCommentDto {
  @ApiProperty({ example: '682d773d1f6ec9f0c87f3f32' })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  postId!: string;
}
