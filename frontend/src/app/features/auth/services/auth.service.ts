import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ApiResponse } from '../../../core/models/api-response';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { RuntimeConfigService } from '../../../core/services/runtime-config.service';
import { SessionState, SessionUser } from '../data/session.interfaces';

export interface AuthResponse extends ApiResponse<{
  access_token: string;
  user: SessionUser;
}> {}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private static readonly SESSION_KEY = 'app_session';
  private http = inject(HttpClient);
  private router = inject(Router);
  private toast = inject(ToastService);
  private runtimeConfig = inject(RuntimeConfigService);
  private readonly session = signal<SessionState | null>(this.readStoredSession());

  private get apiUrl() {
    return `${this.runtimeConfig.apiBaseUrl}/auth`;
  }

  constructor() {
    this.ensureSessionValidity();
  }

  login(credentials: { username: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.data && response.data.access_token) {
          this.setSession(response.data.access_token, response.data.user);
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      tap(() => console.log('Registro exitoso'))
    );
  }

  logout() {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    this.ensureSessionValidity();
    return !!this.session();
  }

  getCurrentUser(): SessionUser | null {
    this.ensureSessionValidity();
    return this.session()?.user ?? null;
  }

  getAccessToken(): string | null {
    this.ensureSessionValidity();
    return this.session()?.token ?? null;
  }

  getSession(): SessionState | null {
    this.ensureSessionValidity();
    return this.session();
  }

  hasRole(role: string): boolean {
    const roles = this.getCurrentUser()?.roles;
    return Array.isArray(roles) && roles.includes(role);
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    const roles = user?.roles;
    const permissions = user?.permissions;

    if (Array.isArray(roles) && roles.includes('SUPER_ADMIN')) {
      return true;
    }

    return Array.isArray(permissions) && permissions.includes(permission);
  }

  isSuperAdmin(): boolean {
    return this.isAuthenticated() && this.hasRole('SUPER_ADMIN');
  }

  canAccessAdmin(): boolean {
    return this.getAdminSections().length > 0;
  }

  getAdminSections(): Array<{ label: string; route: string; permission: string; description: string }> {
    const sections = [
      {
        label: 'Usuarios',
        route: '/admin/users',
        permission: 'users.read',
        description: 'Crear, buscar, editar y desactivar usuarios.',
      },
      {
        label: 'Roles',
        route: '/admin/roles',
        permission: 'roles.read',
        description: 'Define grupos de acceso y sus permisos.',
      },
      {
        label: 'Permisos',
        route: '/admin/permissions',
        permission: 'permissions.read',
        description: 'Consulta las acciones disponibles por modulo.',
      },
      {
        label: 'Posts',
        route: '/admin/posts',
        permission: 'posts.read',
        description: 'Administra publicaciones, borradores e importaciones.',
      },
    ];

    return sections.filter((section) => this.hasPermission(section.permission));
  }

  handleUnauthorized() {
    if (!this.session()) {
      return;
    }

    this.clearSession();
    this.toast.info('Tu sesion expiro. Inicia sesion nuevamente.');
    this.router.navigate(['/auth/login']);
  }

  private setSession(token: string, user: SessionUser) {
    const session: SessionState = {
      token,
      user,
      expiresAt: this.readTokenExpiration(token),
    };

    localStorage.setItem(AuthService.SESSION_KEY, JSON.stringify(session));
    this.session.set(session);
  }

  private clearSession() {
    localStorage.removeItem(AuthService.SESSION_KEY);
    this.session.set(null);
  }

  private readStoredSession(): SessionState | null {
    const storedSession = localStorage.getItem(AuthService.SESSION_KEY);
    if (!storedSession) {
      return null;
    }

    try {
      const session = JSON.parse(storedSession) as SessionState;
      if (!session.token || !session.user) {
        this.clearSession();
        return null;
      }

      return session;
    } catch {
      localStorage.removeItem(AuthService.SESSION_KEY);
      return null;
    }
  }

  private ensureSessionValidity() {
    const currentSession = this.session();
    if (!currentSession) {
      return;
    }

    if (currentSession.expiresAt && currentSession.expiresAt <= Date.now()) {
      this.clearSession();
    }
  }

  private readTokenExpiration(token: string): number | null {
    try {
      const payload = this.decodeTokenPayload(token) as { exp?: number };
      return payload.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  private decodeTokenPayload(token: string): Record<string, unknown> {
    const payload = token.split('.')[1];
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(normalizedPayload));
  }
}
