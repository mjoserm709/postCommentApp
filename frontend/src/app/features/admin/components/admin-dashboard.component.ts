import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="admin-page">
      <header class="admin-header">
        <p class="eyebrow">Panel Admin</p>
        <h1>Administracion</h1>
        <p>Gestiona usuarios, roles, permisos y publicaciones desde un solo lugar.</p>
      </header>

      <section class="admin-grid">
        @for (section of adminSections(); track section.route) {
          <a [routerLink]="section.route" class="admin-card">
            <span class="card-title">{{ section.label }}</span>
            <span class="card-copy">{{ section.description }}</span>
          </a>
        }
      </section>
    </main>
  `,
  styles: [
    `
      .admin-page {
        width: min(1080px, calc(100% - 32px));
        margin: 0 auto;
        padding: 32px 0 56px;
      }

      .admin-header {
        margin-bottom: 24px;
      }

      .eyebrow {
        margin: 0 0 6px;
        color: #0f766e;
        font-size: 0.78rem;
        font-weight: 800;
        text-transform: uppercase;
      }

      h1 {
        margin: 0;
        font-size: 2.5rem;
      }

      p {
        color: #475569;
      }

      .admin-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 16px;
      }

      .admin-card {
        display: flex;
        min-height: 140px;
        flex-direction: column;
        gap: 10px;
        padding: 20px;
        border: 1px solid #d7dde7;
        border-radius: 8px;
        color: #111827;
        text-decoration: none;
        background: #fff;
        box-shadow: 0 8px 22px rgba(15, 23, 42, 0.06);
      }

      .admin-card:hover {
        border-color: #0f766e;
      }

      .card-title {
        font-size: 1.2rem;
        font-weight: 800;
      }

      .card-copy {
        color: #4b5563;
      }
    `,
  ],
})
export class AdminDashboardComponent {
  protected authService = inject(AuthService);
  protected adminSections = computed(() => this.authService.getAdminSections());
}
