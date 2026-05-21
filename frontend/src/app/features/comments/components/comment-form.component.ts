import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form class="comment-compose" [formGroup]="form" (ngSubmit)="submit()">
      <div>
        <input class="form-control" formControlName="content" placeholder="Escribe un comentario...">
        @if (form.controls.content.invalid && form.controls.content.touched) {
          <small class="error-copy">El comentario debe tener entre 3 y 1000 caracteres.</small>
        }
      </div>
      <button class="btn btn-primary" type="submit" [disabled]="isSubmitting || form.invalid">
        {{ isSubmitting ? 'Enviando...' : 'Enviar' }}
      </button>
    </form>
  `,
  styles: [`
    .comment-compose {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 10px;
      padding: 16px;
      border-top: 1px solid #e5e7eb;
      background: #fff;
    }

    .error-copy {
      color: #b91c1c;
    }

    @media (max-width: 720px) {
      .comment-compose {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class CommentFormComponent {
  private fb = inject(FormBuilder);

  @Input() isSubmitting = false;
  @Output() submitComment = new EventEmitter<string>();

  form = this.fb.nonNullable.group({
    content: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(1000)]],
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitComment.emit(this.form.getRawValue().content.trim());
    this.form.reset({ content: '' });
  }
}
