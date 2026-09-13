import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  GenerateSeatMapResponse,
  Seat,
  SeatCreateRequest,
  SeatUpdateRequest
} from '../models/seat.model';

import { MessageResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class SeatService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    environment.apiUrl;

  /*
    GET /api/events/{eventId}/seats

    availableOnly=true kudutha
    available seats mattum varum.
  */
  getByEvent(
    eventId: number,
    availableOnly = false
  ): Observable<Seat[]> {

    const params = new HttpParams()
      .set(
        'availableOnly',
        availableOnly.toString()
      );

    return this.http.get<Seat[]>(
      `${this.apiUrl}/events/${eventId}/seats`,
      { params }
    );
  }

  // GET /api/seats/{id}
  getById(
    id: number
  ): Observable<Seat> {
    return this.http.get<Seat>(
      `${this.apiUrl}/seats/${id}`
    );
  }

  /*
    POST /api/events/{eventId}/seats

    Admin manual-aa single seat
    create panna use pannuvom.
  */
  create(
    eventId: number,
    request: SeatCreateRequest
  ): Observable<Seat> {

    return this.http.post<Seat>(
      `${this.apiUrl}/events/${eventId}/seats`,
      request
    );
  }

  /*
    POST /api/events/{eventId}/seats/generate

    Full seat map generate.
  */
  generateSeatMap(
    eventId: number,
    rows: number,
    seatsPerRow: number,
    seatType?: string | null,
    priceOverride?: number | null
  ): Observable<GenerateSeatMapResponse> {

    let params = new HttpParams()
      .set('rows', rows.toString())
      .set(
        'seatsPerRow',
        seatsPerRow.toString()
      );

    if (seatType?.trim()) {
      params = params.set(
        'seatType',
        seatType.trim()
      );
    }

    if (
      priceOverride !== null &&
      priceOverride !== undefined
    ) {
      params = params.set(
        'priceOverride',
        priceOverride.toString()
      );
    }

    return this.http.post<GenerateSeatMapResponse>(
      `${this.apiUrl}/events/${eventId}/seats/generate`,
      null,
      { params }
    );
  }

  // PUT /api/seats/{id}
  update(
    id: number,
    request: SeatUpdateRequest
  ): Observable<Seat> {

    return this.http.put<Seat>(
      `${this.apiUrl}/seats/${id}`,
      request
    );
  }

  // DELETE /api/seats/{id}
  delete(
    id: number
  ): Observable<MessageResponse> {

    return this.http.delete<MessageResponse>(
      `${this.apiUrl}/seats/${id}`
    );
  }
}