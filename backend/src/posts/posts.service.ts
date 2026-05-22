import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BulkCreatePostsDto } from './dto/bulk-create-posts.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post, PostDocument, PostStatus } from './schemas/post.schema';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async findAll(page: number = 1, limit: number = 12) {
    const skip = (page - 1) * limit;
    const query = { isActive: true };
    const [items, totalCount] = await Promise.all([
      this.postModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.postModel.countDocuments(query).exec()
    ]);
    const totalPages = Math.ceil(totalCount / limit) || 1;
    return { items, totalPages };
  }

  async findPublishedByCategory(categorySlug: string, page: number = 1, limit: number = 12) {
    const skip = (page - 1) * limit;
    const query = { categorySlug, status: PostStatus.Published, isActive: true };
    const [items, totalCount] = await Promise.all([
      this.postModel.find(query).sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.postModel.countDocuments(query).exec()
    ]);
    const totalPages = Math.ceil(totalCount / limit) || 1;
    return { items, totalPages };
  }

  async findOne(id: string) {
    const post = await this.postModel.findById(id).exec();
    if (!post || !post.isActive) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async create(createPostDto: CreatePostDto, authorId?: string) {
    await this.ensureSlugIsAvailable(createPostDto.slug);

    return this.postModel.create(this.toPostPayload(createPostDto, authorId));
  }

  async createBulk(bulkCreatePostsDto: BulkCreatePostsDto, authorId?: string) {
    const slugs = bulkCreatePostsDto.posts.map((post) => post.slug.trim().toLowerCase());
    const duplicateSlug = slugs.find((slug, index) => slugs.indexOf(slug) !== index);
    if (duplicateSlug) {
      throw new ConflictException(`Duplicate slug in import: ${duplicateSlug}`);
    }

    const existing = await this.postModel.find({ slug: { $in: slugs } }).select('slug').exec();
    if (existing.length) {
      throw new ConflictException(`Existing slugs: ${existing.map((post) => post.slug).join(', ')}`);
    }

    const importId = bulkCreatePostsDto.importId ?? `import-${Date.now()}`;
    const posts = bulkCreatePostsDto.posts.map((post) => ({
      ...this.toPostPayload(post, authorId),
      bulkImportId: importId,
    }));

    const createdPosts = await this.postModel.insertMany(posts);

    return {
      importId,
      count: createdPosts.length,
      posts: createdPosts,
    };
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const post = await this.findOne(id);

    if (updatePostDto.slug && updatePostDto.slug.trim().toLowerCase() !== post.slug) {
      await this.ensureSlugIsAvailable(updatePostDto.slug, id);
    }

    Object.assign(post, this.toPostPayload(updatePostDto));
    return post.save();
  }

  async remove(id: string) {
    const post = await this.findOne(id);
    post.isActive = false;
    post.status = PostStatus.Archived;
    return post.save();
  }

  private async ensureSlugIsAvailable(slug: string, currentId?: string) {
    const normalizedSlug = slug.trim().toLowerCase();
    const existing = await this.postModel.findOne({ slug: normalizedSlug }).exec();

    if (existing && existing._id.toString() !== currentId) {
      throw new ConflictException('Post slug already exists');
    }
  }

  private toPostPayload(postDto: UpdatePostDto, authorId?: string) {
    const status = postDto.status ?? PostStatus.Draft;

    return {
      ...postDto,
      slug: postDto.slug?.trim().toLowerCase(),
      categorySlug: postDto.categorySlug?.trim().toLowerCase(),
      tags: postDto.tags?.map((tag) => tag.trim().toLowerCase()).filter(Boolean) ?? [],
      commentsEnabled: postDto.commentsEnabled ?? true,
      status,
      authorId: authorId ? new Types.ObjectId(authorId) : undefined,
      publishedAt:
        postDto.publishedAt ??
        (status === PostStatus.Published ? new Date().toISOString() : undefined),
    };
  }
}
