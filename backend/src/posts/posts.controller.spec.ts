import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { ThrottlerGuard } from '@nestjs/throttler';

describe('PostsController', () => {
  let controller: PostsController;
  let mockPostsService: any;

  beforeEach(async () => {
    mockPostsService = {
      findAll: jest.fn(),
      findPublishedByCategory: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      createBulk: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PostsController>(PostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call postsService.findAll with parsed numbers', () => {
      mockPostsService.findAll.mockReturnValue('result');
      const result = controller.findAll({ page: 2, limit: 20 });
      expect(mockPostsService.findAll).toHaveBeenCalledWith(2, 20);
      expect(result).toBe('result');
    });

    it('should use default values if page and limit are missing', () => {
      controller.findAll({});
      expect(mockPostsService.findAll).toHaveBeenCalledWith(1, 12);
    });
  });

  describe('createBulk', () => {
    it('should pass dto and userId to service', () => {
      const dto: any = { posts: [] };
      const req: any = { user: { userId: 'user123' } };
      mockPostsService.createBulk.mockReturnValue('created');

      const result = controller.createBulk(dto, req);
      expect(mockPostsService.createBulk).toHaveBeenCalledWith(dto, 'user123');
      expect(result).toBe('created');
    });
  });
});
