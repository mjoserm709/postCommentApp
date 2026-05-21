import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, retry, tap } from 'rxjs';
import {
  BulkCreatePostsPayload,
  BulkCreatePostsResult,
  CreatePostPayload,
  PaginatedPosts,
  Post,
  PostsApiResponse,
} from '../data/post.interfaces';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/posts';

  getPosts(page = 1, limit = 12): Observable<PostsApiResponse<PaginatedPosts>> {
    return this.http.get<PostsApiResponse<PaginatedPosts>>(`${this.apiUrl}?page=${page}&limit=${limit}`).pipe(
      delay(150),
      retry({ count: 1, delay: 250 }),
      tap(() => undefined),
    );
  }

  getPublishedByCategory(categorySlug: string, page = 1, limit = 9): Observable<PostsApiResponse<PaginatedPosts>> {
    return this.http.get<PostsApiResponse<PaginatedPosts>>(`${this.apiUrl}/category/${categorySlug}?page=${page}&limit=${limit}`).pipe(
      delay(150),
    );
  }

  createPost(payload: CreatePostPayload): Observable<PostsApiResponse<Post>> {
    return this.http.post<PostsApiResponse<Post>>(this.apiUrl, payload);
  }

  createBulk(payload: BulkCreatePostsPayload): Observable<PostsApiResponse<BulkCreatePostsResult>> {
    return this.http.post<PostsApiResponse<BulkCreatePostsResult>>(`${this.apiUrl}/bulk`, payload);
  }

  updatePost(id: string, payload: Partial<CreatePostPayload>): Observable<PostsApiResponse<Post>> {
    return this.http.put<PostsApiResponse<Post>>(`${this.apiUrl}/${id}`, payload);
  }

  deletePost(id: string): Observable<PostsApiResponse<Post>> {
    return this.http.delete<PostsApiResponse<Post>>(`${this.apiUrl}/${id}`);
  }
}
