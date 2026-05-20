import { Pipe, PipeTransform } from '@angular/core';

export interface PasswordValidation {
  hasLowercase: boolean;   // al menos 1 minúscula
  hasUppercase: boolean;   // al menos 1 mayúscula
  hasDigit: boolean;       // al menos 1 número
  hasSpecial: boolean;     // al menos 1 carácter especial @$!%*?&.#_-
  hasMinLength: boolean;   // mínimo 8 caracteres
  isValid: boolean;        // todas las reglas cumplidas
}

const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/;

/**
 * Pipe que transforma un string de contraseña en un objeto PasswordValidation
 * con el estado de cada regla individual.
 *
 * Uso en template:
 *   @let strength = password | passwordStrength;
 *   <span [class.text-success]="strength.hasUppercase">Mayúscula</span>
 */
@Pipe({
  name: 'passwordStrength',
  standalone: true,
  pure: false // re-evalúa cada vez que el valor cambia
})
export class PasswordStrengthPipe implements PipeTransform {
  transform(password: string | null | undefined): PasswordValidation {
    const value = password ?? '';

    const hasLowercase = /[a-z]/.test(value);
    const hasUppercase = /[A-Z]/.test(value);
    const hasDigit     = /\d/.test(value);
    const hasSpecial   = /[@$!%*?&.#_-]/.test(value);
    const hasMinLength = value.length >= 8;
    const isValid      = PASSWORD_PATTERN.test(value);

    return { hasLowercase, hasUppercase, hasDigit, hasSpecial, hasMinLength, isValid };
  }
}

// Exportamos el patrón para reutilizarlo en el validator
export { PASSWORD_PATTERN };
