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
      <label class="form-label">Titulo</label>
      <input class="form-control" formControlName="title" (input)="syncSlug()">

      <label class="form-label mt-3">Slug</label>
      <input class="form-control" formControlName="slug">

      <label class="form-label mt-3">Resumen</label>
      <textarea class="form-control" rows="2" formControlName="excerpt"></textarea>

      <label class="form-label mt-3">Contenido</label>
      <textarea class="form-control" rows="7" formControlName="content"></textarea>

      <div class="row mt-3">
        <div class="col-md-6">
          <label class="form-label">Categoria</label>
          <select class="form-select" formControlName="categorySlug">
            <option value="">Selecciona</option>
            @for (category of categories; track category._id) {
              <option [value]="category.slug">{{ category.name }}</option>
            }
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label">Estado</label>
          <select class="form-select" formControlName="status">
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="archived">Archivado</option>
          </select>
        </div>
      </div>

      <label class="form-label mt-3">Tags separados por coma</label>
      <input class="form-control" formControlName="tagsInput">

      <label class="form-label mt-3">URL de portada</label>
      <input class="form-control" formControlName="coverImageUrl">

      <div class="form-check form-switch mt-3">
        <input class="form-check-input" type="checkbox" id="commentsEnabled" formControlName="commentsEnabled">
        <label class="form-check-label" for="commentsEnabled">Permitir comentarios</label>
      </div>

      @if (hasValidationErrors()) {
        <div class="error-box">Revisa los campos obligatorios. El resumen y contenido deben tener una longitud minima valida.</div>
      }

      <div class="modal-actions">
        <button class="btn btn-outline-secondary" type="button" (click)="cancel.emit()">Cancelar</button>
        <button class="btn btn-primary" type="submit" [disabled]="isSubmitting || form.invalid">
          {{ isSubmitting ? 'Guardando...' : submitLabel }}
        </button>
      </div>
    </form>
  `,
  styles: [`
    .post-form {
      padding: 22px;
      border: 1px solid #d7dde7;
      border-radius: 12px;
      background: #fff;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 22px;
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
