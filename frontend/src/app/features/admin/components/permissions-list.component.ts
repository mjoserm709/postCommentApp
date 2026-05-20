import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminAccessService } from '../services/admin-access.service';
import { Permission } from '../data/access.interfaces';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-permissions-list',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <main class="admin-list">
      <div class="toolbar">
        <div>
          <a routerLink="/admin" class="back-link">Panel Admin</a>
          <h1>Permisos</h1>
        </div>
        @if (authService.hasPermission('permissions.create')) {
          <a routerLink="/admin/permissions/create" class="btn btn-primary">Nuevo permiso</a>
        }
      </div>

      <div class="filters">
        <input
          type="search"
          class="form-control"
          placeholder="Buscar por nombre, key, módulo o descripción..."
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
        @for (group of groupedPermissions(); track group.module) {
          <section class="module-section">
            <h2>{{ group.module }}</h2>
            <div class="permission-list">
              @for (permission of group.permissions; track permission._id) {
                <article class="permission-row">
                  <div>
                    <strong>{{ permission.name }}</strong>
                    <span>{{ permission.description }}</span>
                  </div>
                  <code>{{ permission.key }}</code>
                  <div class="action-buttons">
                    @if (authService.hasPermission('permissions.update')) {
                      <a
                        [routerLink]="['/admin/permissions/edit', permission._id]"
                        class="btn btn-sm btn-outline-primary"
                        title="Editar permiso"
                      >
                        Editar
                      </a>
                    }
                    @if (authService.hasPermission('permissions.delete')) {
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-danger"
                        (click)="deletePermission(permission._id)"
                        title="Eliminar permiso"
                      >
                        Eliminar
                      </button>
                    }
                  </div>
                </article>
              }
            </div>
          </section>
        } @empty {
          <div class="empty-state">No se encontraron permisos.</div>
        }
      }
    </main>
  `,
  styles: [
    `
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

      .module-section {
        margin-bottom: 24px;
      }

      .filters {
        margin-bottom: 18px;
      }

      .empty-state {
        padding: 28px;
        border: 1px solid #d7dde7;
        border-radius: 8px;
        text-align: center;
        color: #64748b;
      }

      .module-section h2 {
        margin-bottom: 10px;
        font-size: 1.15rem;
        text-transform: capitalize;
      }

      .permission-list {
        display: grid;
        gap: 10px;
      }

      .permission-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 14px 16px;
        border: 1px solid #d7dde7;
        border-radius: 8px;
        background: #fff;
      }

      .permission-row div {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .permission-row span {
        color: #475569;
      }

      code {
        color: #0f766e;
        white-space: nowrap;
      }

      .action-buttons {
        display: flex;
        gap: 8px;
      }
    `,
  ],
})
export class PermissionsListComponent implements OnInit {
  private adminAccessService = inject(AdminAccessService);
  private toast = inject(ToastService);
  protected authService = inject(AuthService);

  permissions = signal<Permission[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  filteredPermissions = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.permissions();
    }

    return this.permissions().filter((permission) =>
      [
        permission.name,
        permission.key,
        permission.module,
        permission.description,
      ].some((value) => value.toLowerCase().includes(term)),
    );
  });

  groupedPermissions = computed(() => {
    const groups = new Map<string, Permission[]>();

    for (const permission of this.filteredPermissions()) {
      const group = groups.get(permission.module) ?? [];
      group.push(permission);
      groups.set(permission.module, group);
    }

    return Array.from(groups.entries()).map(([module, permissions]) => ({
      module,
      permissions,
    }));
  });

  ngOnInit() {
    this.isLoading.set(true);

    this.adminAccessService.getPermissions().subscribe({
      next: (response) => {
        this.permissions.set(response.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.error('No se pudieron cargar los permisos.');
      },
    });
  }

  deletePermission(id: string) {
    if (!confirm('¿Está seguro de que desea eliminar este permiso?')) {
      return;
    }

    this.adminAccessService.deletePermission(id).subscribe({
      next: () => {
        this.toast.success('Permiso eliminado correctamente.');
        // Refresh the permissions list
        this.ngOnInit();
      },
      error: (err) => {
        const msg = err.error?.message || 'No se pudo eliminar el permiso.';
        this.toast.error(msg);
      },
    });
  }
}
