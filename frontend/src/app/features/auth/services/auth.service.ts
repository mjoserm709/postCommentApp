import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export interface AuthResponse {
  statusCode: number;
  message: string;
  data: {
    access_token: string;
    user: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:3000/auth';
  private readonly accessToken = signal<string | null>(localStorage.getItem('access_token'));
  private readonly currentUser = signal<any | null>(this.readStoredUser());

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.data && response.data.access_token) {
          localStorage.setItem('access_token', response.data.access_token);
          localStorage.setItem('auth_user', JSON.stringify(response.data.user));
          this.accessToken.set(response.data.access_token);
          this.currentUser.set(response.data.user);
        }
      }),
      catchError(error => {
        console.error('Error in login', error);
        return throwError(() => error);
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      tap(() => console.log('Registro exitoso')),
      catchError(error => {
        console.error('Error in register', error);
        return throwError(() => error);
      })
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_user');
    this.accessToken.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return !!this.accessToken();
  }

  getCurrentUser(): any | null {
    const user = this.currentUser();
    if (user) {
      return user;
    }

    const storedUser = localStorage.getItem('auth_user');

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        this.currentUser.set(parsedUser);
        return parsedUser;
      } catch {
        localStorage.removeItem('auth_user');
      }
    }

    const token = this.accessToken();
    if (!token) {
      return null;
    }

    try {
      const payload = token.split('.')[1];
      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(normalizedPayload));
    } catch {
      return null;
    }
  }

  hasRole(role: string): boolean {
    const roles = this.getCurrentUser()?.roles;
    return Array.isArray(roles) && roles.includes(role);
  }

  isSuperAdmin(): boolean {
    return this.isAuthenticated() && this.hasRole('SUPER_ADMIN');
  }

  private readStoredUser(): any | null {
    const storedUser = localStorage.getItem('auth_user');
    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem('auth_user');
      return null;
    }
  }
}
