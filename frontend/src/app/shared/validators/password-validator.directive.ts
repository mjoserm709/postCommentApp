import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { PASSWORD_PATTERN } from '../pipes/password-strength.pipe';

/**
 * Directiva validadora para campos de contraseña con ngModel.
 *
 * Uso en template:
 *   <input type="password" ngModel name="password" appPasswordValidator>
 *
 * El error queda disponible como: control.errors?.['passwordStrength']
 */
@Directive({
  selector: '[appPasswordValidator]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: PasswordValidatorDirective,
      multi: true
    }
  ]
})
export class PasswordValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value ?? '';

    if (!value) return null; // deja que `required` maneje el campo vacío

    const valid = PASSWORD_PATTERN.test(value);

    return valid
      ? null
      : {
          passwordStrength: {
            message: 'La contraseña no cumple los requisitos de seguridad',
            requirements: {
              hasLowercase: /[a-z]/.test(value),
              hasUppercase: /[A-Z]/.test(value),
              hasDigit:     /\d/.test(value),
              hasSpecial:   /[@$!%*?&.#_-]/.test(value),
              hasMinLength: value.length >= 8,
            }
          }
        };
  }
}
