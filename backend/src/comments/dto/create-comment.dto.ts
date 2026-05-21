import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Me gusto este post.' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  content!: string;
}
