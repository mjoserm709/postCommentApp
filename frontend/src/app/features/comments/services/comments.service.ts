import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommentsApiResponse, DeleteCommentResult, PaginatedComments, PostComment } from '../data/comment.interfaces';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/comments';

  getComments(postId: string, page = 1, limit = 10): Observable<CommentsApiResponse<PaginatedComments>> {
    return this.http.get<CommentsApiResponse<PaginatedComments>>(`${this.apiUrl}?postId=${postId}&page=${page}&limit=${limit}`);
  }

  createComment(postId: string, content: string): Observable<CommentsApiResponse<PostComment>> {
    return this.http.post<CommentsApiResponse<PostComment>>(this.apiUrl, { postId, content });
  }

  deleteComment(id: string): Observable<CommentsApiResponse<DeleteCommentResult>> {
    return this.http.delete<CommentsApiResponse<DeleteCommentResult>>(`${this.apiUrl}/${id}`);
  }
}
