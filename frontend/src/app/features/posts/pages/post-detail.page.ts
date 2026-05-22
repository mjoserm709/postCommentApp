import { Component, OnInit, computed, inject, signal } from '@angular/core';
import Swal from 'sweetalert2';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { delay, finalize, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { CommentFormComponent } from '../../comments/components/comment-form.component';
import { CommentsListComponent } from '../../comments/components/comments-list.component';
import { PostComment } from '../../comments/data/comment.interfaces';
import { CommentsService } from '../../comments/services/comments.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { CategoriesService } from '../../categories/services/categories.service';
import { Category } from '../../categories/data/category.interfaces';
import { PostCardComponent } from '../components/post-card.component';
import { PostFormComponent } from '../components/post-form.component';
import { SearchBarComponent } from '../components/search-bar.component';
import { CreatePostPayload, Post, PostStatus } from '../data/post.interfaces';
import { PostsService } from '../services/posts.service';

@Component({
  selector: 'app-post-detail-page',
  standalone: true,
  imports: [RouterLink, SearchBarComponent, PostCardComponent, CommentsListComponent, CommentFormComponent, PostFormComponent],
  template: `
    <main class="category-page">
      <a routerLink="/" class="back-link">Volver a categorias</a>
      <header class="category-header app-page-header">
        <div><span class="app-eyebrow">Categoria</span><h1>{{ categoryName }}</h1><p>Lee publicaciones recientes y conversa con otros usuarios.</p></div>
        @if (authService.hasPermission('posts.create')) { <button class="btn btn-primary" type="button" (click)="openCreatePostModal()">Nuevo post</button> }
      </header>
      <section class="toolbar app-section-stack"><app-search-bar [value]="search()" (valueChange)="search.set($event)" /></section>
      @if (isLoading()) {
        <div class="state-card app-state-card">Cargando posts...</div>
      } @else if (!filteredPosts().length) {
        <section class="state-card app-state-card"><h2>Todavia no hay posts publicados</h2><p>Cuando el admin publique contenido en esta categoria, aparecera aqui.</p></section>
      } @else {
        <section class="post-grid app-grid-posts">@for (post of filteredPosts(); track post._id) { <app-post-card [post]="post" (openComments)="openComments($event)" /> }</section>
        @if (totalPages() > 1) { <div class="pager"><button class="btn btn-outline-secondary" type="button" [disabled]="page() === 1" (click)="changePage(page() - 1)">Anterior</button><span>Pagina {{ page() }} de {{ totalPages() }}</span><button class="btn btn-outline-secondary" type="button" [disabled]="page() === totalPages()" (click)="changePage(page() + 1)">Siguiente</button></div> }
      }
    </main>

    @if (selectedPost(); as post) {
      <div class="app-modal-backdrop" (click)="closeComments()"></div>
      <section class="comments-modal" role="dialog" aria-modal="true" aria-labelledby="commentsTitle">
        <header class="comments-header"><div><span>{{ post.status === publishedStatus ? 'Publicado' : 'Borrador' }}</span><h2 id="commentsTitle">{{ post.title }}</h2></div><button class="btn-close" type="button" aria-label="Cerrar" (click)="closeComments()"></button></header>
        <app-comments-list [comments]="postComments()" [currentUserId]="currentUserId()" [deletingCommentIds]="deletingCommentIds()" [deleteComment]="deleteComment" />
        @if (commentsTotalPages() > 1) { <div class="pager comments-pager"><button class="btn btn-outline-secondary btn-sm" type="button" [disabled]="commentsPage() === 1" (click)="changeCommentsPage(commentsPage() - 1)">Anterior</button><span>Comentarios {{ commentsPage() }} de {{ commentsTotalPages() }}</span><button class="btn btn-outline-secondary btn-sm" type="button" [disabled]="commentsPage() === commentsTotalPages()" (click)="changeCommentsPage(commentsPage() + 1)">Siguiente</button></div> }
        @if (post.commentsEnabled && authService.isAuthenticated()) { <app-comment-form [isSubmitting]="isSubmittingComment()" (submitComment)="submitComment(post._id, $event)" /> } @else if (post.commentsEnabled) { <div class="login-note">Inicia sesion para comentar.</div> }
      </section>
    }

    @if (isCreatePostModalOpen()) {
      <div class="app-modal-backdrop" (click)="closeCreatePostModal()"></div>
      <section class="app-modal-shell"><app-post-form [categories]="categories()" [initialCategorySlug]="slug" [isSubmitting]="isSavingPost()" submitLabel="Crear post" (save)="createPost($event)" (cancel)="closeCreatePostModal()" /></section>
    }
  `,
  styles: [`.category-page{width:var(--app-page-width);margin:0 auto;padding:34px 0 64px}.back-link{display:inline-block;margin-bottom:22px;color:#0f766e;font-weight:800;text-decoration:none}h1{margin:6px 0 8px;font-size:2.7rem;line-height:1}.category-header p,.state-card p{color:#475569;font-size:1.05rem}.comments-modal{position:fixed;inset:32px 16px;z-index:1050;display:grid;grid-template-rows:auto minmax(0,1fr) auto auto;width:min(760px,100%);margin:0 auto;overflow:hidden;border-radius:12px;background:#fff;box-shadow:0 24px 70px rgba(15,23,42,.28)}.comments-header{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;padding:20px 22px;border-bottom:1px solid #e5e7eb}.comments-header span,.login-note{color:#64748b;font-size:.84rem;font-weight:700}.comments-header h2{margin:5px 0 0;font-size:1.45rem}.login-note{text-align:center;padding:16px}.pager{display:flex;justify-content:center;align-items:center;gap:12px;margin-top:22px}.comments-pager{padding:12px 16px;margin-top:0;border-top:1px solid #e5e7eb;background:#fff}@media (max-width:720px){.category-page{padding:20px 0 40px}h1{font-size:2rem}.comments-modal{inset:10px 8px;width:auto;border-radius:10px}.comments-header{padding:16px}.comments-header h2{font-size:1.2rem}}`],
})
export class PostDetailPage implements OnInit {
  authService = inject(AuthService); private route = inject(ActivatedRoute); private postsService = inject(PostsService); private commentsService = inject(CommentsService); private categoriesService = inject(CategoriesService); private toast = inject(ToastService);
  readonly publishedStatus = 'published' as PostStatus; readonly slug = this.route.snapshot.paramMap.get('slug') ?? '';
  categories = signal<Category[]>([]); posts = signal<Post[]>([]); comments = signal<PostComment[]>([]); selectedPost = signal<Post | null>(null); search = signal(''); isLoading = signal(false); isCreatePostModalOpen = signal(false); isSavingPost = signal(false); isSubmittingComment = signal(false); deletingCommentIds = signal<string[]>([]); page = signal(1); totalPages = signal(1); commentsPage = signal(1); commentsTotalPages = signal(1); postLimit = 9; commentLimit = 10;
  currentUserId = computed(() => { const currentUser = this.authService.getCurrentUser(); return currentUser?._id || currentUser?.sub || currentUser?.userId || null; });
  filteredPosts = computed(() => { const term = this.search().trim().toLowerCase(); const ordered = [...this.posts()].sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()); return !term ? ordered : ordered.filter((post) => `${post.title} ${post.excerpt} ${post.tags.join(' ')}`.toLowerCase().includes(term)); });
  readonly deleteComment = async (id: string) => { const result = await Swal.fire({ title: '¿Estas seguro?', text: 'Vas a eliminar este comentario. Esta accion no se puede deshacer.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Si, eliminar', cancelButtonText: 'Cancelar' }); if (!result.isConfirmed || this.deletingCommentIds().includes(id)) return; this.deletingCommentIds.update((current) => [...current, id]); this.commentsService.deleteComment(id).subscribe({ next: () => { this.comments.update((current) => current.filter((comment) => comment._id !== id)); this.toast.success('Comentario eliminado.'); }, error: () => this.deletingCommentIds.update((current) => current.filter((commentId) => commentId !== id)), complete: () => this.deletingCommentIds.update((current) => current.filter((commentId) => commentId !== id)) }); };
  categoryName = this.slug.split('-').filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  ngOnInit() { this.loadCategories(); this.loadPosts(); }
  loadCategories() { this.categoriesService.getCategories(1, 50).subscribe({ next: (response) => { const data = response.data; this.categories.set(Array.isArray(data) ? data : (data.items || [])); } }); }
  loadPosts() { this.route.paramMap.pipe(tap(() => this.isLoading.set(true)), switchMap((params) => { const slug = params.get('slug') ?? this.slug; return this.postsService.getPublishedByCategory(slug, this.page(), this.postLimit).pipe(delay(150), tap((response) => { const data = response.data; const items = Array.isArray(data) ? data : (data.items || []); this.posts.set(items); this.totalPages.set(Array.isArray(data) ? 1 : (data.totalPages || 1)); }), switchMap((response) => { const data = response.data; const items = Array.isArray(data) ? data : (data.items || []); const postId = this.route.snapshot.queryParamMap.get('postId'); if (!postId) return of(response); const post = items.find((item: Post) => item._id === postId); if (post) this.openComments(post); return of(response); }), finalize(() => this.isLoading.set(false))); })).subscribe(); }
  changePage(nextPage: number) { this.page.set(nextPage); this.loadPosts(); }
  private pollingInterval: any;

  openComments(post: Post) { 
    this.selectedPost.set(post); 
    this.commentsPage.set(1); 
    this.loadComments(post._id); 
    
    // Iniciar polling para comentarios en vivo cada 3 segundos
    this.pollingInterval = setInterval(() => {
      if (this.selectedPost()) {
        this.loadComments(this.selectedPost()!._id);
      }
    }, 3000);
  }

  loadComments(postId: string) { this.commentsService.getComments(postId, this.commentsPage(), this.commentLimit).subscribe({ next: (response) => { const data = response.data; this.comments.set(Array.isArray(data) ? data : (data.items || [])); this.commentsTotalPages.set(Array.isArray(data) ? 1 : (data.totalPages || 1)); } }); }
  changeCommentsPage(nextPage: number) { const postId = this.selectedPost()?._id; if (!postId) return; this.commentsPage.set(nextPage); this.loadComments(postId); }
  
  closeComments() { 
    this.selectedPost.set(null); 
    this.comments.set([]); 
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }
  openCreatePostModal() { this.isCreatePostModalOpen.set(true); }
  closeCreatePostModal() { if (!this.isSavingPost()) this.isCreatePostModalOpen.set(false); }
  createPost(payload: CreatePostPayload) { this.isSavingPost.set(true); this.postsService.createPost({ ...payload, categorySlug: this.slug, status: payload.status ?? ('published' as PostStatus) }).pipe(finalize(() => this.isSavingPost.set(false))).subscribe({ next: () => { this.isCreatePostModalOpen.set(false); this.toast.success('Post creado correctamente.'); this.loadPosts(); } }); }
  submitComment(postId: string, content: string) { this.isSubmittingComment.set(true); this.commentsService.createComment(postId, content).pipe(finalize(() => this.isSubmittingComment.set(false))).subscribe({ next: () => { this.commentsPage.set(1); this.loadComments(postId); this.toast.success('Comentario agregado.'); } }); }
  postComments(): PostComment[] { return this.comments(); }
}
