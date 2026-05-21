import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { BulkCreatePostsDto } from './dto/bulk-create-posts.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('posts.read')
  findAll() {
    return this.postsService.findAll();
  }

  @Get('category/:categorySlug')
  findPublishedByCategory(@Param('categorySlug') categorySlug: string) {
    return this.postsService.findPublishedByCategory(categorySlug);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('posts.read')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('posts.create')
  @Throttle({ default: { limit: 8, ttl: 60000 } })
  create(@Body() createPostDto: CreatePostDto, @Req() request: Request) {
    return this.postsService.create(createPostDto, (request.user as any)?.userId);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('posts.create')
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  createBulk(@Body() bulkCreatePostsDto: BulkCreatePostsDto, @Req() request: Request) {
    return this.postsService.createBulk(bulkCreatePostsDto, (request.user as any)?.userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('posts.update')
  @Throttle({ default: { limit: 8, ttl: 60000 } })
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('posts.delete')
  @Throttle({ default: { limit: 8, ttl: 60000 } })
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}
