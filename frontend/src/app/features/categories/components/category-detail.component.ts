import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="category-detail">
      <a routerLink="/" class="back-link">Volver a categorías</a>
      <h1>{{ categoryName }}</h1>
      <p>Próximamente aquí aparecerán los posts de esta categoría.</p>
    </main>
  `,
  styles: [
    `
      .category-detail {
        width: min(960px, calc(100% - 32px));
        margin: 0 auto;
        padding: 40px 0;
      }

      .back-link {
        display: inline-block;
        margin-bottom: 20px;
        color: #0f766e;
        font-weight: 700;
        text-decoration: none;
      }

      h1 {
        margin: 0 0 12px;
        font-size: 2.5rem;
      }

      p {
        color: #475569;
        font-size: 1.05rem;
      }
    `,
  ],
})
export class CategoryDetailComponent {
  private route = inject(ActivatedRoute);
  private slug = this.route.snapshot.paramMap.get('slug') ?? '';

  categoryName = this.slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
