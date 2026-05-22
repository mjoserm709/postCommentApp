import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'users',
    redirectTo: 'admin/users',
    pathMatch: 'full',
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'categories',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/categories/categories.routes').then((m) => m.CATEGORIES_ROUTES),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/categories/categories.routes').then((m) => m.CATEGORIES_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
