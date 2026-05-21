import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiResponse, PostComment } from '../data/comment.interfaces';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/posts';

  getComments(postId: string): Observable<ApiResponse<PostComment[]>> {
    return this.http.get<ApiResponse<PostComment[]>>(`${this.apiUrl}/${postId}/comments`).pipe(
      catchError((error) => {
        console.error('Error fetching comments', error);
        return throwError(() => error);
      }),
    );
  }

  createComment(postId: string, content: string): Observable<ApiResponse<PostComment>> {
    return this.http.post<ApiResponse<PostComment>>(`${this.apiUrl}/${postId}/comments`, { content }).pipe(
      catchError((error) => {
        console.error('Error creating comment', error);
        return throwError(() => error);
      }),
    );
  }
}
