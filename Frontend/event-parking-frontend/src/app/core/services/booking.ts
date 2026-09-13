import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  BookingCreateRequest,
  BookingDetails
} from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/bookings`;

  /*
    GET /api/bookings

    Administrator only.

    Backend BookingDetailsDto list
    return pannuthu.
  */
  getAll(): Observable<BookingDetails[]> {

    return this.http.get<BookingDetails[]>(
      this.apiUrl
    );
  }

  /*
    GET /api/bookings/my

    Current logged-in customer bookings.
  */
  getMy(): Observable<BookingDetails[]> {

    return this.http.get<BookingDetails[]>(
      `${this.apiUrl}/my`
    );
  }

  // GET /api/bookings/{id}
  getById(
    id: number
  ): Observable<BookingDetails> {

    return this.http.get<BookingDetails>(
      `${this.apiUrl}/${id}`
    );
  }

  /*
    POST /api/bookings

    Customer booking create.
  */
  create(
    request: BookingCreateRequest
  ): Observable<BookingDetails> {

    return this.http.post<BookingDetails>(
      this.apiUrl,
      request
    );
  }

  /*
    PUT /api/bookings/{id}/cancel

    Customer/Admin booking cancel.
  */
  cancel(
    id: number
  ): Observable<BookingDetails> {

    return this.http.put<BookingDetails>(
      `${this.apiUrl}/${id}/cancel`,
      null
    );
  }
}