import { Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { PASSWORD_PATTERN } from '../../../../shared/pipes/password-strength.pipe';
import { PasswordStrengthPipe } from '../../../../shared/pipes/password-strength.pipe';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  template: `
    <div class="container d-flex justify-content-center align-items-center min-vh-100 py-5 px-3">
      <div class="card shadow-lg p-4 auth-card">
        <div class="text-center mb-4">
          <h2 class="fw-bold">Crear Cuenta</h2>
          <p class="text-muted mb-0">Unete a nuestra plataforma</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Nombre</label>
              <input type="text" class="form-control" formControlName="firstName" [class.is-invalid]="showError('firstName')">
              @if (showError('firstName')) {
                <div class="invalid-feedback">El nombre es requerido.</div>
              }
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label">Apellido</label>
              <input type="text" class="form-control" formControlName="lastName" [class.is-invalid]="showError('lastName')">
              @if (showError('lastName')) {
                <div class="invalid-feedback">El apellido es requerido.</div>
              }
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Usuario</label>
            <input type="text" class="form-control" formControlName="username" [class.is-invalid]="showError('username')">
            @if (showError('username')) {
              <div class="invalid-feedback">El usuario es requerido.</div>
            }
          </div>

          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" formControlName="email" [class.is-invalid]="showError('email')">
            @if (showError('email')) {
              <div class="invalid-feedback">
                {{ form.controls.email.errors?.['required'] ? 'El email es requerido.' : 'Ingresa un email valido.' }}
              </div>
            }
          </div>

          <div class="mb-3">
            <label class="form-label">Contrasena</label>
            <input
              type="password"
              class="form-control"
              formControlName="password"
              [class.is-invalid]="showError('password')"
              [class.is-valid]="form.controls.password.valid && form.controls.password.touched"
            >

            @let strength = passwordStrength();
            <div class="mt-2 px-1">
              <small class="d-block fw-semibold text-muted mb-1">Requisitos de contrasena:</small>
              <ul class="list-unstyled mb-0 helper-list">
                <li [class.text-success]="strength.hasMinLength" [class.text-danger]="!strength.hasMinLength && form.controls.password.touched">
                  {{ strength.hasMinLength ? 'OK' : 'NO' }} Minimo 8 caracteres
                </li>
                <li [class.text-success]="strength.hasUppercase" [class.text-danger]="!strength.hasUppercase && form.controls.password.touched">
                  {{ strength.hasUppercase ? 'OK' : 'NO' }} Al menos una mayuscula
                </li>
                <li [class.text-success]="strength.hasLowercase" [class.text-danger]="!strength.hasLowercase && form.controls.password.touched">
                  {{ strength.hasLowercase ? 'OK' : 'NO' }} Al menos una minuscula
                </li>
                <li [class.text-success]="strength.hasDigit" [class.text-danger]="!strength.hasDigit && form.controls.password.touched">
                  {{ strength.hasDigit ? 'OK' : 'NO' }} Al menos un numero
                </li>
                <li [class.text-success]="strength.hasSpecial" [class.text-danger]="!strength.hasSpecial && form.controls.password.touched">
                  {{ strength.hasSpecial ? 'OK' : 'NO' }} Al menos un caracter especial
                </li>
              </ul>
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label">Confirmar contrasena</label>
            <input
              type="password"
              class="form-control"
              formControlName="confirmPassword"
              [class.is-invalid]="confirmPasswordInvalid()"
              [class.is-valid]="confirmPasswordValid()"
            >
            @if (form.controls.confirmPassword.touched && form.controls.confirmPassword.errors?.['required']) {
              <div class="invalid-feedback">Confirma la contrasena.</div>
            } @else if (form.touched && form.errors?.['passwordMismatch']) {
              <div class="invalid-feedback">Las contrasenas no coinciden.</div>
            }
          </div>

          <div class="d-grid gap-2">
            <button type="submit" class="btn btn-primary btn-lg" [disabled]="isLoading() || form.invalid">
              @if (isLoading()) {
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              }
              {{ isLoading() ? 'Procesando...' : 'Registrarse' }}
            </button>
          </div>
        </form>

        <div class="text-center mt-4">
          <p class="mb-0">
            Ya tienes cuenta?
            <a routerLink="/auth/login" class="text-decoration-none fw-bold">Inicia sesion</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-card {
      width: 100%;
      max-width: 520px;
      border-radius: 1rem;
    }

    .helper-list {
      font-size: 0.8rem;
    }
  `],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private passwordStrengthPipe = new PasswordStrengthPipe();

  isLoading = signal(false);

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]],
    confirmPassword: ['', [Validators.required]],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    phone: [''],
  }, { validators: passwordMatchValidator });

  passwordStrength = computed(() => this.passwordStrengthPipe.transform(this.form.controls.password.value));

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Por favor corrige los errores antes de continuar.');
      return;
    }

    this.isLoading.set(true);
    const { confirmPassword, ...payload } = this.form.getRawValue();

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toast.success('Registro exitoso. Redirigiendo al login...');
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  showError(controlName: 'firstName' | 'lastName' | 'username' | 'email' | 'password') {
    const control = this.form.controls[controlName];
    return control.invalid && control.touched;
  }

  confirmPasswordInvalid() {
    return this.form.controls.confirmPassword.touched &&
      (this.form.controls.confirmPassword.invalid || !!this.form.errors?.['passwordMismatch']);
  }

  confirmPasswordValid() {
    return this.form.controls.confirmPassword.touched &&
      this.form.controls.confirmPassword.valid &&
      !this.form.errors?.['passwordMismatch'];
  }
}
