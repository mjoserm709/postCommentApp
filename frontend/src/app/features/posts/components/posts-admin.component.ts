import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CategoriesService } from '../../categories/services/categories.service';
import { Category } from '../../categories/data/category.interfaces';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { CreatePostPayload, Post, PostStatus } from '../data/post.interfaces';
import { PostsService } from '../services/posts.service';

@Component({
  selector: 'app-posts-admin',
  standalone: true,
  imports: [FormsModule],
  template: `
    <main class="posts-page">
      <header class="posts-header">
        <div>
          <h1>Posts</h1>
          <p>Gestiona publicaciones y prepara lotes de carga masiva.</p>
        </div>
        <button class="btn btn-primary" type="button" (click)="openCreateModal()">Nuevo post</button>
      </header>

      <section class="bulk-panel">
        <div>
          <h2>Carga masiva</h2>
          <p>Pega un arreglo JSON de posts. Cada item debe incluir titulo, slug, resumen, contenido y categoria.</p>
        </div>

        <label class="form-label">ID del lote</label>
        <input class="form-control" [(ngModel)]="bulkImportId" name="bulkImportId" placeholder="lote-mayo-2026">

        <label class="form-label mt-3">JSON de posts</label>
        <textarea class="form-control code-box" rows="12" [(ngModel)]="bulkJson" name="bulkJson"></textarea>

        <button class="btn btn-outline-primary mt-3" type="button" [disabled]="isImporting()" (click)="importBulk()">
          {{ isImporting() ? 'Importando...' : 'Importar posts' }}
        </button>
      </section>

      <section class="posts-list">
        <div class="list-heading">
          <h2>Publicaciones</h2>
          <span>{{ posts().length }} posts</span>
        </div>

        <div class="mural-preview">
          @for (post of postsByDate(); track post._id) {
            <article class="post-card">
              @if (post.coverImageUrl) {
                <img [src]="post.coverImageUrl" [alt]="post.title">
              }
              <div class="post-card-body">
                <div class="post-meta">
                  <span>{{ post.categorySlug }}</span>
                  <span [class.published]="post.status === 'published'">{{ statusLabel(post.status) }}</span>
                </div>
                <h3>{{ post.title }}</h3>
                <p>{{ post.excerpt }}</p>
                <div class="tags">
                  @for (tag of post.tags; track tag) {
                    <span>{{ tag }}</span>
                  }
                </div>
              </div>
            </article>
          } @empty {
            <div class="empty-state">Todavia no hay posts.</div>
          }
        </div>
      </section>
    </main>

    @if (isCreateModalOpen()) {
      <div class="modal-backdrop-custom" (click)="closeCreateModal()"></div>
      <section class="modal-shell" role="dialog" aria-modal="true" aria-labelledby="createPostTitle">
        <form #postForm="ngForm" class="post-form" (ngSubmit)="createPost(postForm)">
          <div class="modal-heading">
            <h2 id="createPostTitle">Nuevo post</h2>
            <button class="btn-close" type="button" aria-label="Cerrar" (click)="closeCreateModal()"></button>
          </div>

          <label class="form-label">Titulo</label>
          <input class="form-control" name="title" required [(ngModel)]="draft.title" (ngModelChange)="syncSlug()">

          <label class="form-label mt-3">Slug</label>
          <input class="form-control" name="slug" required [(ngModel)]="draft.slug">

          <label class="form-label mt-3">Resumen</label>
          <textarea class="form-control" name="excerpt" rows="2" required [(ngModel)]="draft.excerpt"></textarea>

          <label class="form-label mt-3">Contenido</label>
          <textarea class="form-control" name="content" rows="7" required [(ngModel)]="draft.content"></textarea>

          <div class="row mt-3">
            <div class="col-md-6">
              <label class="form-label">Categoria</label>
              <select class="form-select" name="categorySlug" required [(ngModel)]="draft.categorySlug">
                <option value="">Selecciona</option>
                @for (category of categories(); track category._id) {
                  <option [value]="category.slug">{{ category.name }}</option>
                }
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Estado</label>
              <select class="form-select" name="status" [(ngModel)]="draft.status">
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
                <option value="archived">Archivado</option>
              </select>
            </div>
          </div>

          <label class="form-label mt-3">Tags separados por coma</label>
          <input class="form-control" name="tags" [(ngModel)]="tagsInput">

          <label class="form-label mt-3">URL de portada</label>
          <input class="form-control" name="coverImageUrl" [(ngModel)]="draft.coverImageUrl">

          <div class="form-check form-switch mt-3">
            <input class="form-check-input" type="checkbox" id="commentsEnabled" name="commentsEnabled" [(ngModel)]="draft.commentsEnabled">
            <label class="form-check-label" for="commentsEnabled">Permitir comentarios</label>
          </div>

          <div class="modal-actions">
            <button class="btn btn-outline-secondary" type="button" (click)="closeCreateModal()">Cancelar</button>
            <button class="btn btn-primary" type="submit" [disabled]="isSaving() || postForm.invalid">
              {{ isSaving() ? 'Guardando...' : 'Crear post' }}
            </button>
          </div>
        </form>
      </section>
    }
  `,
  styles: [`
    .posts-page {
      width: min(1180px, calc(100% - 32px));
      margin: 0 auto;
      padding: 32px 0 56px;
    }

    .posts-header,
    .list-heading {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: center;
    }

    .posts-header {
      margin-bottom: 22px;
    }

    .posts-header h1 {
      margin: 0;
      font-size: 2.25rem;
    }

    .posts-header p,
    .bulk-panel p,
    .list-heading span,
    .post-card p {
      margin: 8px 0 0;
      color: #64748b;
    }

    .bulk-panel,
    .posts-list,
    .post-form {
      padding: 22px;
      border: 1px solid #d7dde7;
      border-radius: 8px;
      background: #fff;
    }

    .bulk-panel {
      margin-bottom: 18px;
    }

    h2 {
      margin: 0;
      font-size: 1.2rem;
    }

    .code-box {
      font-family: Consolas, monospace;
      font-size: 0.9rem;
    }

    .mural-preview {
      columns: 3 260px;
      column-gap: 16px;
      margin-top: 16px;
    }

    .post-card {
      display: inline-block;
      width: 100%;
      margin: 0 0 16px;
      overflow: hidden;
      border: 1px solid #d7dde7;
      border-radius: 8px;
      background: #fff;
      break-inside: avoid;
      box-shadow: 0 8px 22px rgba(15, 23, 42, 0.06);
    }

    .post-card img {
      width: 100%;
      min-height: 170px;
      max-height: 260px;
      object-fit: cover;
      background: #e5e7eb;
    }

    .post-card-body {
      padding: 16px;
    }

    .post-meta,
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
    }

    .post-meta {
      justify-content: space-between;
      color: #64748b;
      font-size: 0.78rem;
      font-weight: 800;
      text-transform: uppercase;
    }

    .post-meta .published {
      color: #15803d;
    }

    .post-card h3 {
      margin: 10px 0 8px;
      font-size: 1.15rem;
    }

    .tags {
      margin-top: 12px;
    }

    .tags span {
      padding: 4px 9px;
      border-radius: 999px;
      background: #e0f2fe;
      color: #075985;
      font-size: 0.78rem;
      font-weight: 700;
    }

    .empty-state {
      padding: 24px 0 4px;
      color: #64748b;
    }

    .modal-backdrop-custom {
      position: fixed;
      inset: 0;
      z-index: 1040;
      background: rgba(15, 23, 42, 0.55);
    }

    .modal-shell {
      position: fixed;
      inset: 32px 16px;
      z-index: 1050;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      overflow-y: auto;
    }

    .post-form {
      width: min(760px, 100%);
      box-shadow: 0 24px 70px rgba(15, 23, 42, 0.25);
    }

    .modal-heading,
    .modal-actions {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: center;
    }

    .modal-heading {
      margin-bottom: 18px;
    }

    .modal-actions {
      margin-top: 22px;
      justify-content: flex-end;
    }
  `],
})
export class PostsAdminComponent implements OnInit {
  private postsService = inject(PostsService);
  private categoriesService = inject(CategoriesService);
  private toast = inject(ToastService);

  posts = signal<Post[]>([]);
  categories = signal<Category[]>([]);
  isSaving = signal(false);
  isImporting = signal(false);
  isCreateModalOpen = signal(false);

  postsByDate = computed(() =>
    [...this.posts()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  );

  tagsInput = '';
  bulkImportId = '';
  bulkJson = `[
  {
    "title": "Ejemplo de post",
    "slug": "ejemplo-de-post",
    "excerpt": "Resumen corto para mostrar en listados.",
    "content": "Contenido completo del post.",
    "categorySlug": "terror",
    "tags": ["cuento", "suspenso"],
    "status": "published",
    "commentsEnabled": true
  }
]`;

  draft: CreatePostPayload = this.emptyDraft();

  ngOnInit() {
    this.loadPosts();
    this.loadCategories();
  }

  loadPosts() {
    this.postsService.getPosts().subscribe({
      next: (response) => this.posts.set(response.data),
      error: () => this.toast.error('No se pudieron cargar los posts.'),
    });
  }

  loadCategories() {
    this.categoriesService.getCategories().subscribe({
      next: (response) => this.categories.set(response.data),
      error: () => this.toast.error('No se pudieron cargar las categorias.'),
    });
  }

  openCreateModal() {
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal() {
    if (this.isSaving()) {
      return;
    }

    this.isCreateModalOpen.set(false);
  }

  syncSlug() {
    if (this.draft.slug) {
      return;
    }

    this.draft.slug = this.slugify(this.draft.title);
  }

  createPost(form: NgForm) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.postsService.createPost({
      ...this.draft,
      tags: this.parseTags(this.tagsInput),
      coverImageUrl: this.draft.coverImageUrl || undefined,
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.toast.success('Post creado correctamente.');
        this.draft = this.emptyDraft();
        this.tagsInput = '';
        form.resetForm(this.draft);
        this.isCreateModalOpen.set(false);
        this.loadPosts();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.toast.error(err.error?.message || 'No se pudo crear el post.');
      },
    });
  }

  importBulk() {
    let posts: CreatePostPayload[];

    try {
      posts = JSON.parse(this.bulkJson);
    } catch {
      this.toast.error('El JSON no es valido.');
      return;
    }

    if (!Array.isArray(posts) || posts.length === 0) {
      this.toast.warning('El JSON debe ser un arreglo con al menos un post.');
      return;
    }

    this.isImporting.set(true);
    this.postsService.createBulk({
      importId: this.bulkImportId || undefined,
      posts,
    }).subscribe({
      next: (response) => {
        this.isImporting.set(false);
        this.toast.success(`${response.data.count} posts importados correctamente.`);
        this.loadPosts();
      },
      error: (err) => {
        this.isImporting.set(false);
        this.toast.error(err.error?.message || 'No se pudo importar el lote.');
      },
    });
  }

  statusLabel(status: PostStatus): string {
    const labels: Record<PostStatus, string> = {
      draft: 'Borrador',
      published: 'Publicado',
      archived: 'Archivado',
    };

    return labels[status];
  }

  private emptyDraft(): CreatePostPayload {
    return {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      categorySlug: '',
      status: 'draft' as PostStatus,
      commentsEnabled: true,
      coverImageUrl: '',
      tags: [],
    };
  }

  private parseTags(value: string): string[] {
    return value
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
