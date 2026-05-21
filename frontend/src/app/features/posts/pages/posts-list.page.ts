import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
  imports: [ReactiveFormsModule, SearchBarComponent, PostCardComponent, PostFormComponent],
  template: `
    <main class="posts-page">
      <header class="posts-header app-page-header">
        <div><h1>Posts</h1><p>Gestiona publicaciones y prepara lotes de carga masiva.</p></div>
        <button class="btn btn-primary" type="button" (click)="isCreateModalOpen.set(true)">Nuevo post</button>
      </header>

      <section class="toolbar app-section-stack">
        <app-search-bar [value]="search()" (valueChange)="search.set($event)" />
      </section>

      <form class="bulk-panel app-surface-card app-section-stack" [formGroup]="bulkForm" (ngSubmit)="importBulk()">
        <div><h2>Carga masiva</h2><p>Pega un arreglo JSON de posts.</p></div>
        <label class="form-label">ID del lote</label>
        <input class="form-control" formControlName="importId" placeholder="lote-mayo-2026">
        <label class="form-label mt-3">JSON de posts</label>
        <textarea class="form-control code-box" rows="10" formControlName="postsJson"></textarea>
        @if (bulkForm.controls.postsJson.invalid && bulkForm.controls.postsJson.touched) { <small class="app-error-copy">Debes ingresar un JSON con al menos un post.</small> }
        <button class="btn btn-outline-primary mt-3" type="submit" [disabled]="isImporting() || bulkForm.invalid">{{ isImporting() ? 'Importando...' : 'Importar posts' }}</button>
      </form>

      @if (isLoading()) {
        <div class="state-card app-state-card">Cargando posts...</div>
      } @else if (!filteredPosts().length) {
        <div class="state-card app-state-card">No hay posts que coincidan con la busqueda.</div>
      } @else {
        <section class="post-grid app-grid-posts">
          @for (post of filteredPosts(); track post._id) {
            <app-post-card [post]="post" [showDelete]="true" [isDeleting]="deletingPostIds().includes(post._id)" (openComments)="openComments($event)" (deletePost)="deletePost($event)" />
          }
        </section>
        @if (totalPages() > 1) {
          <div class="pager">
            <button class="btn btn-outline-secondary" type="button" [disabled]="page() === 1" (click)="changePage(page() - 1)">Anterior</button>
            <span>Pagina {{ page() }} de {{ totalPages() }}</span>
            <button class="btn btn-outline-secondary" type="button" [disabled]="page() === totalPages()" (click)="changePage(page() + 1)">Siguiente</button>
          </div>
        }
      }

      @if (isCreateModalOpen()) {
        <div class="app-modal-backdrop" (click)="closeCreateModal()"></div>
        <section class="app-modal-shell">
          <app-post-form [categories]="categories()" [isSubmitting]="isSaving()" submitLabel="Crear post" (save)="createPost($event)" (cancel)="closeCreateModal()" />
        </section>
      }
    </main>
  `,
  styles: [`.posts-page{width:var(--app-page-width);margin:0 auto;padding:32px 0 56px}.posts-header h1{margin:0;font-size:2.25rem}.posts-header p,.bulk-panel p{margin:8px 0 0;color:#64748b}.code-box{font-family:Consolas,monospace;min-height:220px}.pager{display:flex;justify-content:center;align-items:center;gap:12px;margin-top:22px}@media (max-width:720px){.posts-page{padding:20px 0 40px}.posts-header h1{font-size:1.9rem}.code-box{min-height:180px}}`],
})
export class PostsListPage implements OnInit {
  private fb = inject(FormBuilder); private postsService = inject(PostsService); private categoriesService = inject(CategoriesService); private toast = inject(ToastService); private router = inject(Router);
  posts = signal<Post[]>([]); categories = signal<Category[]>([]); search = signal(''); isLoading = signal(false); isSaving = signal(false); isImporting = signal(false); isCreateModalOpen = signal(false); deletingPostIds = signal<string[]>([]); page = signal(1); totalPages = signal(1); limit = 12;
  bulkForm = this.fb.nonNullable.group({ importId: [''], postsJson: [`[
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
]`, [Validators.required, Validators.minLength(10)]] });
  filteredPosts = computed(() => { const term = this.search().trim().toLowerCase(); const posts = this.posts(); return !term ? posts : posts.filter((post) => `${post.title} ${post.excerpt} ${post.tags.join(' ')}`.toLowerCase().includes(term)); });
  ngOnInit() { this.loadPosts(); this.loadCategories(); }
  loadPosts() { this.isLoading.set(true); this.postsService.getPosts(this.page(), this.limit).pipe(finalize(() => this.isLoading.set(false))).subscribe({ next: (response) => { this.posts.set(response.data.items); this.totalPages.set(response.data.totalPages); } }); }
  loadCategories() { this.categoriesService.getCategories(1, 50).subscribe({ next: (response) => this.categories.set(response.data.items) }); }
  changePage(nextPage: number) { this.page.set(nextPage); this.loadPosts(); }
  createPost(payload: CreatePostPayload) { this.isSaving.set(true); this.postsService.createPost(payload).pipe(finalize(() => this.isSaving.set(false))).subscribe({ next: () => { this.isCreateModalOpen.set(false); this.toast.success('Post creado correctamente.'); this.loadPosts(); } }); }
  importBulk() { if (this.bulkForm.invalid) { this.bulkForm.markAllAsTouched(); return; } let posts: CreatePostPayload[]; const raw = this.bulkForm.getRawValue(); try { posts = JSON.parse(raw.postsJson); } catch { this.toast.error('El JSON no es valido.'); return; } if (!Array.isArray(posts) || posts.length === 0) { this.toast.error('El JSON debe contener un arreglo con al menos un post.'); return; } this.isImporting.set(true); this.postsService.createBulk({ importId: raw.importId.trim() || undefined, posts }).pipe(finalize(() => this.isImporting.set(false))).subscribe({ next: (response) => { this.toast.success(`${response.data.count} posts importados correctamente.`); this.loadPosts(); } }); }
  deletePost(post: Post) { const confirmed = window.confirm(`Vas a eliminar "${post.title}". Esta accion no se puede deshacer.`); if (!confirmed || this.deletingPostIds().includes(post._id)) return; this.deletingPostIds.update((current) => [...current, post._id]); this.postsService.deletePost(post._id).subscribe({ next: () => { this.toast.success('Post eliminado.'); this.loadPosts(); }, error: () => this.deletingPostIds.update((current) => current.filter((id) => id !== post._id)), complete: () => this.deletingPostIds.update((current) => current.filter((id) => id !== post._id)) }); }
  openComments(post: Post) { void this.router.navigate(['/categories', post.categorySlug], { queryParams: { postId: post._id } }); }
  closeCreateModal() { if (!this.isSaving()) this.isCreateModalOpen.set(false); }
}
