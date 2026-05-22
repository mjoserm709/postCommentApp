import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { RuntimeConfigService } from '../../../core/services/runtime-config.service';
import { ApiResponse, Permission, Role } from '../data/access.interfaces';

export interface CreatePermissionPayload {
  key: string;
  name: string;
  module: string;
  description: string;
  isActive: boolean;
}

export interface UpdatePermissionPayload {
  key?: string;
  name?: string;
  module?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateRolePayload {
  key: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
}

export interface UpdateRolePayload {
  key?: string;
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AdminAccessService {
  private http = inject(HttpClient);
  private runtimeConfig = inject(RuntimeConfigService);

  private get rolesUrl() {
    return `${this.runtimeConfig.apiBaseUrl}/roles`;
  }

  private get permissionsUrl() {
    return `${this.runtimeConfig.apiBaseUrl}/permissions`;
  }

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

  updateRole(id: string, payload: UpdateRolePayload): Observable<ApiResponse<Role>> {
    return this.http.patch<ApiResponse<Role>>(`${this.rolesUrl}/${id}`, payload).pipe(
      catchError((error) => {
        console.error('Error updating role', error);
        return throwError(() => error);
      }),
    );
  }

  deleteRole(id: string): Observable<ApiResponse<Role>> {
    return this.http.delete<ApiResponse<Role>>(`${this.rolesUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error deleting role', error);
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

  updatePermission(id: string, payload: UpdatePermissionPayload): Observable<ApiResponse<Permission>> {
    return this.http.patch<ApiResponse<Permission>>(`${this.permissionsUrl}/${id}`, payload).pipe(
      catchError((error) => {
        console.error('Error updating permission', error);
        return throwError(() => error);
      }),
    );
  }

  deletePermission(id: string): Observable<ApiResponse<Permission>> {
    return this.http.delete<ApiResponse<Permission>>(`${this.permissionsUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error deleting permission', error);
        return throwError(() => error);
      }),
    );
  }
}
