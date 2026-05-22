import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category } from '../../categories/data/category.interfaces';
import { CreatePostPayload, PostStatus } from '../data/post.interfaces';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form class="post-form" [formGroup]="form" (ngSubmit)="submit()">
      <div class="post-form-body">
        <div class="post-form-grid">
          <div class="post-field post-field-full">
            <label class="form-label">Titulo</label>
            <input class="form-control" formControlName="title" (input)="syncSlug()" placeholder="Ej. La espada eterna">
          </div>

          <div class="post-field post-field-full">
            <label class="form-label">Slug</label>
            <input class="form-control" formControlName="slug" placeholder="la-espada-eterna">
          </div>

          <div class="post-field post-field-full">
            <label class="form-label">Resumen</label>
            <textarea class="form-control" rows="3" formControlName="excerpt" placeholder="Resume en pocas lineas de que trata el post"></textarea>
          </div>

          <div class="post-field post-field-full">
            <label class="form-label">Contenido</label>
            <textarea class="form-control post-content" rows="8" formControlName="content" placeholder="Escribe aqui el contenido completo"></textarea>
          </div>

          <div class="post-field">
            <label class="form-label">Categoria</label>
            <select class="form-select" formControlName="categorySlug">
              <option value="">Selecciona</option>
              @for (category of categories; track category._id) {
                <option [value]="category.slug">{{ category.name }}</option>
              }
            </select>
          </div>

          <div class="post-field">
            <label class="form-label">Estado</label>
            <select class="form-select" formControlName="status">
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="archived">Archivado</option>
            </select>
          </div>

          <div class="post-field post-field-full">
            <label class="form-label">Tags separados por coma</label>
            <input class="form-control" formControlName="tagsInput" placeholder="fantasia, aventura, magia">
          </div>

          <div class="post-field post-field-full">
            <label class="form-label">URL de portada</label>
            <input class="form-control" formControlName="coverImageUrl" placeholder="https://...">
          </div>

          <div class="post-switch">
            <input class="form-check-input" type="checkbox" id="commentsEnabled" formControlName="commentsEnabled">
            <label class="form-check-label" for="commentsEnabled">Permitir comentarios</label>
          </div>
        </div>

        @if (hasValidationErrors()) {
          <div class="error-box">Revisa los campos obligatorios. El resumen y contenido deben tener una longitud minima valida.</div>
        }
      </div>

      <div class="modal-actions app-form-actions">
        <button class="btn btn-outline-secondary" type="button" (click)="cancel.emit()">Cancelar</button>
        <button class="btn btn-primary" type="submit" [disabled]="isSubmitting || form.invalid">
          {{ isSubmitting ? 'Guardando...' : submitLabel }}
        </button>
      </div>
    </form>
  `,
  styles: [`
    .post-form {
      display: grid;
      grid-template-rows: minmax(0, 1fr) auto;
      min-height: 0;
    }

    .post-form-body {
      overflow-y: auto;
      padding: 22px 24px 10px;
    }

    .post-form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px 16px;
    }

    .post-field {
      min-width: 0;
    }

    .post-field-full {
      grid-column: 1 / -1;
    }

    .post-form .form-label {
      margin-bottom: 8px;
      color: #0f172a;
      font-size: 0.93rem;
      font-weight: 700;
    }

    .post-form .form-control,
    .post-form .form-select {
      min-height: 48px;
      border-radius: 14px;
      border-color: #d7dde7;
      background: rgba(255, 255, 255, 0.92);
      box-shadow: none;
    }

    .post-form textarea.form-control {
      min-height: 108px;
      resize: vertical;
      padding-top: 12px;
    }

    .post-form .post-content {
      min-height: 220px;
    }

    .post-form .form-control:focus,
    .post-form .form-select:focus {
      border-color: rgba(15, 118, 110, 0.55);
      box-shadow: 0 0 0 0.2rem rgba(15, 118, 110, 0.12);
    }

    .post-switch {
      grid-column: 1 / -1;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-top: 2px;
      padding: 12px 14px;
      border: 1px solid rgba(148, 163, 184, 0.24);
      border-radius: 14px;
      background: rgba(248, 250, 252, 0.9);
    }

    .post-switch .form-check-input {
      margin: 0;
      float: none;
    }

    .post-switch .form-check-label {
      font-weight: 600;
    }

    .error-box {
      margin-top: 16px;
      padding: 12px 14px;
      border-radius: 10px;
      background: #fef2f2;
      color: #b91c1c;
      font-size: 0.92rem;
      font-weight: 600;
    }

    .modal-actions {
      padding: 18px 24px 24px;
      border-top: 1px solid rgba(148, 163, 184, 0.18);
      background: rgba(255, 255, 255, 0.96);
    }

    @media (max-width: 720px) {
      .post-form-header,
      .post-form-body,
      .modal-actions {
        padding-left: 18px;
        padding-right: 18px;
      }

      .post-form-grid {
        grid-template-columns: 1fr;
      }

      .post-field,
      .post-field-full,
      .post-switch {
        grid-column: auto;
      }
    }
  `],
})
export class PostFormComponent {
  private fb = inject(FormBuilder);
  private slugTouched = signal(false);

  @Input() categories: Category[] = [];
  @Input() isSubmitting = false;
  @Input() submitLabel = 'Crear post';
  @Input() initialCategorySlug = '';
  @Output() save = new EventEmitter<CreatePostPayload>();
  @Output() cancel = new EventEmitter<void>();

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    slug: ['', [Validators.required, Validators.minLength(3)]],
    excerpt: ['', [Validators.required, Validators.minLength(10)]],
    content: ['', [Validators.required, Validators.minLength(20)]],
    categorySlug: ['', [Validators.required, Validators.minLength(3)]],
    status: ['draft' as PostStatus, [Validators.required]],
    tagsInput: [''],
    coverImageUrl: [''],
    commentsEnabled: [true],
  });

  hasValidationErrors = computed(() => this.form.invalid && this.form.touched);

  ngOnInit() {
    if (this.initialCategorySlug) {
      this.form.patchValue({ categorySlug: this.initialCategorySlug, status: 'published' as PostStatus });
    }

    this.form.controls.slug.valueChanges.subscribe(() => {
      this.slugTouched.set(true);
    });
  }

  syncSlug() {
    if (this.slugTouched()) {
      return;
    }

    const title = this.form.controls.title.value;
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    this.form.patchValue({ slug }, { emitEvent: false });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.save.emit({
      title: raw.title.trim(),
      slug: raw.slug.trim(),
      excerpt: raw.excerpt.trim(),
      content: raw.content.trim(),
      categorySlug: raw.categorySlug.trim(),
      tags: raw.tagsInput.split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean),
      status: raw.status,
      commentsEnabled: raw.commentsEnabled,
      coverImageUrl: raw.coverImageUrl.trim() || undefined,
    });
  }
}
