import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminAccessService } from '../services/admin-access.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { Permission } from '../data/access.interfaces';

@Component({
  selector: 'app-role-edit',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <main class="form-page">
      <a routerLink="/admin/roles" class="back-link">Volver a roles</a>
      <h1>Editar rol</h1>

      <form #roleForm="ngForm" (ngSubmit)="onSubmit(roleForm)" class="role-form">
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Key</label>
            <input
              type="text"
              class="form-control"
              name="key"
              placeholder="MODERATOR"
              required
              [(ngModel)]="role.key"
              #keyCtrl="ngModel"
              [class.is-invalid]="keyCtrl.invalid && keyCtrl.touched"
            >
            @if (keyCtrl.invalid && keyCtrl.touched) {
              <div class="invalid-feedback">La key del rol es requerida.</div>
            }
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Nombre</label>
            <input
              type="text"
              class="form-control"
              name="name"
              placeholder="Moderador"
              required
              [(ngModel)]="role.name"
              #nameCtrl="ngModel"
              [class.is-invalid]="nameCtrl.invalid && nameCtrl.touched"
            >
            @if (nameCtrl.invalid && nameCtrl.touched) {
              <div class="invalid-feedback">El nombre es requerido.</div>
            }
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Descripción</label>
          <textarea
            class="form-control"
            name="description"
            rows="3"
            required
            [(ngModel)]="role.description"
            #descriptionCtrl="ngModel"
            [class.is-invalid]="descriptionCtrl.invalid && descriptionCtrl.touched"
          ></textarea>
          @if (descriptionCtrl.invalid && descriptionCtrl.touched) {
            <div class="invalid-feedback">La descripción es requerida.</div>
          }
        </div>

        <div class="form-check form-switch mb-4">
          <input
            class="form-check-input"
            type="checkbox"
            role="switch"
            id="roleActive"
            name="isActive"
            [(ngModel)]="role.isActive"
          >
          <label class="form-check-label" for="roleActive">Rol activo</label>
        </div>

        <div class="permission-panel">
          <div class="permission-header">
            <div>
              <h2>Permisos</h2>
              <span>{{ selectedCount() }} seleccionados</span>
            </div>
            <input
              type="search"
              class="form-control"
              placeholder="Filtrar permisos..."
              [ngModel]="permissionSearch()"
              (ngModelChange)="permissionSearch.set($event)"
              name="permissionSearch"
            >
          </div>

          @if (isLoadingPermissions()) {
            <div class="text-muted py-3">Cargando permisos...</div>
          } @else {
            <div class="permission-list">
              @for (permission of filteredPermissions(); track permission._id) {
                <label class="permission-option">
                  <input
                    type="checkbox"
                    [checked]="isSelected(permission.key)"
                    (change)="togglePermission(permission.key)"
                  >
                  <span>
                    <strong>{{ permission.key }}</strong>
                    <small>{{ permission.name }}</small>
                  </span>
                </label>
              } @empty {
                <div class="text-muted py-3">No se encontraron permisos.</div>
              }
            </div>
          }
        </div>

        <button type="submit" class="btn btn-primary mt-4" [disabled]="isSaving() || roleForm.invalid">
          {{ isSaving() ? 'Guardando...' : 'Actualizar rol' }}
        </button>
      </form>
    </main>
  `,
  styles: [`
    .form-page {
      width: min(860px, calc(100% - 32px));
      margin: 0 auto;
      padding: 32px 0 56px;
    }

    .back-link {
      display: inline-block;
      margin-bottom: 18px;
      color: #0f766e;
      font-weight: 700;
      text-decoration: none;
    }

    h1 {
      margin: 0 0 22px;
      font-size: 2.25rem;
    }

    h2 {
      margin: 0;
      font-size: 1.15rem;
    }

    .role-form,
    .permission-panel {
      padding: 22px;
      border: 1px solid #d7dde7;
      border-radius: 8px;
      background: #fff;
    }

    .permission-header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(240px, 360px);
      gap: 16px;
      align-items: center;
      margin-bottom: 14px;
    }

    .permission-header span {
      color: #64748b;
    }

    .permission-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 10px;
    }

    .permission-option {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      padding: 12px;
      border: 1px solid #d7dde7;
      border-radius: 8px;
    }

    .permission-option span {
      display: flex;
      flex-direction: column;
    }

    .permission-option small {
      color: #64748b;
    }

    @media (max-width: 640px) {
      .permission-header {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class RoleEditComponent implements OnInit {
  private adminAccessService = inject(AdminAccessService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  permissions = signal<Permission[]>([]);
  selectedPermissions = signal<string[]>([]);
  permissionSearch = signal('');
  isLoadingPermissions = signal(false);
  isSaving = signal(false);
  selectedCount = computed(() => this.selectedPermissions().length);
  filteredPermissions = computed(() => {
    const term = this.permissionSearch().trim().toLowerCase();

    if (!term) {
      return this.permissions();
    }

    return this.permissions().filter((permission) =>
      [permission.key, permission.name, permission.module, permission.description].some((value) =>
        value.toLowerCase().includes(term),
      ),
    );
  });

  role = {
    key: '',
    name: '',
    description: '',
    isActive: true,
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isLoadingPermissions.set(true);
      this.adminAccessService.getPermissions().subscribe({
        next: (response) => {
          this.permissions.set(response.data);
          this.isLoadingPermissions.set(false);
          
          // Load role data to populate form
          this.adminAccessService.getRoles().subscribe({
            next: (roleResponse) => {
              const role = roleResponse.data.find((r: any) => r._id === id);
              if (role) {
                this.role = { ...role };
                this.selectedPermissions.set(role.permissions || []);
              } else {
                this.toast.error('Rol no encontrado');
                this.router.navigate(['/admin/roles']);
              }
            },
            error: () => {
              this.toast.error('No se pudo cargar el rol');
              this.router.navigate(['/admin/roles']);
            }
          });
        },
        error: () => {
          this.isLoadingPermissions.set(false);
          this.toast.error('No se pudieron cargar los permisos');
          this.router.navigate(['/admin/roles']);
        },
      });
    }
  }

  isSelected(permission: string): boolean {
    return this.selectedPermissions().includes(permission);
  }

  togglePermission(permission: string) {
    this.selectedPermissions.update((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission],
    );
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      this.toast.warning('Por favor corrige los errores antes de continuar.');
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.isSaving.set(true);
    this.adminAccessService.updateRole(id, {
      key: this.role.key,
      name: this.role.name,
      description: this.role.description,
      permissions: this.selectedPermissions(),
      isActive: this.role.isActive,
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.toast.success('Rol actualizado correctamente.');
        this.router.navigate(['/admin/roles']);
      },
      error: (err) => {
        this.isSaving.set(false);
        const msg = err.error?.message || 'No se pudo actualizar el rol.';
        this.toast.error(msg);
      },
    });
  }
}
