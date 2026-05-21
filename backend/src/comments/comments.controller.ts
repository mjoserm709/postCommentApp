import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  findByPost(@Param('postId') postId: string) {
    return this.commentsService.findByPost(postId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() request: Request,
  ) {
    return this.commentsService.create(postId, createCommentDto, (request.user as any)?.userId);
  }
}
