import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateCommentRequestDto } from './dto/create-comment-request.dto';
import { QueryCommentsDto } from './dto/query-comments.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  findByPost(@Query() query: QueryCommentsDto) {
    return this.commentsService.findByPost(query.postId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  create(@Body() createCommentDto: CreateCommentRequestDto, @Req() request: Request) {
    return this.commentsService.create(createCommentDto.postId, createCommentDto, (request.user as any)?.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  remove(@Param('id') id: string, @Req() request: Request) {
    return this.commentsService.remove(id, (request.user as any)?.userId);
  }
}

@Controller('posts/:postId/comments')
export class NestedCommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  findNestedByPost(@Param('postId') postId: string) {
    return this.commentsService.findByPost(postId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  createNested(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() request: Request,
  ) {
    return this.commentsService.create(postId, createCommentDto, (request.user as any)?.userId);
  }
}
