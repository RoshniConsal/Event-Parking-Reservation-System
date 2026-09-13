import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  Category,
  CategoryCreateRequest,
  CategoryUpdateRequest
} from '../models/category.model';

import { MessageResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/categories`;

  // GET /api/categories
  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(
      this.apiUrl
    );
  }

  // GET /api/categories/{id}
  getById(
    id: number
  ): Observable<Category> {
    return this.http.get<Category>(
      `${this.apiUrl}/${id}`
    );
  }

  // POST /api/categories
  create(
    request: CategoryCreateRequest
  ): Observable<Category> {
    return this.http.post<Category>(
      this.apiUrl,
      request
    );
  }

  // PUT /api/categories/{id}
  update(
    id: number,
    request: CategoryUpdateRequest
  ): Observable<Category> {
    return this.http.put<Category>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  // DELETE /api/categories/{id}
  delete(
    id: number
  ): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(
      `${this.apiUrl}/${id}`
    );
  }
}