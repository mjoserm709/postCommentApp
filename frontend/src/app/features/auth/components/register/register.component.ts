import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container d-flex justify-content-center align-items-center min-vh-100 py-5">
      <div class="card shadow-lg p-4" style="width: 100%; max-width: 500px; border-radius: 1rem;">
        <div class="text-center mb-4">
          <h2 class="fw-bold">Crear Cuenta</h2>
          <p class="text-muted">Únete a nuestra plataforma</p>
        </div>

        <div *ngIf="error()" class="alert alert-danger" role="alert">
          {{ error() }}
        </div>
        
        <div *ngIf="success()" class="alert alert-success" role="alert">
          ¡Registro exitoso! Redirigiendo al login...
        </div>

        <form (ngSubmit)="onSubmit()">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Nombre</label>
              <input type="text" class="form-control" [(ngModel)]="userData.firstName" name="firstName" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Apellido</label>
              <input type="text" class="form-control" [(ngModel)]="userData.lastName" name="lastName" required>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Usuario</label>
            <input type="text" class="form-control" [(ngModel)]="userData.username" name="username" required>
          </div>

          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" [(ngModel)]="userData.email" name="email" required>
          </div>
          
          <div class="mb-4">
            <label class="form-label">Contraseña</label>
            <input type="password" class="form-control" [(ngModel)]="userData.password" name="password" required minlength="6">
            <div class="form-text">Mínimo 6 caracteres.</div>
          </div>

          <div class="d-grid gap-2">
            <button type="submit" class="btn btn-primary btn-lg" [disabled]="isLoading()">
              <span *ngIf="isLoading()" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {{ isLoading() ? 'Procesando...' : 'Registrarse' }}
            </button>
          </div>
        </form>

        <div class="text-center mt-4">
          <p class="mb-0">¿Ya tienes cuenta? <a routerLink="/login" class="text-decoration-none fw-bold">Inicia Sesión</a></p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  userData = {
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  };

  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<boolean>(false);

  onSubmit() {
    this.isLoading.set(true);
    this.error.set(null);

    this.authService.register(this.userData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Hubo un error en el registro');
      }
    });
  }
}
