import { ApiResponse } from '../../../core/models/api-response';
import { PaginatedResult } from '../../../core/models/pagination';

export interface PostComment {
  _id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author?: {
    username: string;
    firstName: string;
      lastName: string;
  };
}

export interface DeleteCommentResult {
  _id: string;
  deleted: boolean;
}

export type CommentsApiResponse<T> = ApiResponse<T>;
export type PaginatedComments = PaginatedResult<PostComment>;
