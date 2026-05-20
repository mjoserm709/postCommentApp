import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container d-flex justify-content-center align-items-center min-vh-100">
      <div class="card shadow-lg p-4" style="width: 100%; max-width: 400px; border-radius: 1rem;">
        <div class="text-center mb-4">
          <h2 class="fw-bold">Bienvenido</h2>
          <p class="text-muted">Inicia sesión en tu cuenta</p>
        </div>

        <div *ngIf="error()" class="alert alert-danger" role="alert">
          {{ error() }}
        </div>

        <form (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label for="username" class="form-label">Usuario</label>
            <input type="text" class="form-control form-control-lg" id="username" [(ngModel)]="credentials.username" name="username" required>
          </div>
          
          <div class="mb-4">
            <label for="password" class="form-label">Contraseña</label>
            <input type="password" class="form-control form-control-lg" id="password" [(ngModel)]="credentials.password" name="password" required>
          </div>

          <div class="d-grid gap-2">
            <button type="submit" class="btn btn-primary btn-lg" [disabled]="isLoading()">
              <span *ngIf="isLoading()" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {{ isLoading() ? 'Ingresando...' : 'Iniciar Sesión' }}
            </button>
          </div>
        </form>

        <div class="text-center mt-4">
          <p class="mb-0">¿No tienes cuenta? <a routerLink="/register" class="text-decoration-none fw-bold">Regístrate</a></p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials = { username: '', password: '' };
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  onSubmit() {
    this.isLoading.set(true);
    this.error.set(null);

    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.router.navigate(['/users']); // Redirigir a usuarios tras éxito
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Usuario o contraseña incorrectos');
      }
    });
  }
}
