import { Component, inject } from '@angular/core';
import { ToastService, Toast } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1200">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="toast-item shadow-sm"
          [class]="getToastClass(toast)"
          role="status"
          aria-live="polite"
        >
          <div class="toast-header-custom">
            <strong>{{ getHeader(toast) }}</strong>
            <button
              type="button"
              class="toast-close"
              aria-label="Cerrar notificacion"
              (click)="toastService.dismiss(toast.id)"
            >
              x
            </button>
          </div>
          <div class="d-flex align-items-center gap-2">
            <span>{{ getIcon(toast) }}</span>
            <span>{{ toast.message }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      position: fixed;
      top: 0;
      right: 0;
      z-index: 1200;
    }

    .toast-container {
      display: grid;
      gap: 12px;
    }

    .toast-item {
      min-width: 280px;
      max-width: 360px;
      padding: 0;
      border: 1px solid #dbe3ef;
      border-radius: 14px;
      background: #ffffff;
      overflow: hidden;
    }

    .toast-header-custom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      font-weight: 700;
    }

    .toast-item .d-flex {
      padding: 12px 14px 14px;
      color: #1e293b;
    }

    .toast-close {
      border: 0;
      background: transparent;
      font-size: 0.95rem;
      line-height: 1;
      color: inherit;
      opacity: 0.8;
    }

    .toast-success {
      border-color: #198754;
    }

    .toast-success .toast-header-custom {
      background: #198754;
      color: #fff;
    }

    .toast-error {
      border-color: #dc3545;
    }

    .toast-error .toast-header-custom {
      background: #dc3545;
      color: #fff;
    }

    .toast-info {
      border-color: #0dcaf0;
    }

    .toast-info .toast-header-custom {
      background: #0dcaf0;
      color: #062c33;
    }

    .toast-warning {
      border-color: #ffc107;
    }

    .toast-warning .toast-header-custom {
      background: #ffc107;
      color: #3b2f00;
    }
  `]
})
export class ToastComponent {
  readonly toastService = inject(ToastService);

  getToastClass(toast: Toast): string {
    return `toast-${toast.type}`;
  }

  getHeader(toast: Toast): string {
    const headers: Record<string, string> = {
      success: '✅ Éxito',
      error:   '❌ Error',
      info:    'ℹ️ Info',
      warning: '⚠️ Atención',
    };
    return headers[toast.type] ?? 'Notificación';
  }

  getIcon(toast: Toast): string {
    const icons: Record<string, string> = {
      success: '✅',
      error:   '❌',
      info:    'ℹ️',
      warning: '⚠️',
    };
    return icons[toast.type] ?? '🔔';
  }
}
