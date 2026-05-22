import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    <div class="app-modal-backdrop" (click)="onBackdropClick()"></div>
    <section class="app-modal-shell" [class.app-modal-shell--centered]="centered">
      <div
        class="app-modal-card"
        [class.app-modal-card--sm]="size === 'sm'"
        [class.app-modal-card--md]="size === 'md'"
        [class.app-modal-card--lg]="size === 'lg'"
        [class.app-modal-card--xl]="size === 'xl'"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="title ? titleId : null"
      >
        @if (showHeader) {
          <header class="app-modal-header">
            <div>
              @if (eyebrow) {
                <span class="app-modal-eyebrow">{{ eyebrow }}</span>
              }
              @if (title) {
                <h2 class="app-modal-title" [id]="titleId">{{ title }}</h2>
              }
              @if (subtitle) {
                <p class="app-modal-subtitle">{{ subtitle }}</p>
              }
            </div>
            @if (showCloseButton) {
              <button class="btn-close" type="button" aria-label="Cerrar" (click)="requestClose.emit()"></button>
            }
          </header>
        }

        <div class="app-modal-content" [class.app-modal-content--flush]="flushContent">
          <ng-content></ng-content>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .app-modal-card {
      width: min(100%, 720px);
      max-height: min(88vh, 920px);
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      overflow: hidden;
      border: 1px solid rgba(148, 163, 184, 0.28);
      border-radius: 24px;
      background:
        linear-gradient(180deg, rgba(248, 250, 252, 0.96) 0%, rgba(255, 255, 255, 0.98) 100%);
      box-shadow: var(--app-shadow-modal);
      backdrop-filter: blur(8px);
    }

    .app-modal-card--sm { width: min(100%, 480px); }
    .app-modal-card--md { width: min(100%, 640px); }
    .app-modal-card--lg { width: min(100%, 820px); }
    .app-modal-card--xl { width: min(100%, 1040px); }

    .app-modal-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding: 24px 24px 18px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.18);
      background: linear-gradient(135deg, rgba(15, 118, 110, 0.08), rgba(14, 165, 233, 0.05));
    }

    .app-modal-eyebrow {
      display: inline-block;
      margin-bottom: 6px;
      color: #0f766e;
      font-size: 0.78rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .app-modal-title {
      margin: 0;
      font-size: clamp(1.5rem, 2vw, 1.9rem);
      line-height: 1.05;
    }

    .app-modal-subtitle {
      margin: 8px 0 0;
      max-width: 56ch;
      color: #475569;
      font-size: 0.98rem;
    }

    .app-modal-content {
      min-height: 0;
      overflow-y: auto;
    }

    .app-modal-content--flush {
      padding: 0;
    }

    @media (max-width: 720px) {
      .app-modal-card {
        max-height: none;
        border-radius: 18px;
      }

      .app-modal-header {
        padding: 18px 18px 14px;
      }
    }
  `],
})
export class AppModalComponent {
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() subtitle = '';
  @Input() size: ModalSize = 'md';
  @Input() centered = true;
  @Input() showHeader = true;
  @Input() showCloseButton = true;
  @Input() closeOnBackdrop = true;
  @Input() flushContent = true;
  @Output() requestClose = new EventEmitter<void>();

  protected readonly titleId = `app-modal-title-${Math.random().toString(36).slice(2, 10)}`;

  onBackdropClick() {
    if (this.closeOnBackdrop) {
      this.requestClose.emit();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.requestClose.emit();
  }
}
