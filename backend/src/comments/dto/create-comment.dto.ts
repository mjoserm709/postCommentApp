import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Me gusto este post.' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  content!: string;
}
