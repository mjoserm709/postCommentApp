import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RuntimeConfigService } from '../../../core/services/runtime-config.service';
import { CategoriesApiResponse, PaginatedCategories } from '../data/category.interfaces';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private http = inject(HttpClient);
  private runtimeConfig = inject(RuntimeConfigService);

  private get apiUrl() {
    return `${this.runtimeConfig.apiBaseUrl}/categories`;
  }

  getCategories(page = 1, limit = 12): Observable<CategoriesApiResponse<PaginatedCategories>> {
    return this.http.get<CategoriesApiResponse<PaginatedCategories>>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }
}
