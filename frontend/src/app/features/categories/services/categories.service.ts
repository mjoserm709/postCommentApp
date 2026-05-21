import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoriesApiResponse, PaginatedCategories } from '../data/category.interfaces';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/categories';

  getCategories(page = 1, limit = 12): Observable<CategoriesApiResponse<PaginatedCategories>> {
    return this.http.get<CategoriesApiResponse<PaginatedCategories>>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }
}
