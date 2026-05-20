import { Routes } from '@angular/router';
import { superAdminGuard } from './core/guards/super-admin.guard';

export const routes: Routes = [
  // Dashboard principal: selección de categorías para posts
  {
    path: '',
    loadChildren: () =>
      import('./features/categories/categories.routes').then(m => m.CATEGORIES_ROUTES)
  },
  {
    path: 'categories',
    loadChildren: () =>
      import('./features/categories/categories.routes').then(m => m.CATEGORIES_ROUTES)
  },

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
