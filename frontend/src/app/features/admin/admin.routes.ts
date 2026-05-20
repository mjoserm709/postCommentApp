import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [permissionGuard],
    loadComponent: () =>
      import('./components/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
  },
  {
    path: 'users',
    canActivate: [permissionGuard],
    data: { permission: 'users.read' },
    loadComponent: () =>
      import('../users/components/users-list.component').then((m) => m.UsersListComponent),
  },
  {
    path: 'roles',
    canActivate: [permissionGuard],
    data: { permission: 'roles.read' },
    loadComponent: () =>
      import('./components/roles-list.component').then((m) => m.RolesListComponent),
  },
  {
    path: 'roles/create',
    canActivate: [permissionGuard],
    data: { permission: 'roles.create' },
    loadComponent: () =>
      import('./components/role-create.component').then((m) => m.RoleCreateComponent),
  },
  {
    path: 'permissions',
    canActivate: [permissionGuard],
    data: { permission: 'permissions.read' },
    loadComponent: () =>
      import('./components/permissions-list.component').then((m) => m.PermissionsListComponent),
  },
  {
    path: 'permissions/create',
    canActivate: [permissionGuard],
    data: { permission: 'permissions.create' },
    loadComponent: () =>
      import('./components/permission-create.component').then((m) => m.PermissionCreateComponent),
  },
];
