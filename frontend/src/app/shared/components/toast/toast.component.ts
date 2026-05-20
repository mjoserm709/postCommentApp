import { Component, inject } from '@angular/core';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastService, Toast } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgbToastModule],
    template: `
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1200">
      <ngb-toast *ngFor="let toast of toastService.toasts(); let i = index"
                 [class]="getToastClass(toast)"
                 [autohide]="true"
                 [delay]="toast.duration"
                 (hidden)="toastService.dismiss(toast.id)"
                 [header]="getHeader(toast)"
      >
        <div class="d-flex align-items-center gap-2">
          <span>{{ getIcon(toast) }}</span>
          <span>{{ toast.message }}</span>
        </div>
      </ngb-toast>
    </div>
  `,
  styles: [`
    :host {
      position: fixed;
      top: 0;
      right: 0;
      z-index: 1200;
    }

    ngb-toast.toast-success {
      --bs-toast-border-color: #198754;
      --bs-toast-header-color: #fff;
      --bs-toast-header-bg: #198754;
    }

    ngb-toast.toast-error {
      --bs-toast-border-color: #dc3545;
      --bs-toast-header-color: #fff;
      --bs-toast-header-bg: #dc3545;
    }

    ngb-toast.toast-info {
      --bs-toast-border-color: #0dcaf0;
      --bs-toast-header-color: #fff;
      --bs-toast-header-bg: #0dcaf0;
    }

    ngb-toast.toast-warning {
      --bs-toast-border-color: #ffc107;
      --bs-toast-header-color: #000;
      --bs-toast-header-bg: #ffc107;
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
