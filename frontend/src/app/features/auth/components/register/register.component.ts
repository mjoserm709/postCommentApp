import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { PasswordStrengthPipe } from '../../../../shared/pipes/password-strength.pipe';
import { PasswordValidatorDirective } from '../../../../shared/validators/password-validator.directive';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule, PasswordStrengthPipe, PasswordValidatorDirective],
  template: `
    <div class="container d-flex justify-content-center align-items-center min-vh-100 py-5">
      <div class="card shadow-lg p-4" style="width: 100%; max-width: 500px; border-radius: 1rem;">

        <div class="text-center mb-4">
          <h2 class="fw-bold">Crear Cuenta</h2>
          <p class="text-muted">Únete a nuestra plataforma</p>
        </div>

        <form #registerForm="ngForm" (ngSubmit)="onSubmit(registerForm)">

          <!-- Nombre y Apellido -->
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Nombre</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="userData.firstName"
                name="firstName"
                required
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
                [(ngModel)]="userData.lastName"
                name="lastName"
                required
                #lastNameCtrl="ngModel"
                [class.is-invalid]="lastNameCtrl.invalid && lastNameCtrl.touched"
              >
              @if (lastNameCtrl.invalid && lastNameCtrl.touched) {
                <div class="invalid-feedback">El apellido es requerido.</div>
              }
            </div>
          </div>

          <!-- Usuario -->
          <div class="mb-3">
            <label class="form-label">Usuario</label>
            <input
              type="text"
              class="form-control"
              [(ngModel)]="userData.username"
              name="username"
              required
              #usernameCtrl="ngModel"
              [class.is-invalid]="usernameCtrl.invalid && usernameCtrl.touched"
            >
            @if (usernameCtrl.invalid && usernameCtrl.touched) {
              <div class="invalid-feedback">El usuario es requerido.</div>
            }
          </div>

          <!-- Email -->
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input
              type="email"
              class="form-control"
              [(ngModel)]="userData.email"
              name="email"
              required
              email
              #emailCtrl="ngModel"
              [class.is-invalid]="emailCtrl.invalid && emailCtrl.touched"
            >
            @if (emailCtrl.invalid && emailCtrl.touched) {
              @if (emailCtrl.errors?.['required']) {
                <div class="invalid-feedback">El email es requerido.</div>
              } @else {
                <div class="invalid-feedback">Ingresa un email válido.</div>
              }
            }
          </div>

          <!-- Contraseña + Pipe de validación en tiempo real -->
          <div class="mb-3">
            <label class="form-label">Contraseña</label>
            <input
              type="password"
              class="form-control"
              [(ngModel)]="userData.password"
              name="password"
              required
              appPasswordValidator
              #passwordCtrl="ngModel"
              [class.is-invalid]="passwordCtrl.invalid && passwordCtrl.touched"
              [class.is-valid]="passwordCtrl.valid && passwordCtrl.touched"
            >

            <!-- Checklist en tiempo real usando el Pipe -->
            @let strength = userData.password | passwordStrength;

            <div class="mt-2 px-1">
              <small class="d-block fw-semibold text-muted mb-1">Requisitos de contraseña:</small>
              <ul class="list-unstyled mb-0" style="font-size: 0.8rem;">
                <li [class.text-success]="strength.hasMinLength" [class.text-danger]="!strength.hasMinLength && passwordCtrl.touched">
                  {{ strength.hasMinLength ? '✅' : '❌' }} Mínimo 8 caracteres
                </li>
                <li [class.text-success]="strength.hasUppercase" [class.text-danger]="!strength.hasUppercase && passwordCtrl.touched">
                  {{ strength.hasUppercase ? '✅' : '❌' }} Al menos una mayúscula (A-Z)
                </li>
                <li [class.text-success]="strength.hasLowercase" [class.text-danger]="!strength.hasLowercase && passwordCtrl.touched">
                  {{ strength.hasLowercase ? '✅' : '❌' }} Al menos una minúscula (a-z)
                </li>
                <li [class.text-success]="strength.hasDigit" [class.text-danger]="!strength.hasDigit && passwordCtrl.touched">
                  {{ strength.hasDigit ? '✅' : '❌' }} Al menos un número (0-9)
                </li>
                <li [class.text-success]="strength.hasSpecial" [class.text-danger]="!strength.hasSpecial && passwordCtrl.touched">
                  {{ strength.hasSpecial ? '✅' : '❌' }} Al menos un carácter especial (@$!%*?&.#_-)
                </li>
              </ul>
            </div>
          </div>

          <!-- Confirmar contraseña -->
          <div class="mb-4">
            <label class="form-label">Confirmar contraseña</label>
            <input
              type="password"
              class="form-control"
              [(ngModel)]="userData.confirmPassword"
              name="confirmPassword"
              required
              #confirmPasswordCtrl="ngModel"
              [class.is-invalid]="confirmPasswordCtrl.touched && (confirmPasswordCtrl.invalid || !passwordsMatch())"
              [class.is-valid]="confirmPasswordCtrl.touched && confirmPasswordCtrl.valid && passwordsMatch()"
            >

            @if (confirmPasswordCtrl.touched && confirmPasswordCtrl.errors?.['required']) {
              <div class="invalid-feedback">Confirma la contraseña.</div>
            } @else if (confirmPasswordCtrl.touched && !passwordsMatch()) {
              <div class="invalid-feedback">Las contraseñas no coinciden.</div>
            }
          </div>

          <!-- Botón -->
          <div class="d-grid gap-2">
            <button
              type="submit"
              class="btn btn-primary btn-lg"
              [disabled]="isLoading() || registerForm.invalid || !passwordsMatch()"
            >
              @if (isLoading()) {
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              }
              {{ isLoading() ? 'Procesando...' : 'Registrarse' }}
            </button>
          </div>

        </form>

        <div class="text-center mt-4">
          <p class="mb-0">¿Ya tienes cuenta? <a routerLink="/auth/login" class="text-decoration-none fw-bold">Inicia Sesión</a></p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  userData = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  };

  isLoading = signal<boolean>(false);

  onSubmit(form: NgForm) {
    if (form.invalid || !this.passwordsMatch()) {
      form.control.markAllAsTouched();
      this.toast.warning('Por favor corrige los errores antes de continuar.');
      return;
    }

    this.isLoading.set(true);
    const { confirmPassword, ...payload } = this.userData;

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toast.success('¡Registro exitoso! Redirigiendo al login...');
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.error?.message || 'Hubo un error en el registro';
        this.toast.error(msg);
      }
    });
  }

  passwordsMatch(): boolean {
    return this.userData.password === this.userData.confirmPassword;
  }
}
