import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '../../shared/components/toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  private toast = inject(ToastService);

  handleHttpError(error: HttpErrorResponse, fallbackMessage = 'Ocurrio un error inesperado.'): string {
    const message =
      error.status === 429
        ? 'Has realizado demasiados intentos. Espera un momento e intenta de nuevo.'
        : error.error?.message || error.message || fallbackMessage;

    this.toast.error(message);
    return message;
  }
}
