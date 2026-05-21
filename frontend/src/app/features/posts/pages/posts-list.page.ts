import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { CategoriesService } from '../../categories/services/categories.service';
import { Category } from '../../categories/data/category.interfaces';
import { PostCardComponent } from '../components/post-card.component';
import { PostFormComponent } from '../components/post-form.component';
import { SearchBarComponent } from '../components/search-bar.component';
import { Post, CreatePostPayload } from '../data/post.interfaces';
import { PostsService } from '../services/posts.service';

@Component({
  selector: 'app-posts-list-page',
  standalone: true,
  imports: [FormsModule, SearchBarComponent, PostCardComponent, PostFormComponent],
  template: `
    <main class="posts-page">
      <header class="posts-header">
        <div>
          <h1>Posts</h1>
          <p>Gestiona publicaciones y prepara lotes de carga masiva.</p>
        </div>
        <button class="btn btn-primary" type="button" (click)="isCreateModalOpen.set(true)">Nuevo post</button>
      </header>

      <section class="toolbar">
        <app-search-bar [value]="search()" (valueChange)="search.set($event)" />
      </section>

      <section class="bulk-panel">
        <div>
          <h2>Carga masiva</h2>
          <p>Pega un arreglo JSON de posts. Cada item debe incluir titulo, slug, resumen, contenido y categoria.</p>
        </div>

        <label class="form-label">ID del lote</label>
        <input class="form-control" [(ngModel)]="bulkImportId" name="bulkImportId" placeholder="lote-mayo-2026">

        <label class="form-label mt-3">JSON de posts</label>
        <textarea class="form-control code-box" rows="10" [(ngModel)]="bulkJson" name="bulkJson"></textarea>

        <button class="btn btn-outline-primary mt-3" type="button" [disabled]="isImporting()" (click)="importBulk()">
          {{ isImporting() ? 'Importando...' : 'Importar posts' }}
        </button>
      </section>

      @if (isLoading()) {
        <div class="state-card">Cargando posts...</div>
      } @else if (!filteredPosts().length) {
        <div class="state-card">No hay posts que coincidan con la busqueda.</div>
      } @else {
        <section class="post-grid">
          @for (post of filteredPosts(); track post._id) {
            <app-post-card
              [post]="post"
              [showDelete]="true"
              (openComments)="openComments($event)"
              (deletePost)="deletePost($event)"
            />
          }
        </section>
      }

      @if (isCreateModalOpen()) {
        <div class="modal-backdrop-custom" (click)="closeCreateModal()"></div>
        <section class="modal-shell">
          <app-post-form
            [categories]="categories()"
            [isSubmitting]="isSaving()"
            submitLabel="Crear post"
            (save)="createPost($event)"
            (cancel)="closeCreateModal()"
          />
        </section>
      }
    </main>
  `,
  styles: [`
    .posts-page {
      width: min(1180px, calc(100% - 32px));
      margin: 0 auto;
      padding: 32px 0 56px;
    }

    .posts-header {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: center;
      margin-bottom: 22px;
    }

    .posts-header h1 {
      margin: 0;
      font-size: 2.25rem;
    }

    .posts-header p,
    .bulk-panel p {
      margin: 8px 0 0;
      color: #64748b;
    }

    .toolbar,
    .bulk-panel,
    .state-card {
      margin-bottom: 18px;
    }

    .bulk-panel,
    .state-card {
      padding: 22px;
      border: 1px solid #d7dde7;
      border-radius: 12px;
      background: #fff;
    }

    .code-box {
      font-family: Consolas, monospace;
    }

    .post-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(310px, 1fr));
      gap: 18px;
    }

    .modal-backdrop-custom {
      position: fixed;
      inset: 0;
      z-index: 1040;
      background: rgba(15, 23, 42, 0.56);
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
  `],
})
export class PostsListPage implements OnInit {
  private postsService = inject(PostsService);
  private categoriesService = inject(CategoriesService);
  private toast = inject(ToastService);
  private router = inject(Router);

  posts = signal<Post[]>([]);
  categories = signal<Category[]>([]);
  search = signal('');
  isLoading = signal(false);
  isSaving = signal(false);
  isImporting = signal(false);
  isCreateModalOpen = signal(false);

  bulkImportId = '';
  bulkJson = `[
  {
    "title": "Ejemplo de post",
    "slug": "ejemplo-de-post",
    "excerpt": "Resumen corto para mostrar en listados.",
    "content": "Contenido completo del post con suficiente longitud para validar correctamente.",
    "categorySlug": "terror",
    "tags": ["cuento", "suspenso"],
    "status": "published",
    "commentsEnabled": true
  }
]`;

  filteredPosts = computed(() => {
    const term = this.search().trim().toLowerCase();
    const posts = [...this.posts()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (!term) {
      return posts;
    }

    return posts.filter((post) =>
      `${post.title} ${post.excerpt} ${post.tags.join(' ')}`.toLowerCase().includes(term),
    );
  });

  ngOnInit() {
    this.loadPosts();
    this.loadCategories();
  }

  loadPosts() {
    this.isLoading.set(true);
    this.postsService.getPosts().pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: (response) => this.posts.set(response.data),
    });
  }

  loadCategories() {
    this.categoriesService.getCategories().subscribe({
      next: (response) => this.categories.set(response.data),
    });
  }

  createPost(payload: CreatePostPayload) {
    this.isSaving.set(true);
    this.postsService.createPost(payload).pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => {
        this.isCreateModalOpen.set(false);
        this.toast.success('Post creado correctamente.');
        this.loadPosts();
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

    this.isImporting.set(true);
    this.postsService.createBulk({
      importId: this.bulkImportId || undefined,
      posts,
    }).pipe(finalize(() => this.isImporting.set(false))).subscribe({
      next: (response) => {
        this.toast.success(`${response.data.count} posts importados correctamente.`);
        this.loadPosts();
      },
    });
  }

  deletePost(post: Post) {
    this.postsService.deletePost(post._id).subscribe({
      next: () => {
        this.toast.success('Post eliminado.');
        this.loadPosts();
      },
    });
  }

  openComments(post: Post) {
    void this.router.navigate(['/categories', post.categorySlug], {
      queryParams: { postId: post._id },
    });
  }

  closeCreateModal() {
    if (!this.isSaving()) {
      this.isCreateModalOpen.set(false);
    }
  }
}
