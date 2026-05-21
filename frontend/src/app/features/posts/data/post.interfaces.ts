export type PostStatus = 'draft' | 'published' | 'archived';

export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categorySlug: string;
  tags: string[];
  status: PostStatus;
  commentsEnabled: boolean;
  coverImageUrl?: string;
  publishedAt?: string;
  bulkImportId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreatePostPayload {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categorySlug: string;
  tags?: string[];
  status?: PostStatus;
  commentsEnabled?: boolean;
  coverImageUrl?: string;
}

export interface BulkCreatePostsPayload {
  importId?: string;
  posts: CreatePostPayload[];
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}
