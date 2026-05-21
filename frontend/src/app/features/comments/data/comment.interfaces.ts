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

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}
