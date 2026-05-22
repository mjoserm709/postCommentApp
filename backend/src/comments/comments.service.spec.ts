import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { CommentsService } from './comments.service';
import { Comment } from './schemas/comment.schema';
import { Post } from '../posts/schemas/post.schema';
import { User } from '../users/schemas/user.schema';

describe('CommentsService', () => {
  let service: CommentsService;
  let commentModel: any;
  let postModel: any;
  let userModel: any;

  beforeEach(async () => {
    commentModel = {
      findById: jest.fn(),
      create: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
    };
    postModel = {
      findById: jest.fn(),
    };
    userModel = {
      find: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: getModelToken(Comment.name), useValue: commentModel },
        { provide: getModelToken(Post.name), useValue: postModel },
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  it('throws on invalid postId for list', async () => {
    await expect(service.findByPost('bad-id')).rejects.toThrow(BadRequestException);
  });

  it('throws when creating comment for missing post', async () => {
    postModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    const userId = new Types.ObjectId().toString();
    const postId = new Types.ObjectId().toString();

    await expect(service.create(postId, { content: 'hola' }, userId)).rejects.toThrow(NotFoundException);
  });

  it('throws when deleting another user comment', async () => {
    commentModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        isActive: true,
        authorId: new Types.ObjectId(),
      }),
    });

    await expect(service.remove(new Types.ObjectId().toString(), new Types.ObjectId().toString())).rejects.toThrow(
      ForbiddenException,
    );
  });
});
