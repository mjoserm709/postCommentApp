import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, retry, catchError, throwError } from 'rxjs';
import { RuntimeConfigService } from '../../../core/services/runtime-config.service';
import { User, ApiResponse, UpdateUserPayload } from '../data/user.interfaces';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private http = inject(HttpClient);
  private runtimeConfig = inject(RuntimeConfigService);

  private get apiUrl() {
    return `${this.runtimeConfig.apiBaseUrl}/users`;
  }

  getUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(this.apiUrl).pipe(
      retry(2),
      catchError(error => {
        console.error('Error fetching users', error);
        return throwError(() => error);
      })
    );
  }

  getUser(id: string): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching user', error);
        return throwError(() => error);
      })
    );
  }

  updateUser(id: string, payload: UpdateUserPayload): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(`${this.apiUrl}/${id}`, payload).pipe(
      catchError(error => {
        console.error('Error updating user', error);
        return throwError(() => error);
      })
    );
  }
}
