import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoriesService } from '../services/categories.service';
import { Category } from '../data/category.interfaces';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-categories-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="categories-page">
      <section class="categories-header">
        <div>
          <p class="eyebrow">Explora por género</p>
          <h1>Elige una categoría para comenzar</h1>
          <p class="lead">
            Cada post vive dentro de un género. Selecciona uno para leer o crear contenido relacionado.
          </p>
        </div>
      </section>

      @if (isLoading()) {
        <div class="d-flex justify-content-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
      } @else {
        <section class="categories-grid" aria-label="Categorías de posts">
          @for (category of categories(); track category._id) {
            <a
              class="category-card"
              [routerLink]="['/categories', category.slug]"
              [style.border-top-color]="category.color"
            >
              <span class="category-icon" [style.background]="category.color">
                {{ iconFor(category.icon) }}
              </span>
              <span class="category-name">{{ category.name }}</span>
              <span class="category-description">{{ category.description }}</span>
            </a>
          } @empty {
            <div class="empty-state">
              <h2>No hay categorías disponibles</h2>
            </div>
          }
        </section>
      }
    </main>
  `,
  styles: [
    `
      .categories-page {
        width: min(1120px, calc(100% - 32px));
        margin: 0 auto;
        padding: 40px 0 56px;
      }

      .categories-header {
        display: flex;
        justify-content: space-between;
        gap: 24px;
        margin-bottom: 28px;
      }

      .eyebrow {
        margin: 0 0 8px;
        color: #0f766e;
        font-weight: 700;
        text-transform: uppercase;
        font-size: 0.78rem;
        letter-spacing: 0;
      }

      h1 {
        margin: 0;
        font-size: clamp(2rem, 4vw, 3.5rem);
        line-height: 1.05;
      }

      .lead {
        max-width: 680px;
        margin: 14px 0 0;
        color: #475569;
        font-size: 1.05rem;
      }

      .categories-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 18px;
      }

      .category-card {
        display: flex;
        min-height: 184px;
        flex-direction: column;
        gap: 12px;
        padding: 20px;
        border: 1px solid #d7dde7;
        border-top: 5px solid;
        border-radius: 8px;
        background: #fff;
        color: #111827;
        text-decoration: none;
        box-shadow: 0 8px 22px rgba(15, 23, 42, 0.06);
        transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
      }

      .category-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 16px 32px rgba(15, 23, 42, 0.11);
      }

      .category-icon {
        display: inline-flex;
        width: 42px;
        height: 42px;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        color: #fff;
        font-size: 1.35rem;
        font-weight: 700;
      }

      .category-name {
        font-size: 1.25rem;
        font-weight: 800;
      }

      .category-description {
        color: #4b5563;
        line-height: 1.45;
      }

      .empty-state {
        grid-column: 1 / -1;
        padding: 40px;
        border: 1px solid #d7dde7;
        border-radius: 8px;
        text-align: center;
      }
    `,
  ],
})
export class CategoriesDashboardComponent implements OnInit {
  private categoriesService = inject(CategoriesService);
  private toast = inject(ToastService);

  categories = signal<Category[]>([]);
  isLoading = signal(false);
  hasCategories = computed(() => this.categories().length > 0);

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.isLoading.set(true);

    this.categoriesService.getCategories().subscribe({
      next: (response) => {
        this.categories.set(response.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.error('No se pudieron cargar las categorías.');
      },
    });
  }

  iconFor(icon: string): string {
    const icons: Record<string, string> = {
      moon: 'L',
      smile: ':)',
      heart: '<3',
      rocket: '^',
      sparkles: '*',
      theater: 'T',
      search: '?',
      compass: 'N',
    };

    return icons[icon] ?? '#';
  }
}
