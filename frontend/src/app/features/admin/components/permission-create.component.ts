import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminAccessService } from '../services/admin-access.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-permission-create',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <main class="form-page">
      <a routerLink="/admin/permissions" class="back-link">Volver a permisos</a>
      <h1>Crear permiso</h1>

      <form #permissionForm="ngForm" (ngSubmit)="onSubmit(permissionForm)" class="permission-form">
        <div class="mb-3">
          <label class="form-label">Key</label>
          <input
            type="text"
            class="form-control"
            name="key"
            placeholder="posts.publish"
            required
            [(ngModel)]="permission.key"
            #keyCtrl="ngModel"
            [class.is-invalid]="keyCtrl.invalid && keyCtrl.touched"
          >
          @if (keyCtrl.invalid && keyCtrl.touched) {
            <div class="invalid-feedback">La key del permiso es requerida.</div>
          }
        </div>

        <div class="mb-3">
          <label class="form-label">Nombre</label>
          <input
            type="text"
            class="form-control"
            name="name"
            placeholder="Publicar posts"
            required
            [(ngModel)]="permission.name"
            #nameCtrl="ngModel"
            [class.is-invalid]="nameCtrl.invalid && nameCtrl.touched"
          >
          @if (nameCtrl.invalid && nameCtrl.touched) {
            <div class="invalid-feedback">El nombre es requerido.</div>
          }
        </div>

        <div class="mb-3">
          <label class="form-label">Módulo</label>
          <input
            type="text"
            class="form-control"
            name="module"
            placeholder="posts"
            required
            [(ngModel)]="permission.module"
            #moduleCtrl="ngModel"
            [class.is-invalid]="moduleCtrl.invalid && moduleCtrl.touched"
          >
          @if (moduleCtrl.invalid && moduleCtrl.touched) {
            <div class="invalid-feedback">El módulo es requerido.</div>
          }
        </div>

        <div class="mb-3">
          <label class="form-label">Descripción</label>
          <textarea
            class="form-control"
            name="description"
            rows="4"
            required
            [(ngModel)]="permission.description"
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
            id="permissionActive"
            name="isActive"
            [(ngModel)]="permission.isActive"
          >
          <label class="form-check-label" for="permissionActive">Permiso activo</label>
        </div>

        <button type="submit" class="btn btn-primary" [disabled]="isLoading() || permissionForm.invalid">
          {{ isLoading() ? 'Guardando...' : 'Crear permiso' }}
        </button>
      </form>
    </main>
  `,
  styles: [
    `
      .form-page {
        width: min(720px, calc(100% - 32px));
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

      .permission-form {
        padding: 22px;
        border: 1px solid #d7dde7;
        border-radius: 8px;
        background: #fff;
      }
    `,
  ],
})
export class PermissionCreateComponent {
  private adminAccessService = inject(AdminAccessService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private authService = inject(AuthService);

  isLoading = signal(false);
  permission = {
    key: '',
    name: '',
    module: '',
    description: '',
    isActive: true,
  };

  ngOnInit() {
    if (!this.authService.hasPermission('permissions.create')) {
      this.router.navigate(['/admin']);
    }
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      this.toast.warning('Por favor corrige los errores antes de continuar.');
      return;
    }

    this.isLoading.set(true);
    this.adminAccessService.createPermission(this.permission).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toast.success('Permiso creado correctamente.');
        this.router.navigate(['/admin/permissions']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.error?.message || 'No se pudo crear el permiso.';
        this.toast.error(msg);
      },
    });
  }
}
