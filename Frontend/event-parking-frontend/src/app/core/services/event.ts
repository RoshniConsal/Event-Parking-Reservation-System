import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  Event,
  EventCreateRequest,
  EventUpdateRequest,
  SeatLayoutType
} from '../models/event.model';

import { MessageResponse } from '../models/auth.model';

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

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/events`;

  getAll(
    filters: EventFilters = {}
  ): Observable<Event[]> {

    let params =
      new HttpParams();

    if (filters.name?.trim()) {
      params = params.set(
        'name',
        filters.name.trim()
      );
    }

    if (filters.date) {
      params = params.set(
        'date',
        filters.date
      );
    }

    if (
      filters.venueId !==
      undefined
    ) {
      params = params.set(
        'venueId',
        filters.venueId.toString()
      );
    }

    if (
      filters.categoryId !==
      undefined
    ) {
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


  getById(
    id: number
  ): Observable<Event> {

    return this.http.get<Event>(
      `${this.apiUrl}/${id}`
    );
  }


  create(
    request: EventCreateRequest
  ): Observable<Event> {

    return this.http.post<Event>(
      this.apiUrl,
      request
    );
  }


  update(
    id: number,
    request: EventUpdateRequest
  ): Observable<Event> {

    return this.http.put<Event>(
      `${this.apiUrl}/${id}`,
      request
    );
  }


  updateSeatLayout(
    id: number,
    seatLayoutType: SeatLayoutType
  ): Observable<Event> {

    return this.http.patch<Event>(
      `${this.apiUrl}/${id}/seat-layout`,
      {
        seatLayoutType
      }
    );
  }


  delete(
    id: number
  ): Observable<MessageResponse> {

    return this.http.delete<MessageResponse>(
      `${this.apiUrl}/${id}`
    );
  }
}