import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminAccessService } from '../services/admin-access.service';
import { Role } from '../data/access.interfaces';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <main class="admin-list">
      <div class="toolbar">
        <div>
          <a routerLink="/admin" class="back-link">Panel Admin</a>
          <h1>Roles</h1>
        </div>
        @if (authService.hasPermission('roles.create')) {
          <a routerLink="/admin/roles/create" class="btn btn-primary">Nuevo rol</a>
        }
      </div>

      <div class="filters">
        <input
          type="search"
          class="form-control"
          placeholder="Buscar por nombre, key o permiso..."
          [ngModel]="searchTerm()"
          (ngModelChange)="searchTerm.set($event)"
        >
      </div>

      @if (isLoading()) {
        <div class="d-flex justify-content-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
      } @else {
        <section class="list-grid">
          @for (role of filteredRoles(); track role._id) {
            <article class="list-card">
              <div class="card-head">
                <div>
                  <h2>{{ role.name }}</h2>
                  <span class="key">{{ role.key }}</span>
                </div>
                @if (role.isSystem) {
                  <span class="badge text-bg-dark">Sistema</span>
                }
              </div>
              <p>{{ role.description }}</p>
              <div class="permissions">
                @for (permission of role.permissions; track permission) {
                  <span class="badge text-bg-light">{{ permission }}</span>
                }
              </div>
              <div class="action-buttons">
                @if (authService.hasPermission('roles.update')) {
                  <a
                    [routerLink]="['/admin/roles/edit', role._id]"
                    class="btn btn-sm btn-outline-primary"
                    title="Editar rol"
                  >
                    Editar
                  </a>
                }
                @if (authService.hasPermission('roles.delete') && !role.isSystem) {
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-danger"
                    (click)="deleteRole(role._id)"
                    title="Eliminar rol"
                  >
                    Eliminar
                  </button>
                }
              </div>
            </article>
          } @empty {
            <div class="empty-state">No se encontraron roles.</div>
          }
        </section>
      }
    </main>
  `,
  styles: [`
    .admin-list {
      width: min(1120px, calc(100% - 32px));
      margin: 0 auto;
      padding: 32px 0 56px;
    }

    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 22px;
    }

    .back-link {
      display: inline-block;
      margin-bottom: 8px;
      color: #0f766e;
      font-weight: 700;
      text-decoration: none;
    }

    h1,
    h2 {
      margin: 0;
    }

    .list-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }

    .filters {
      margin-bottom: 18px;
    }

    .empty-state {
      grid-column: 1 / -1;
      padding: 28px;
      border: 1px solid #d7dde7;
      border-radius: 8px;
      text-align: center;
      color: #64748b;
    }

    .list-card {
      padding: 18px;
      border: 1px solid #d7dde7;
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 8px 22px rgba(15, 23, 42, 0.06);
    }

    .card-head {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }

    .key {
      color: #64748b;
      font-size: 0.85rem;
      font-weight: 700;
    }

    p {
      margin: 12px 0;
      color: #475569;
    }

    .permissions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }
  `],
})
export class RolesListComponent implements OnInit {
  private adminAccessService = inject(AdminAccessService);
  private toast = inject(ToastService);
  protected authService = inject(AuthService);

  roles = signal<Role[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  filteredRoles = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.roles();
    }

    return this.roles().filter((role) =>
      [
        role.name,
        role.key,
        role.description,
        ...role.permissions,
      ].some((value) => value.toLowerCase().includes(term)),
    );
  });

  ngOnInit() {
    this.isLoading.set(true);

    this.adminAccessService.getRoles().subscribe({
      next: (response) => {
        this.roles.set(response.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.error('No se pudieron cargar los roles.');
      },
    });
  }

  deleteRole(id: string) {
    if (!confirm('¿Está seguro de que desea eliminar este rol?')) {
      return;
    }

    this.adminAccessService.deleteRole(id).subscribe({
      next: () => {
        this.toast.success('Rol eliminado correctamente.');
        // Refresh the roles list
        this.ngOnInit();
      },
      error: (err) => {
        const msg = err.error?.message || 'No se pudo eliminar el rol.';
        this.toast.error(msg);
      },
    });
  }
}
