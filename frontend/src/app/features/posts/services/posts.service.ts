import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiResponse, BulkCreatePostsPayload, CreatePostPayload, Post } from '../data/post.interfaces';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/posts';

  getPosts(): Observable<ApiResponse<Post[]>> {
    return this.http.get<ApiResponse<Post[]>>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Error fetching posts', error);
        return throwError(() => error);
      }),
    );
  }

  getPublishedByCategory(categorySlug: string): Observable<ApiResponse<Post[]>> {
    return this.http.get<ApiResponse<Post[]>>(`${this.apiUrl}/category/${categorySlug}`).pipe(
      catchError((error) => {
        console.error('Error fetching category posts', error);
        return throwError(() => error);
      }),
    );
  }

  createPost(payload: CreatePostPayload): Observable<ApiResponse<Post>> {
    return this.http.post<ApiResponse<Post>>(this.apiUrl, payload).pipe(
      catchError((error) => {
        console.error('Error creating post', error);
        return throwError(() => error);
      }),
    );
  }

  createBulk(payload: BulkCreatePostsPayload): Observable<ApiResponse<Post[]>> {
    return this.http.post<ApiResponse<Post[]>>(`${this.apiUrl}/bulk`, payload).pipe(
      catchError((error) => {
        console.error('Error importing posts', error);
        return throwError(() => error);
      }),
    );
  }
}
