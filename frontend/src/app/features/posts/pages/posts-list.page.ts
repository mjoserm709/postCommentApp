import { Component, OnInit, computed, inject, signal } from '@angular/core';
import Swal from 'sweetalert2';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { AppModalComponent } from '../../../shared/components/app-modal/app-modal.component';
import { AuthService } from '../../auth/services/auth.service';
import { CategoriesService } from '../../categories/services/categories.service';
import { Category } from '../../categories/data/category.interfaces';
import { PostCardComponent } from '../components/post-card.component';
import { PostFormComponent } from '../components/post-form.component';
import { SearchBarComponent } from '../components/search-bar.component';
import { Post, CreatePostPayload } from '../data/post.interfaces';
import { PostsService } from '../services/posts.service';
import * as XLSX from 'xlsx';

interface ExcelPostRow {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  categorySlug?: string;
  coverImageUrl?: string;
  tags?: string;
  status?: CreatePostPayload['status'];
  commentsEnabled?: boolean | string;
}

@Component({
  selector: 'app-posts-list-page',
  standalone: true,
  imports: [ReactiveFormsModule, SearchBarComponent, PostCardComponent, PostFormComponent, AppModalComponent],
  template: `
    <main class="posts-page">
      <header class="posts-header app-page-header">
        <div><h1>Posts</h1><p>Gestiona publicaciones y prepara lotes de carga masiva.</p></div>
        @if (authService.hasPermission('posts.create')) {
          <button class="btn btn-primary" type="button" (click)="isCreateModalOpen.set(true)">Nuevo post</button>
        }
      </header>

      <section class="toolbar app-section-stack">
        <app-search-bar [value]="search()" (valueChange)="search.set($event)" />
      </section>

      @if (authService.hasPermission('posts.create')) {
        <div class="bulk-panel app-surface-card app-section-stack">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
            <div><h2>Carga masiva</h2><p>Sube un archivo .xlsx, .csv o .json para crear multiples posts.</p></div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button class="btn btn-outline-secondary btn-sm" type="button" (click)="downloadTemplate()">Plantilla Excel</button>
              <button class="btn btn-outline-secondary btn-sm" type="button" (click)="downloadJsonExample()">Ejemplo JSON</button>
            </div>
          </div>
          <form [formGroup]="bulkForm" (ngSubmit)="importBulk()">
            <label class="form-label">ID del lote (Opcional)</label>
            <input class="form-control mb-3" formControlName="importId" placeholder="ej. lote-mayo-2026">
            <label class="form-label">Archivo (.xlsx, .csv, .json)</label>
            <input class="form-control" type="file" accept=".xlsx,.csv,.json,application/json,text/csv" (change)="onFileChange($event)" #fileInput>
            @if (excelPosts().length > 0) { <div class="mt-2 text-success"><small>Archivo listo: {{ excelPosts().length }} posts detectados.</small></div> }
            <button class="btn btn-primary mt-3" type="submit" [disabled]="isImporting() || excelPosts().length === 0">{{ isImporting() ? 'Importando...' : 'Importar posts' }}</button>
          </form>
        </div>
      }

      @if (isLoading()) {
        <div class="state-card app-state-card">Cargando posts...</div>
      } @else if (!filteredPosts().length) {
        <div class="state-card app-state-card">No hay posts que coincidan con la busqueda.</div>
      } @else {
        <section class="post-grid app-grid-posts">
          @for (post of filteredPosts(); track post._id) {
            <app-post-card [post]="post" [showDelete]="authService.hasPermission('posts.delete')" [isDeleting]="deletingPostIds().includes(post._id)" (openComments)="openComments($event)" (deletePost)="deletePost($event)" />
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
        <app-modal
          size="lg"
          eyebrow="Publicacion"
          title="Crear post"
          subtitle="Completa la informacion principal del post antes de publicarlo o dejarlo en borrador."
          (requestClose)="closeCreateModal()"
        >
          <app-post-form [categories]="categories()" [isSubmitting]="isSaving()" submitLabel="Crear post" (save)="createPost($event)" (cancel)="closeCreateModal()" />
        </app-modal>
      }
    </main>
  `,
  styles: [`.posts-page{width:var(--app-page-width);margin:0 auto;padding:32px 0 56px}.posts-header h1{margin:0;font-size:2.25rem}.posts-header p,.bulk-panel p{margin:8px 0 0;color:#64748b}.code-box{font-family:Consolas,monospace;min-height:220px}.pager{display:flex;justify-content:center;align-items:center;gap:12px;margin-top:22px}@media (max-width:720px){.posts-page{padding:20px 0 40px}.posts-header h1{font-size:1.9rem}.code-box{min-height:180px}}`],
})
export class PostsListPage implements OnInit {
  private fb = inject(FormBuilder); private postsService = inject(PostsService); private categoriesService = inject(CategoriesService); private toast = inject(ToastService); private router = inject(Router);
  authService = inject(AuthService);
  posts = signal<Post[]>([]); categories = signal<Category[]>([]); search = signal(''); isLoading = signal(false); isSaving = signal(false); isImporting = signal(false); isCreateModalOpen = signal(false); deletingPostIds = signal<string[]>([]); page = signal(1); totalPages = signal(1); limit = 12; excelPosts = signal<CreatePostPayload[]>([]);
  bulkForm = this.fb.nonNullable.group({ importId: [''] });
  filteredPosts = computed(() => { const term = this.search().trim().toLowerCase(); const posts = this.posts(); return !term ? posts : posts.filter((post) => `${post.title} ${post.excerpt} ${post.tags.join(' ')}`.toLowerCase().includes(term)); });
  ngOnInit() { this.loadPosts(); this.loadCategories(); }
  loadPosts() { this.isLoading.set(true); this.postsService.getPosts(this.page(), this.limit).pipe(finalize(() => this.isLoading.set(false))).subscribe({ next: (response) => { const data = response.data; this.posts.set(Array.isArray(data) ? data : (data.items || [])); this.totalPages.set(Array.isArray(data) ? 1 : (data.totalPages || 1)); } }); }
  loadCategories() { this.categoriesService.getCategories(1, 50).subscribe({ next: (response) => { const data = response.data; this.categories.set(Array.isArray(data) ? data : (data.items || [])); } }); }
  changePage(nextPage: number) { this.page.set(nextPage); this.loadPosts(); }
  createPost(payload: CreatePostPayload) { this.isSaving.set(true); this.postsService.createPost(payload).pipe(finalize(() => this.isSaving.set(false))).subscribe({ next: () => { this.isCreateModalOpen.set(false); this.toast.success('Post creado correctamente.'); this.loadPosts(); } }); }
  
  downloadTemplate() {
    const ws = XLSX.utils.json_to_sheet([{ title: 'Ejemplo de post', slug: 'ejemplo-de-post', excerpt: 'Resumen corto...', content: 'Contenido completo del post...', categorySlug: 'terror', coverImageUrl: 'https://ejemplo.com/imagen.jpg', tags: 'cuento, suspenso', status: 'published', commentsEnabled: true }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Posts');
    XLSX.writeFile(wb, 'plantilla-posts.xlsx');
  }

  downloadJsonExample() {
    const example = [
      {
        title: 'Ejemplo de post',
        slug: 'ejemplo-de-post',
        excerpt: 'Resumen corto del post para importacion masiva.',
        content: 'Contenido completo del post. Debe tener una longitud minima valida para pasar la validacion del backend.',
        categorySlug: 'terror',
        coverImageUrl: 'https://ejemplo.com/imagen.jpg',
        tags: ['cuento', 'suspenso'],
        status: 'published',
        commentsEnabled: true,
      },
      {
        title: 'Segundo ejemplo',
        slug: 'segundo-ejemplo',
        excerpt: 'Otro resumen corto para probar multiples registros.',
        content: 'Otro contenido de ejemplo suficientemente largo para ilustrar el formato del archivo JSON.',
        categorySlug: 'fantasia',
        tags: ['aventura', 'magia'],
        status: 'draft',
        commentsEnabled: false,
      },
    ];

    const blob = new Blob([JSON.stringify(example, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'posts-ejemplo.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  onFileChange(event: any) {
    const target = event.target as HTMLInputElement;
    if (target.files?.length !== 1) return;
    const file = target.files[0];
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'json') {
      this.readJsonFile(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const bstr = e.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rows = XLSX.utils.sheet_to_json<ExcelPostRow>(ws);
        const data = rows.map((row): CreatePostPayload => ({
          title: String(row.title ?? '').trim(),
          slug: String(row.slug ?? '').trim(),
          excerpt: String(row.excerpt ?? '').trim(),
          content: String(row.content ?? '').trim(),
          categorySlug: String(row.categorySlug ?? '').trim(),
          coverImageUrl: row.coverImageUrl ? String(row.coverImageUrl).trim() : undefined,
          tags: row.tags ? String(row.tags).split(',').map((tag) => tag.trim()).filter(Boolean) : [],
          status: row.status,
          commentsEnabled: row.commentsEnabled === undefined || row.commentsEnabled === 'true' || row.commentsEnabled === true,
        }));
        this.excelPosts.set(data);
        this.toast.success(`Archivo leido con ${data.length} filas.`);
      } catch (error) {
        this.toast.error('Error al leer el archivo Excel.');
        this.excelPosts.set([]);
      }
    };
    reader.readAsBinaryString(file);
  }

  private readJsonFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(String(reader.result));
        if (!Array.isArray(raw)) {
          throw new Error('JSON root must be an array');
        }

        const data = raw.map((row): CreatePostPayload => ({
          title: String(row?.title ?? '').trim(),
          slug: String(row?.slug ?? '').trim(),
          excerpt: String(row?.excerpt ?? '').trim(),
          content: String(row?.content ?? '').trim(),
          categorySlug: String(row?.categorySlug ?? '').trim(),
          coverImageUrl: row?.coverImageUrl ? String(row.coverImageUrl).trim() : undefined,
          tags: Array.isArray(row?.tags)
            ? row.tags.map((tag: unknown) => String(tag).trim()).filter(Boolean)
            : [],
          status: row?.status,
          commentsEnabled: row?.commentsEnabled ?? true,
        }));

        this.excelPosts.set(data);
        this.toast.success(`Archivo JSON leido con ${data.length} filas.`);
      } catch {
        this.toast.error('Error al leer el archivo JSON.');
        this.excelPosts.set([]);
      }
    };
    reader.readAsText(file, 'utf-8');
  }

  importBulk() { const posts = this.excelPosts(); if (posts.length === 0) { this.toast.error('Debes seleccionar un archivo valido primero.'); return; } this.isImporting.set(true); const importId = this.bulkForm.value.importId?.trim() || undefined; this.postsService.createBulk({ importId, posts }).pipe(finalize(() => this.isImporting.set(false))).subscribe({ next: (response) => { this.toast.success(`${response.data.count} posts importados correctamente.`); this.loadPosts(); this.excelPosts.set([]); this.bulkForm.reset(); } }); }
  async deletePost(post: Post) { const result = await Swal.fire({ title: '¿Estas seguro?', text: `Vas a eliminar "${post.title}". Esta accion no se puede deshacer.`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Si, eliminar', cancelButtonText: 'Cancelar' }); if (!result.isConfirmed || this.deletingPostIds().includes(post._id)) return; this.deletingPostIds.update((current) => [...current, post._id]); this.postsService.deletePost(post._id).subscribe({ next: () => { this.toast.success('Post eliminado.'); this.loadPosts(); }, error: () => this.deletingPostIds.update((current) => current.filter((id) => id !== post._id)), complete: () => this.deletingPostIds.update((current) => current.filter((id) => id !== post._id)) }); }
  openComments(post: Post) { void this.router.navigate(['/categories', post.categorySlug], { queryParams: { postId: post._id } }); }
  closeCreateModal() { if (!this.isSaving()) this.isCreateModalOpen.set(false); }
}
