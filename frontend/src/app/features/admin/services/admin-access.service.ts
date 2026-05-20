import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiResponse, Permission, Role } from '../data/access.interfaces';

export interface CreatePermissionPayload {
  key: string;
  name: string;
  module: string;
  description: string;
  isActive: boolean;
}

export interface CreateRolePayload {
  key: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AdminAccessService {
  private http = inject(HttpClient);
  private rolesUrl = 'http://localhost:3000/roles';
  private permissionsUrl = 'http://localhost:3000/permissions';

  getRoles(): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(this.rolesUrl).pipe(
      catchError((error) => {
        console.error('Error fetching roles', error);
        return throwError(() => error);
      }),
    );
  }

  createRole(payload: CreateRolePayload): Observable<ApiResponse<Role>> {
    return this.http.post<ApiResponse<Role>>(this.rolesUrl, payload).pipe(
      catchError((error) => {
        console.error('Error creating role', error);
        return throwError(() => error);
      }),
    );
  }

  getPermissions(): Observable<ApiResponse<Permission[]>> {
    return this.http.get<ApiResponse<Permission[]>>(this.permissionsUrl).pipe(
      catchError((error) => {
        console.error('Error fetching permissions', error);
        return throwError(() => error);
      }),
    );
  }

  createPermission(payload: CreatePermissionPayload): Observable<ApiResponse<Permission>> {
    return this.http.post<ApiResponse<Permission>>(this.permissionsUrl, payload).pipe(
      catchError((error) => {
        console.error('Error creating permission', error);
        return throwError(() => error);
      }),
    );
  }
}
