import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, retry, catchError, throwError } from 'rxjs';
import { User, ApiResponse } from '../data/user.interfaces';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/users';

  getUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(this.apiUrl).pipe(
      retry(2), // Reintentar 2 veces si falla la red
      catchError(error => {
        console.error('Error fetching users', error);
        return throwError(() => error);
      })
    );
  }
}
