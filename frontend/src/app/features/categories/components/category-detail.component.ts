import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { HumanizeDatePipe } from '../../../shared/pipes/humanize-date.pipe';
import { AuthService } from '../../auth/services/auth.service';
import { PostComment } from '../../comments/data/comment.interfaces';
import { CommentsService } from '../../comments/services/comments.service';
import { CreatePostPayload, Post, PostStatus } from '../../posts/data/post.interfaces';
import { PostsService } from '../../posts/services/posts.service';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [FormsModule, RouterLink, HumanizeDatePipe],
  template: `
    <main class="category-page">
      <a routerLink="/" class="back-link">Volver a categorias</a>

      <header class="category-header">
        <div>
          <span class="eyebrow">Categoria</span>
          <h1>{{ categoryName }}</h1>
          <p>Lee publicaciones recientes y conversa con otros usuarios.</p>
        </div>
        @if (authService.hasPermission('posts.create')) {
          <button class="btn btn-primary" type="button" (click)="openCreatePostModal()">Nuevo post</button>
        }
      </header>

      @if (isLoading()) {
        <div class="d-flex justify-content-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
      } @else if (posts().length) {
        <section class="post-grid" aria-label="Posts publicados">
          @for (post of postsByDate(); track post._id) {
            <article class="post-tile">
              <div class="tile-media" [class.no-cover]="!post.coverImageUrl">
                @if (post.coverImageUrl) {
                  <img [src]="post.coverImageUrl" [alt]="post.title">
                } @else {
                  <span>{{ post.title.charAt(0) }}</span>
                }
              </div>

              <div class="tile-content">
                <div class="tile-meta">
                  <span>{{ post.publishedAt || post.createdAt | humanizeDate }}</span>
                  <span>{{ post.commentsEnabled ? 'Comentarios abiertos' : 'Comentarios cerrados' }}</span>
                </div>

                <h2>{{ post.title }}</h2>
                <p>{{ post.excerpt }}</p>

                <div class="tags">
                  @for (tag of post.tags; track tag) {
                    <span>{{ tag }}</span>
                  }
                </div>

                <button class="comment-action" type="button" (click)="openComments(post)">
                  Ver comentarios
                  @if (comments()[post._id]) {
                    <span>{{ comments()[post._id].length }}</span>
                  }
                </button>
              </div>
            </article>
          }
        </section>
      } @else {
        <section class="empty-state">
          <h2>Todavia no hay posts publicados</h2>
          <p>Cuando el admin publique contenido en esta categoria, aparecera aqui.</p>
        </section>
      }
    </main>

    @if (selectedPost(); as post) {
      <div class="modal-backdrop-custom" (click)="closeComments()"></div>
      <section class="comments-modal" role="dialog" aria-modal="true" aria-labelledby="commentsTitle">
        <header class="comments-header">
          <div>
            <span>{{ post.publishedAt || post.createdAt | humanizeDate }}</span>
            <h2 id="commentsTitle">{{ post.title }}</h2>
          </div>
          <button class="btn-close" type="button" aria-label="Cerrar" (click)="closeComments()"></button>
        </header>

        <div class="comments-thread">
          @for (comment of postComments(post._id); track comment._id) {
            <article class="message" [class.mine]="isMine(comment)">
              @if (!isMine(comment)) {
                <span class="avatar">{{ initials(comment) }}</span>
              }
              <div class="bubble">
                <div class="bubble-meta">
                  <strong>{{ authorName(comment) }}</strong>
                  <span>{{ comment.createdAt | humanizeDate }}</span>
                </div>
                <p>{{ comment.content }}</p>
              </div>
              @if (isMine(comment)) {
                <span class="avatar mine-avatar">{{ initials(comment) }}</span>
              }
            </article>
          } @empty {
            <div class="empty-comments">Aun no hay comentarios.</div>
          }
        </div>

        @if (post.commentsEnabled && authService.isAuthenticated()) {
          <form class="comment-compose" (ngSubmit)="submitComment(post._id)">
            <input
              class="form-control"
              name="comment"
              placeholder="Escribe un comentario..."
              [(ngModel)]="commentDrafts[post._id]"
            >
            <button class="btn btn-primary" type="submit">Enviar</button>
          </form>
        } @else if (post.commentsEnabled) {
          <div class="login-note">Inicia sesion para comentar.</div>
        }
      </section>
    }

    @if (isCreatePostModalOpen()) {
      <div class="modal-backdrop-custom" (click)="closeCreatePostModal()"></div>
      <section class="post-modal" role="dialog" aria-modal="true" aria-labelledby="newPostTitle">
        <form #postForm="ngForm" class="post-form" (ngSubmit)="createPost(postForm)">
          <header class="comments-header">
            <div>
              <span>Categoria: {{ categoryName }}</span>
              <h2 id="newPostTitle">Nuevo post</h2>
            </div>
            <button class="btn-close" type="button" aria-label="Cerrar" (click)="closeCreatePostModal()"></button>
          </header>

          <div class="post-form-body">
            <label class="form-label">Titulo</label>
            <input
              class="form-control"
              name="title"
              required
              [(ngModel)]="draftPost.title"
              (ngModelChange)="syncPostSlug()"
            >

            <label class="form-label mt-3">Slug</label>
            <input class="form-control" name="slug" required [(ngModel)]="draftPost.slug">

            <label class="form-label mt-3">Resumen</label>
            <textarea class="form-control" name="excerpt" rows="2" required [(ngModel)]="draftPost.excerpt"></textarea>

            <label class="form-label mt-3">Contenido</label>
            <textarea class="form-control" name="content" rows="7" required [(ngModel)]="draftPost.content"></textarea>

            <div class="row mt-3">
              <div class="col-md-6">
                <label class="form-label">Estado</label>
                <select class="form-select" name="status" [(ngModel)]="draftPost.status">
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Tags separados por coma</label>
                <input class="form-control" name="tags" [(ngModel)]="postTagsInput">
              </div>
            </div>

            <label class="form-label mt-3">URL de portada</label>
            <input class="form-control" name="coverImageUrl" [(ngModel)]="draftPost.coverImageUrl">

            <div class="form-check form-switch mt-3">
              <input
                class="form-check-input"
                type="checkbox"
                id="newPostCommentsEnabled"
                name="commentsEnabled"
                [(ngModel)]="draftPost.commentsEnabled"
              >
              <label class="form-check-label" for="newPostCommentsEnabled">Permitir comentarios</label>
            </div>
          </div>

          <footer class="post-form-actions">
            <button class="btn btn-outline-secondary" type="button" (click)="closeCreatePostModal()">Cancelar</button>
            <button class="btn btn-primary" type="submit" [disabled]="isSavingPost() || postForm.invalid">
              {{ isSavingPost() ? 'Guardando...' : 'Crear post' }}
            </button>
          </footer>
        </form>
      </section>
    }
  `,
  styles: [
    `
      .category-page {
        width: min(1180px, calc(100% - 32px));
        margin: 0 auto;
        padding: 34px 0 64px;
      }

      .back-link {
        display: inline-block;
        margin-bottom: 22px;
        color: #0f766e;
        font-weight: 800;
        text-decoration: none;
      }

      .category-header {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        align-items: flex-start;
        margin-bottom: 24px;
      }

      .eyebrow {
        color: #0f766e;
        font-size: 0.78rem;
        font-weight: 900;
        text-transform: uppercase;
      }

      h1 {
        margin: 6px 0 8px;
        font-size: 2.7rem;
        line-height: 1;
      }

      .category-header p,
      .tile-content p {
        color: #475569;
        font-size: 1.05rem;
      }

      .post-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 18px;
      }

      .post-tile {
        display: grid;
        grid-template-rows: 190px minmax(0, 1fr);
        overflow: hidden;
        border: 1px solid #d7dde7;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
      }

      .tile-media {
        overflow: hidden;
        background: #102a43;
      }

      .tile-media img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .tile-media.no-cover {
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, #0f766e, #334155);
        color: #fff;
        font-size: 4rem;
        font-weight: 900;
      }

      .tile-content {
        display: flex;
        min-height: 270px;
        flex-direction: column;
        padding: 20px;
      }

      .tile-meta {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        color: #64748b;
        font-size: 0.82rem;
        font-weight: 800;
      }

      .tile-content h2 {
        margin: 12px 0 10px;
        font-size: 1.65rem;
        line-height: 1.08;
      }

      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        margin: 6px 0 18px;
      }

      .tags span {
        padding: 4px 9px;
        border-radius: 999px;
        background: #e0f2fe;
        color: #075985;
        font-size: 0.78rem;
        font-weight: 800;
      }

      .comment-action {
        display: inline-flex;
        width: fit-content;
        align-items: center;
        gap: 8px;
        margin-top: auto;
        padding: 9px 12px;
        border: 1px solid #99f6e4;
        border-radius: 8px;
        background: #f0fdfa;
        color: #0f766e;
        font-weight: 900;
      }

      .comment-action span {
        min-width: 24px;
        padding: 1px 8px;
        border-radius: 999px;
        background: #ccfbf1;
      }

      .empty-state {
        padding: 38px;
        border: 1px solid #d7dde7;
        border-radius: 8px;
        background: #fff;
        text-align: center;
      }

      .modal-backdrop-custom {
        position: fixed;
        inset: 0;
        z-index: 1040;
        background: rgba(15, 23, 42, 0.56);
      }

      .comments-modal {
        position: fixed;
        top: 32px;
        right: 16px;
        bottom: 32px;
        left: 16px;
        z-index: 1050;
        display: grid;
        grid-template-rows: auto minmax(0, 1fr) auto;
        width: min(760px, calc(100% - 32px));
        margin: 0 auto;
        overflow: hidden;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 24px 70px rgba(15, 23, 42, 0.28);
      }

      .post-modal {
        position: fixed;
        top: 32px;
        right: 16px;
        bottom: 32px;
        left: 16px;
        z-index: 1050;
        display: flex;
        justify-content: center;
        overflow-y: auto;
      }

      .post-form {
        width: min(760px, 100%);
        height: fit-content;
        overflow: hidden;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 24px 70px rgba(15, 23, 42, 0.28);
      }

      .post-form-body {
        padding: 20px 22px;
      }

      .post-form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding: 16px 22px;
        border-top: 1px solid #e5e7eb;
        background: #fff;
      }

      .comments-header {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        align-items: flex-start;
        padding: 20px 22px;
        border-bottom: 1px solid #e5e7eb;
      }

      .comments-header span,
      .bubble-meta span {
        color: #64748b;
        font-size: 0.84rem;
        font-weight: 700;
      }

      .comments-header h2 {
        margin: 5px 0 0;
        font-size: 1.45rem;
      }

      .comments-thread {
        display: flex;
        flex-direction: column;
        gap: 14px;
        overflow-y: auto;
        padding: 20px 22px;
        background: #f8fafc;
      }

      .message {
        display: flex;
        max-width: 82%;
        gap: 10px;
        align-items: flex-end;
      }

      .message.mine {
        align-self: flex-end;
      }

      .avatar {
        display: inline-grid;
        width: 34px;
        height: 34px;
        flex: 0 0 34px;
        place-items: center;
        border-radius: 999px;
        background: #dbeafe;
        color: #1d4ed8;
        font-size: 0.78rem;
        font-weight: 900;
      }

      .mine-avatar {
        background: #ccfbf1;
        color: #0f766e;
      }

      .bubble {
        padding: 11px 13px;
        border-radius: 8px 8px 8px 2px;
        background: #fff;
        border: 1px solid #e5e7eb;
      }

      .message.mine .bubble {
        border-color: #99f6e4;
        border-radius: 8px 8px 2px 8px;
        background: #ecfdf5;
      }

      .bubble-meta {
        display: flex;
        justify-content: space-between;
        gap: 16px;
      }

      .bubble p {
        margin: 6px 0 0;
        color: #1f2937;
      }

      .comment-compose {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 10px;
        padding: 16px;
        border-top: 1px solid #e5e7eb;
        background: #fff;
      }

      .login-note,
      .empty-comments {
        padding: 16px;
        color: #64748b;
        text-align: center;
      }

      @media (max-width: 720px) {
        .category-header {
          flex-direction: column;
        }

        .post-grid {
          grid-template-columns: 1fr;
        }

        .comment-compose {
          grid-template-columns: 1fr;
        }

        .message {
          max-width: 95%;
        }
      }
    `,
  ],
})
export class CategoryDetailComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private postsService = inject(PostsService);
  private commentsService = inject(CommentsService);
  private toast = inject(ToastService);
  private slug = this.route.snapshot.paramMap.get('slug') ?? '';

  posts = signal<Post[]>([]);
  comments = signal<Record<string, PostComment[]>>({});
  selectedPost = signal<Post | null>(null);
  isLoading = signal(false);
  isCreatePostModalOpen = signal(false);
  isSavingPost = signal(false);
  commentDrafts: Record<string, string> = {};
  postTagsInput = '';
  draftPost: CreatePostPayload = this.emptyDraftPost();
  private commentsRefreshId?: ReturnType<typeof setInterval>;

  postsByDate = computed(() =>
    [...this.posts()].sort((a, b) =>
      new Date(b.publishedAt || b.createdAt).getTime() -
      new Date(a.publishedAt || a.createdAt).getTime(),
    ),
  );

  categoryName = this.slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  ngOnInit() {
    this.loadPosts();
  }

  ngOnDestroy() {
    this.stopCommentsRefresh();
  }

  loadPosts() {
    this.isLoading.set(true);

    this.postsService.getPublishedByCategory(this.slug).subscribe({
      next: (response) => {
        this.posts.set(response.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.error('No se pudieron cargar los posts de esta categoria.');
      },
    });
  }

  openComments(post: Post) {
    this.selectedPost.set(post);
    this.loadComments(post._id);
    this.startCommentsRefresh(post._id);
  }

  closeComments() {
    this.selectedPost.set(null);
    this.stopCommentsRefresh();
  }

  openCreatePostModal() {
    this.draftPost = this.emptyDraftPost();
    this.postTagsInput = '';
    this.isCreatePostModalOpen.set(true);
  }

  closeCreatePostModal() {
    if (!this.isSavingPost()) {
      this.isCreatePostModalOpen.set(false);
    }
  }

  syncPostSlug() {
    if (!this.draftPost.slug) {
      this.draftPost.slug = this.slugify(this.draftPost.title);
    }
  }

  createPost(form: NgForm) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.isSavingPost.set(true);
    this.postsService.createPost({
      ...this.draftPost,
      categorySlug: this.slug,
      tags: this.parseTags(this.postTagsInput),
      coverImageUrl: this.draftPost.coverImageUrl || undefined,
    }).subscribe({
      next: () => {
        this.isSavingPost.set(false);
        this.isCreatePostModalOpen.set(false);
        this.toast.success('Post creado correctamente.');
        this.loadPosts();
      },
      error: (err) => {
        this.isSavingPost.set(false);
        this.toast.error(err.error?.message || 'No se pudo crear el post.');
      },
    });
  }

  loadComments(postId: string, showError = true) {
    this.commentsService.getComments(postId).subscribe({
      next: (response) => {
        this.comments.update((current) => ({
          ...current,
          [postId]: this.mergeComments(current[postId] ?? [], response.data),
        }));
      },
      error: () => {
        if (showError) {
          this.toast.error('No se pudieron cargar los comentarios.');
        }
      },
    });
  }

  submitComment(postId: string) {
    const content = this.commentDrafts[postId]?.trim();
    if (!content) {
      return;
    }

    this.commentsService.createComment(postId, content).subscribe({
      next: (response) => {
        this.commentDrafts[postId] = '';
        this.comments.update((current) => ({
          ...current,
          [postId]: [response.data, ...(current[postId] ?? [])],
        }));
        this.toast.success('Comentario agregado.');
      },
      error: () => this.toast.error('No se pudo agregar el comentario.'),
    });
  }

  postComments(postId: string): PostComment[] {
    return this.comments()[postId] ?? [];
  }

  isMine(comment: PostComment): boolean {
    const currentUser = this.authService.getCurrentUser();
    const currentUserId = currentUser?._id || currentUser?.sub || currentUser?.userId;
    return Boolean(currentUserId && comment.authorId === currentUserId);
  }

  authorName(comment: PostComment): string {
    if (!comment.author) {
      return 'Usuario';
    }

    return `${comment.author.firstName} ${comment.author.lastName}`.trim() || comment.author.username;
  }

  initials(comment: PostComment): string {
    const name = this.authorName(comment);
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  private startCommentsRefresh(postId: string) {
    this.stopCommentsRefresh();
    this.commentsRefreshId = setInterval(() => {
      if (this.selectedPost()?._id === postId) {
        this.loadComments(postId, false);
      }
    }, 3000);
  }

  private stopCommentsRefresh() {
    if (this.commentsRefreshId) {
      clearInterval(this.commentsRefreshId);
      this.commentsRefreshId = undefined;
    }
  }

  private emptyDraftPost(): CreatePostPayload {
    return {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      categorySlug: this.slug,
      status: 'published' as PostStatus,
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

  private mergeComments(current: PostComment[], incoming: PostComment[]): PostComment[] {
    const commentsById = new Map<string, PostComment>();

    for (const comment of [...incoming, ...current]) {
      commentsById.set(comment._id, comment);
    }

    return [...commentsById.values()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
}
