import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { AdminAccessService } from '../services/admin-access.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-permission-edit',
  standalone: true,
  imports: [FormsModule],
  template: `
    <main class="form-page">
      <a routerLink="/admin/permissions" class="back-link">Volver a permisos</a>
      <h1>Editar permiso</h1>

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
          {{ isLoading() ? 'Guardando...' : 'Actualizar permiso' }}
        </button>
      </form>
    </main>
  `,
  styles: [`
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
  `],
})
export class PermissionEditComponent {
  private adminAccessService = inject(AdminAccessService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoading = signal(false);
  permission = {
    key: '',
    name: '',
    module: '',
    description: '',
    isActive: true,
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isLoading.set(true);
      this.adminAccessService.getPermissions().subscribe({
        next: (response) => {
          const permission = response.data.find((p: any) => p._id === id);
          if (permission) {
            this.permission = { ...permission };
          } else {
            this.toast.error('Permiso no encontrado');
            this.router.navigate(['/admin/permissions']);
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.toast.error('No se pudo cargar el permiso');
          this.router.navigate(['/admin/permissions']);
        },
      });
    }
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      this.toast.warning('Por favor corrige los errores antes de continuar.');
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.isLoading.set(true);
    this.adminAccessService.updatePermission(id, {
      key: this.permission.key,
      name: this.permission.name,
      module: this.permission.module,
      description: this.permission.description,
      isActive: this.permission.isActive,
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toast.success('Permiso actualizado correctamente.');
        this.router.navigate(['/admin/permissions']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.error?.message || 'No se pudo actualizar el permiso.';
        this.toast.error(msg);
      },
    });
  }
}