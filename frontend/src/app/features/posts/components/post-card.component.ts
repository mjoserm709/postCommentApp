import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Post } from '../data/post.interfaces';

@Component({
  selector: 'app-post-card',
  standalone: true,
  template: `
    <article class="post-card">
      <div class="media" [class.no-cover]="!post.coverImageUrl">
        @if (post.coverImageUrl) {
          <img [src]="post.coverImageUrl" [alt]="post.title">
        } @else {
          <span>{{ post.title.charAt(0) }}</span>
        }
      </div>

      <div class="body">
        <div class="meta">
          <span>{{ post.categorySlug }}</span>
          <span class="status" [class.published]="post.status === 'published'">{{ post.status }}</span>
        </div>
        <h3>{{ post.title }}</h3>
        <p>{{ post.excerpt }}</p>

        <div class="tags">
          @for (tag of post.tags; track tag) {
            <span>{{ tag }}</span>
          }
        </div>

        <div class="actions">
          <button class="btn btn-sm btn-primary" type="button" (click)="openComments.emit(post)">Comentarios</button>
          @if (showDelete) {
            <button class="btn btn-sm btn-outline-danger" type="button" (click)="deletePost.emit(post)">Eliminar</button>
          }
        </div>
      </div>
    </article>
  `,
  styles: [`
    .post-card {
      overflow: hidden;
      border: 1px solid #d7dde7;
      border-radius: 12px;
      background: #fff;
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
    }

    .media {
      height: 190px;
      background: #102a43;
    }

    .media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .media.no-cover {
      display: grid;
      place-items: center;
      background: linear-gradient(135deg, #0f766e, #334155);
      color: #fff;
      font-size: 4rem;
      font-weight: 900;
    }

    .body {
      display: grid;
      gap: 12px;
      padding: 20px;
    }

    .meta,
    .tags,
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }

    .meta {
      justify-content: space-between;
      color: #64748b;
      font-size: 0.78rem;
      font-weight: 800;
      text-transform: uppercase;
    }

    .status.published {
      color: #15803d;
    }

    h3 {
      margin: 0;
      font-size: 1.45rem;
    }

    p {
      margin: 0;
      color: #475569;
    }

    .tags span {
      padding: 4px 9px;
      border-radius: 999px;
      background: #e0f2fe;
      color: #075985;
      font-size: 0.78rem;
      font-weight: 800;
    }

    .actions {
      margin-top: 6px;
    }
  `],
})
export class PostCardComponent {
  @Input({ required: true }) post!: Post;
  @Input() showDelete = false;
  @Output() openComments = new EventEmitter<Post>();
  @Output() deletePost = new EventEmitter<Post>();
}
