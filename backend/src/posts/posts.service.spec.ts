import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PostsService } from './posts.service';
import { Post, PostStatus } from './schemas/post.schema';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('PostsService', () => {
  let service: PostsService;
  let mockPostModel: any;

  beforeEach(async () => {
    mockPostModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      countDocuments: jest.fn(),
      create: jest.fn(),
      insertMany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getModelToken(Post.name),
          useValue: mockPostModel,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated posts', async () => {
      const exec = jest.fn().mockResolvedValue([{ title: 'Post 1' }]);
      const limit = jest.fn().mockReturnValue({ exec });
      const skip = jest.fn().mockReturnValue({ limit });
      const sort = jest.fn().mockReturnValue({ skip });
      mockPostModel.find.mockReturnValue({ sort });

      const countExec = jest.fn().mockResolvedValue(1);
      mockPostModel.countDocuments.mockReturnValue({ exec: countExec });

      const result = await service.findAll(1, 10);
      expect(result.items.length).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(mockPostModel.find).toHaveBeenCalledWith({ isActive: true });
      expect(mockPostModel.countDocuments).toHaveBeenCalledWith({ isActive: true });
    });
  });

  describe('createBulk', () => {
    it('should insert many posts and return result', async () => {
      const existingExec = jest.fn().mockResolvedValue([]);
      const select = jest.fn().mockReturnValue({ exec: existingExec });
      mockPostModel.find.mockReturnValue({ select });

      const mockPosts = [{ slug: 'post-1', title: 'Post 1', excerpt: '', content: '', categorySlug: 'cat' }];
      const createdPosts = [{ _id: 'id1', slug: 'post-1' }];
      mockPostModel.insertMany.mockResolvedValue(createdPosts);

      const result = await service.createBulk({ posts: mockPosts as any });
      expect(result.count).toBe(1);
      expect(mockPostModel.insertMany).toHaveBeenCalled();
    });

    it('should throw ConflictException if duplicate slug in payload', async () => {
      const mockPosts = [
        { slug: 'post-1', title: '', excerpt: '', content: '', categorySlug: '' },
        { slug: 'post-1', title: '', excerpt: '', content: '', categorySlug: '' }
      ];
      await expect(service.createBulk({ posts: mockPosts as any })).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return a post', async () => {
      const mockPost = { _id: '123', isActive: true, save: jest.fn() };
      mockPostModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockPost) });

      const result = await service.findOne('123');
      expect(result).toBe(mockPost);
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPostModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
    });
  });
});
