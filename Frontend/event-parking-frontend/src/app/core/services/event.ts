import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Backend API base URL
import { environment } from '../../../environments/environment';

// Event related models
import {
  Event,
  EventCreateRequest,
  EventUpdateRequest
} from '../models/event.model';

// Common message response model
import { MessageResponse } from '../models/auth.model';

/*
  Event list filters

  Example:
  name = concert
  date = 2026-09-10
  venueId = 1
  categoryId = 2
*/
export interface EventFilters {
  name?: string;
  date?: string;
  venueId?: number;
  categoryId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {

  // HttpClient inject pannrom
  private readonly http = inject(HttpClient);

  /*
    environment.apiUrl =
    https://localhost:7080/api

    Final URL =
    https://localhost:7080/api/events
  */
  private readonly apiUrl =
    `${environment.apiUrl}/events`;

  /*
    GET ALL EVENTS

    GET /api/events

    Optional filters:
    name
    date
    venueId
    categoryId
  */
  getAll(
    filters: EventFilters = {}
  ): Observable<Event[]> {

    let params = new HttpParams();

    // Event name filter
    if (filters.name?.trim()) {
      params = params.set(
        'name',
        filters.name.trim()
      );
    }

    // Event date filter
    if (filters.date) {
      params = params.set(
        'date',
        filters.date
      );
    }

    // Venue filter
    if (filters.venueId !== undefined) {
      params = params.set(
        'venueId',
        filters.venueId.toString()
      );
    }

    // Category filter
    if (filters.categoryId !== undefined) {
      params = params.set(
        'categoryId',
        filters.categoryId.toString()
      );
    }

    return this.http.get<Event[]>(
      this.apiUrl,
      { params }
    );
  }

  /*
    GET SINGLE EVENT

    GET /api/events/{id}
  */
  getById(
    id: number
  ): Observable<Event> {

    return this.http.get<Event>(
      `${this.apiUrl}/${id}`
    );
  }

  /*
    CREATE EVENT

    POST /api/events

    Admin only
  */
  create(
    request: EventCreateRequest
  ): Observable<Event> {

    return this.http.post<Event>(
      this.apiUrl,
      request
    );
  }

  /*
    UPDATE EVENT

    PUT /api/events/{id}

    Admin only
  */
  update(
    id: number,
    request: EventUpdateRequest
  ): Observable<Event> {

    return this.http.put<Event>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  /*
    DELETE EVENT

    DELETE /api/events/{id}

    Admin only
  */
  delete(
    id: number
  ): Observable<MessageResponse> {

    return this.http.delete<MessageResponse>(
      `${this.apiUrl}/${id}`
    );
  }
}