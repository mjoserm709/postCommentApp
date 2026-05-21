import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  template: `
    <div class="container d-flex justify-content-center align-items-center min-vh-100 px-3">
      <div class="card shadow-lg p-4 auth-card">
        <div class="text-center mb-4">
          <h2 class="fw-bold">Bienvenido</h2>
          <p class="text-muted mb-0">Inicia sesion en tu cuenta</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label for="username" class="form-label">Usuario</label>
            <input
              id="username"
              type="text"
              class="form-control form-control-lg"
              formControlName="username"
              [class.is-invalid]="showError('username')"
            >
            @if (showError('username')) {
              <div class="invalid-feedback">El usuario es requerido.</div>
            }
          </div>

          <div class="mb-4">
            <label for="password" class="form-label">Contrasena</label>
            <input
              id="password"
              type="password"
              class="form-control form-control-lg"
              formControlName="password"
              [class.is-invalid]="showError('password')"
            >
            @if (showError('password')) {
              <div class="invalid-feedback">La contrasena es requerida.</div>
            }
          </div>

          <div class="d-grid gap-2">
            <button type="submit" class="btn btn-primary btn-lg" [disabled]="isLoading() || form.invalid">
              @if (isLoading()) {
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              }
              {{ isLoading() ? 'Ingresando...' : 'Iniciar sesion' }}
            </button>
          </div>
        </form>

        <div class="text-center mt-4">
          <p class="mb-0">
            No tienes cuenta?
            <a routerLink="/auth/register" class="text-decoration-none fw-bold">Registrate</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-card {
      width: 100%;
      max-width: 420px;
      border-radius: 1rem;
    }
  `],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/']);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  showError(controlName: 'username' | 'password') {
    const control = this.form.controls[controlName];
    return control.invalid && control.touched;
  }
}
