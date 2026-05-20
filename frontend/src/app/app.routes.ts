import { Routes } from '@angular/router';
import { superAdminGuard } from './core/guards/super-admin.guard';

export const routes: Routes = [
  // Redirige raíz a /auth/login
  { path: '', redirectTo: 'auth', pathMatch: 'full' },

  // Feature: Auth (login, register) — cargado lazy como bloque
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // Feature: Users — cargado lazy como bloque
  {
    path: 'users',
    canActivate: [superAdminGuard],
    loadChildren: () =>
      import('./features/users/users.routes').then(m => m.USERS_ROUTES)
  },

  // Fallback — redirige cualquier ruta desconocida al login
  { path: '**', redirectTo: 'auth' }
];
