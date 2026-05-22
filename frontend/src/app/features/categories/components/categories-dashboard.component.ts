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
          <p class="eyebrow">Explora por genero</p>
          <h1>Elige una categoria para comenzar</h1>
          <p class="lead">
            Cada post vive dentro de un genero. Selecciona uno para leer o crear contenido relacionado.
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
        <section class="categories-grid" aria-label="Categorias de posts">
          @for (category of categories(); track category._id) {
            <a class="category-card" [routerLink]="['/categories', category.slug]" [style.border-top-color]="category.color">
              <span class="category-icon" [style.background]="category.color">
                {{ iconFor(category.icon) }}
              </span>
              <span class="category-name">{{ category.name }}</span>
              <span class="category-description">{{ category.description }}</span>
            </a>
          } @empty {
            <div class="empty-state">
              <h2>No hay categorias disponibles</h2>
            </div>
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
    </main>
  `,
  styles: [`
    .categories-page { width: min(1120px, calc(100% - 32px)); margin: 0 auto; padding: 40px 0 56px; }
    .categories-header { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 28px; }
    .eyebrow { margin: 0 0 8px; color: #0f766e; font-weight: 700; text-transform: uppercase; font-size: 0.78rem; }
    h1 { margin: 0; font-size: clamp(2rem, 4vw, 3.5rem); line-height: 1.05; }
    .lead { max-width: 680px; margin: 14px 0 0; color: #475569; font-size: 1.05rem; }
    .categories-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 18px; }
    .category-card { display: flex; min-height: 184px; flex-direction: column; gap: 12px; padding: 20px; border: 1px solid #d7dde7; border-top: 5px solid; border-radius: 8px; background: #fff; color: #111827; text-decoration: none; box-shadow: 0 8px 22px rgba(15, 23, 42, 0.06); }
    .category-icon { display: inline-flex; width: 42px; height: 42px; align-items: center; justify-content: center; border-radius: 8px; color: #fff; font-size: 1.35rem; font-weight: 700; }
    .category-name { font-size: 1.25rem; font-weight: 800; }
    .category-description { color: #4b5563; line-height: 1.45; }
    .empty-state { grid-column: 1 / -1; padding: 40px; border: 1px solid #d7dde7; border-radius: 8px; text-align: center; }
    .pager { display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 22px; }
  `],
})
export class CategoriesDashboardComponent implements OnInit {
  private categoriesService = inject(CategoriesService);
  private toast = inject(ToastService);

  categories = signal<Category[]>([]);
  isLoading = signal(false);
  page = signal(1);
  totalPages = signal(1);
  limit = 12;
  hasCategories = computed(() => this.categories().length > 0);

  ngOnInit() { this.loadCategories(); }

  loadCategories() {
    this.isLoading.set(true);
    this.categoriesService.getCategories(this.page(), this.limit).subscribe({
      next: (response) => {
        const data = response.data;
        if (Array.isArray(data)) {
          this.categories.set(data);
          this.totalPages.set(1);
        } else {
          this.categories.set(data.items || []);
          this.totalPages.set(data.totalPages || 1);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.error('No se pudieron cargar las categorias.');
      },
    });
  }

  changePage(nextPage: number) {
    this.page.set(nextPage);
    this.loadCategories();
  }

  iconFor(icon: string): string {
    const icons: Record<string, string> = { moon: 'L', smile: ':)', heart: '<3', rocket: '^', sparkles: '*', theater: 'T', search: '?', compass: 'N' };
    return icons[icon] ?? '#';
  }
}
