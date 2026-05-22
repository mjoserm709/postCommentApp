import { Component, Input } from '@angular/core';
import { HumanizeDatePipe } from '../../../shared/pipes/humanize-date.pipe';
import { PostComment } from '../data/comment.interfaces';

@Component({
  selector: 'app-comments-list',
  standalone: true,
  imports: [HumanizeDatePipe],
  template: `
    <div class="comments-thread">
      @for (comment of comments; track comment._id) {
        <article class="message" [class.own]="isOwnComment(comment)">
          <div class="avatar">{{ getInitials(authorName(comment)) }}</div>
          <div class="bubble">
            <div class="bubble-meta">
              <strong>{{ authorName(comment) }}</strong>
              <span>{{ comment.createdAt | humanizeDate }}</span>
            </div>
            <p>{{ comment.content }}</p>
            @if (canDelete(comment)) {
              <button class="btn btn-link btn-sm px-0" type="button" [disabled]="isDeleting(comment._id)" (click)="onDelete(comment._id)">
                {{ isDeleting(comment._id) ? 'Eliminando...' : 'Eliminar' }}
              </button>
            }
          </div>
        </article>
      } @empty {
        <div class="empty-comments">Aun no hay comentarios.</div>
      }
    </div>
  `,
  styles: [`
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
      max-width: 92%;
      gap: 12px;
      align-self: flex-start;
    }

    .message.own {
      align-self: flex-end;
      flex-direction: row-reverse;
    }

    .avatar {
      width: 40px;
      height: 40px;
      min-width: 40px;
      border-radius: 50%;
      background: #0ea5e9;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 0.9rem;
    }

    .message.own .avatar {
      background: #0f766e;
    }

    .bubble {
      width: 100%;
      padding: 11px 13px;
      border-radius: 12px;
      background: #fff;
      border: 1px solid #e5e7eb;
    }

    .bubble-meta {
      display: flex;
      justify-content: space-between;
      gap: 16px;
    }

    .bubble-meta span,
    .empty-comments {
      color: #64748b;
      font-size: 0.84rem;
      font-weight: 700;
    }

    .bubble p {
      margin: 6px 0 0;
      color: #1f2937;
    }

    .empty-comments {
      padding: 16px;
      text-align: center;
    }

    @media (max-width: 720px) {
      .comments-thread {
        padding: 16px;
      }

      .message {
        max-width: 100%;
      }

      .bubble-meta {
        flex-direction: column;
        gap: 4px;
      }
    }
  `],
})
export class CommentsListComponent {
  @Input() comments: PostComment[] = [];
  @Input() currentUserId: string | null = null;
  @Input() deleteComment: (id: string) => void = () => undefined;
  @Input() deletingCommentIds: string[] = [];

  authorName(comment: PostComment): string {
    if (!comment.author) {
      return 'Usuario';
    }

    return `${comment.author.firstName} ${comment.author.lastName}`.trim() || comment.author.username;
  }

  getInitials(name: string): string {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  isOwnComment(comment: PostComment): boolean {
    return !!this.currentUserId && comment.authorId === this.currentUserId;
  }

  canDelete(comment: PostComment): boolean {
    return this.isOwnComment(comment);
  }

  onDelete(id: string) {
    this.deleteComment(id);
  }

  isDeleting(id: string) {
    return this.deletingCommentIds.includes(id);
  }
}
