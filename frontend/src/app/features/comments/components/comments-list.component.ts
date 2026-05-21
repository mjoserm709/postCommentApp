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
        <article class="message">
          <div class="bubble">
            <div class="bubble-meta">
              <strong>{{ authorName(comment) }}</strong>
              <span>{{ comment.createdAt | humanizeDate }}</span>
            </div>
            <p>{{ comment.content }}</p>
            @if (canDelete(comment)) {
              <button class="btn btn-link btn-sm px-0" type="button" (click)="onDelete(comment._id)">Eliminar</button>
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
      gap: 10px;
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

  authorName(comment: PostComment): string {
    if (!comment.author) {
      return 'Usuario';
    }

    return `${comment.author.firstName} ${comment.author.lastName}`.trim() || comment.author.username;
  }

  canDelete(comment: PostComment): boolean {
    return !!this.currentUserId && comment.authorId === this.currentUserId;
  }

  onDelete(id: string) {
    this.deleteComment(id);
  }
}
