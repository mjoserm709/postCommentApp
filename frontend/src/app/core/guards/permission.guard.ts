import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

export const permissionGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const permission = route.data?.['permission'] as string | undefined;

  if (!permission && authService.canAccessAdmin()) {
    return true;
  }

  if (permission && authService.hasPermission(permission)) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};
