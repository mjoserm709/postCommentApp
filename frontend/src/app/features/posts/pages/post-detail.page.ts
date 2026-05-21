import { Component, OnInit, computed, inject, signal } from '@angular/core';
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

      <section class="toolbar">
        <app-search-bar [value]="search()" (valueChange)="search.set($event)" />
      </section>

      @if (isLoading()) {
        <div class="state-card">Cargando posts...</div>
      } @else if (!filteredPosts().length) {
        <section class="state-card">
          <h2>Todavia no hay posts publicados</h2>
          <p>Cuando el admin publique contenido en esta categoria, aparecera aqui.</p>
        </section>
      } @else {
        <section class="post-grid">
          @for (post of filteredPosts(); track post._id) {
            <app-post-card [post]="post" (openComments)="openComments($event)" />
          }
        </section>
      }
    </main>

    @if (selectedPost(); as post) {
      <div class="modal-backdrop-custom" (click)="closeComments()"></div>
      <section class="comments-modal" role="dialog" aria-modal="true" aria-labelledby="commentsTitle">
        <header class="comments-header">
          <div>
            <span>{{ post.status === publishedStatus ? 'Publicado' : 'Borrador' }}</span>
            <h2 id="commentsTitle">{{ post.title }}</h2>
          </div>
          <button class="btn-close" type="button" aria-label="Cerrar" (click)="closeComments()"></button>
        </header>

        <app-comments-list
          [comments]="postComments(post._id)"
          [currentUserId]="currentUserId()"
          [deleteComment]="deleteComment"
        />

        @if (post.commentsEnabled && authService.isAuthenticated()) {
          <app-comment-form [isSubmitting]="isSubmittingComment()" (submitComment)="submitComment(post._id, $event)" />
        } @else if (post.commentsEnabled) {
          <div class="login-note">Inicia sesion para comentar.</div>
        }
      </section>
    }

    @if (isCreatePostModalOpen()) {
      <div class="modal-backdrop-custom" (click)="closeCreatePostModal()"></div>
      <section class="modal-shell">
        <app-post-form
          [categories]="categories()"
          [initialCategorySlug]="slug"
          [isSubmitting]="isSavingPost()"
          submitLabel="Crear post"
          (save)="createPost($event)"
          (cancel)="closeCreatePostModal()"
        />
      </section>
    }
  `,
  styles: [`
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
    .state-card p {
      color: #475569;
      font-size: 1.05rem;
    }

    .toolbar,
    .state-card {
      margin-bottom: 18px;
    }

    .state-card {
      padding: 24px;
      border: 1px solid #d7dde7;
      border-radius: 12px;
      background: #fff;
    }

    .post-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 18px;
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
      border-radius: 12px;
      background: #fff;
      box-shadow: 0 24px 70px rgba(15, 23, 42, 0.28);
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

    .comments-header {
      display: flex;
      justify-content: space-between;
      gap: 18px;
      align-items: flex-start;
      padding: 20px 22px;
      border-bottom: 1px solid #e5e7eb;
    }

    .comments-header span,
    .login-note {
      color: #64748b;
      font-size: 0.84rem;
      font-weight: 700;
    }

    .comments-header h2 {
      margin: 5px 0 0;
      font-size: 1.45rem;
    }

    .login-note {
      padding: 16px;
      text-align: center;
    }

    @media (max-width: 720px) {
      .category-header {
        flex-direction: column;
      }

      .post-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class PostDetailPage implements OnInit {
  authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private postsService = inject(PostsService);
  private commentsService = inject(CommentsService);
  private categoriesService = inject(CategoriesService);
  private toast = inject(ToastService);

  readonly publishedStatus = 'published' as PostStatus;
  readonly slug = this.route.snapshot.paramMap.get('slug') ?? '';

  categories = signal<Category[]>([]);
  posts = signal<Post[]>([]);
  comments = signal<Record<string, PostComment[]>>({});
  selectedPost = signal<Post | null>(null);
  search = signal('');
  isLoading = signal(false);
  isCreatePostModalOpen = signal(false);
  isSavingPost = signal(false);
  isSubmittingComment = signal(false);
  currentUserId = computed(() => {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?._id || currentUser?.sub || currentUser?.userId || null;
  });

  filteredPosts = computed(() => {
    const term = this.search().trim().toLowerCase();
    const ordered = [...this.posts()].sort(
      (a, b) =>
        new Date(b.publishedAt || b.createdAt).getTime() -
        new Date(a.publishedAt || a.createdAt).getTime(),
    );

    if (!term) {
      return ordered;
    }

    return ordered.filter((post) =>
      `${post.title} ${post.excerpt} ${post.tags.join(' ')}`.toLowerCase().includes(term),
    );
  });

  readonly deleteComment = (id: string) => {
    this.commentsService.deleteComment(id).subscribe({
      next: () => {
        const postId = this.selectedPost()?._id;
        if (!postId) {
          return;
        }

        this.comments.update((current) => ({
          ...current,
          [postId]: (current[postId] ?? []).filter((comment) => comment._id !== id),
        }));
        this.toast.success('Comentario eliminado.');
      },
    });
  };

  categoryName = this.slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  ngOnInit() {
    this.loadCategories();
    this.loadPosts();
  }

  loadCategories() {
    this.categoriesService.getCategories().subscribe({
      next: (response) => this.categories.set(response.data),
    });
  }

  loadPosts() {
    this.route.paramMap.pipe(
      tap(() => this.isLoading.set(true)),
      switchMap((params) => {
        const slug = params.get('slug') ?? this.slug;
        return this.postsService.getPublishedByCategory(slug).pipe(
          delay(150),
          tap((response) => {
            this.posts.set(response.data);
          }),
          switchMap((response) => {
            const postId = this.route.snapshot.queryParamMap.get('postId');
            if (!postId) {
              return of(response);
            }

            const post = response.data.find((item) => item._id === postId);
            if (post) {
              this.openComments(post);
            }

            return of(response);
          }),
          finalize(() => this.isLoading.set(false)),
        );
      }),
    ).subscribe();
  }

  openComments(post: Post) {
    this.selectedPost.set(post);
    this.commentsService.getComments(post._id).subscribe({
      next: (response) => {
        this.comments.update((current) => ({ ...current, [post._id]: response.data }));
      },
    });
  }

  closeComments() {
    this.selectedPost.set(null);
  }

  openCreatePostModal() {
    this.isCreatePostModalOpen.set(true);
  }

  closeCreatePostModal() {
    if (!this.isSavingPost()) {
      this.isCreatePostModalOpen.set(false);
    }
  }

  createPost(payload: CreatePostPayload) {
    this.isSavingPost.set(true);
    this.postsService.createPost({
      ...payload,
      categorySlug: this.slug,
      status: payload.status ?? ('published' as PostStatus),
    }).pipe(finalize(() => this.isSavingPost.set(false))).subscribe({
      next: () => {
        this.isCreatePostModalOpen.set(false);
        this.toast.success('Post creado correctamente.');
        this.postsService.getPublishedByCategory(this.slug).subscribe({
          next: (response) => this.posts.set(response.data),
        });
      },
    });
  }

  submitComment(postId: string, content: string) {
    this.isSubmittingComment.set(true);
    this.commentsService.createComment(postId, content).pipe(finalize(() => this.isSubmittingComment.set(false))).subscribe({
      next: (response) => {
        this.comments.update((current) => ({
          ...current,
          [postId]: [response.data, ...(current[postId] ?? [])],
        }));
        this.toast.success('Comentario agregado.');
      },
    });
  }

  postComments(postId: string): PostComment[] {
    return this.comments()[postId] ?? [];
  }
}
