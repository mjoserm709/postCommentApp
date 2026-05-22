import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AdminAccessService } from '../../admin/services/admin-access.service';
import { Role } from '../../admin/data/access.interfaces';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { User } from '../data/user.interfaces';
import { UsersService } from '../services/users.service';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <main class="form-page">
      <a routerLink="/admin/users" class="back-link">Volver a usuarios</a>
      <h1>Editar usuario</h1>

      @if (isLoading()) {
        <div class="text-muted py-4">Cargando usuario...</div>
      } @else {
        <form #userForm="ngForm" (ngSubmit)="onSubmit(userForm)" class="user-form">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Usuario</label>
              <input
                type="text"
                class="form-control"
                name="username"
                required
                [(ngModel)]="user.username"
                #usernameCtrl="ngModel"
                [class.is-invalid]="usernameCtrl.invalid && usernameCtrl.touched"
              >
              @if (usernameCtrl.invalid && usernameCtrl.touched) {
                <div class="invalid-feedback">El usuario es requerido.</div>
              }
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label">Email</label>
              <input
                type="email"
                class="form-control"
                name="email"
                required
                email
                [(ngModel)]="user.email"
                #emailCtrl="ngModel"
                [class.is-invalid]="emailCtrl.invalid && emailCtrl.touched"
              >
              @if (emailCtrl.invalid && emailCtrl.touched) {
                <div class="invalid-feedback">Ingresa un email valido.</div>
              }
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Nombre</label>
              <input
                type="text"
                class="form-control"
                name="firstName"
                required
                [(ngModel)]="user.firstName"
                #firstNameCtrl="ngModel"
                [class.is-invalid]="firstNameCtrl.invalid && firstNameCtrl.touched"
              >
              @if (firstNameCtrl.invalid && firstNameCtrl.touched) {
                <div class="invalid-feedback">El nombre es requerido.</div>
              }
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label">Apellido</label>
              <input
                type="text"
                class="form-control"
                name="lastName"
                required
                [(ngModel)]="user.lastName"
                #lastNameCtrl="ngModel"
                [class.is-invalid]="lastNameCtrl.invalid && lastNameCtrl.touched"
              >
              @if (lastNameCtrl.invalid && lastNameCtrl.touched) {
                <div class="invalid-feedback">El apellido es requerido.</div>
              }
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Telefono</label>
            <input type="text" class="form-control" name="phone" [(ngModel)]="user.phone">
          </div>

          <div class="form-check form-switch mb-4">
            <input
              class="form-check-input"
              type="checkbox"
              role="switch"
              id="userActive"
              name="isActive"
              [(ngModel)]="user.isActive"
            >
            <label class="form-check-label" for="userActive">Usuario activo</label>
          </div>

          <section class="role-panel">
            <div class="role-header">
              <div>
                <h2>Roles</h2>
                <span>{{ selectedCount() }} seleccionados</span>
              </div>
            </div>

            <div class="role-list">
              @for (role of activeRoles(); track role._id) {
                <label class="role-option">
                  <input
                    type="checkbox"
                    [checked]="isRoleSelected(role.key)"
                    (change)="toggleRole(role.key)"
                  >
                  <span>
                    <strong>{{ role.name }}</strong>
                    <small>{{ role.key }}</small>
                  </span>
                </label>
              } @empty {
                <div class="text-muted py-3">No hay roles disponibles.</div>
              }
            </div>
          </section>

          <button type="submit" class="btn btn-primary mt-4" [disabled]="isSaving() || userForm.invalid">
            {{ isSaving() ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </form>
      }
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

    .user-form,
    .role-panel {
      padding: 22px;
      border: 1px solid #d7dde7;
      border-radius: 8px;
      background: #fff;
    }

    .role-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 14px;
    }

    .role-header span {
      color: #64748b;
    }

    .role-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 10px;
    }

    .role-option {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      padding: 12px;
      border: 1px solid #d7dde7;
      border-radius: 8px;
    }

    .role-option span {
      display: flex;
      flex-direction: column;
    }

    .role-option small {
      color: #64748b;
    }
  `],
})
export class UserEditComponent implements OnInit {
  private usersService = inject(UsersService);
  private adminAccessService = inject(AdminAccessService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  roles = signal<Role[]>([]);
  selectedRoles = signal<string[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);

  selectedCount = computed(() => this.selectedRoles().length);
  activeRoles = computed(() => this.roles().filter((role) => role.isActive));

  user: Partial<User> = {
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    isActive: true,
  };

  ngOnInit() {
    if (!this.authService.hasPermission('users.update')) {
      this.router.navigate(['/admin']);
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/admin/users']);
      return;
    }

    this.isLoading.set(true);
    forkJoin({
      userResponse: this.usersService.getUser(id),
      rolesResponse: this.adminAccessService.getRoles(),
    }).subscribe({
      next: ({ userResponse, rolesResponse }) => {
        this.user = { ...userResponse.data };
        this.selectedRoles.set(userResponse.data.roles ?? []);
        this.roles.set(rolesResponse.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.error('No se pudo cargar el usuario.');
        this.router.navigate(['/admin/users']);
      },
    });
  }

  isRoleSelected(role: string): boolean {
    return this.selectedRoles().includes(role);
  }

  toggleRole(role: string) {
    this.selectedRoles.update((current) =>
      current.includes(role)
        ? current.filter((item) => item !== role)
        : [...current, role],
    );
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      this.toast.warning('Por favor corrige los errores antes de continuar.');
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }

    this.isSaving.set(true);
    this.usersService.updateUser(id, {
      username: this.user.username,
      email: this.user.email,
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      phone: this.user.phone,
      roles: this.selectedRoles(),
      isActive: this.user.isActive,
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.toast.success('Usuario actualizado correctamente.');
        this.router.navigate(['/admin/users']);
      },
      error: (err) => {
        this.isSaving.set(false);
        const msg = err.error?.message || 'No se pudo actualizar el usuario.';
        this.toast.error(msg);
      },
    });
  }
}
