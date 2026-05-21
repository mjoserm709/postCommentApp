import { Routes } from '@angular/router';

export const CATEGORIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/categories-dashboard.component').then(
        (m) => m.CategoriesDashboardComponent,
      ),
  },
  {
    path: ':slug',
    loadComponent: () =>
      import('../posts/pages/post-detail.page').then((m) => m.PostDetailPage),
  },
];
