import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Backend API base URL
import { environment } from '../../../environments/environment';

// Venue related models
import {
  Venue,
  VenueAvailability,
  VenueCreateRequest,
  VenueUpdateRequest
} from '../models/venue.model';

// Common message response
import { MessageResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class VenueService {

  // Angular HttpClient inject pannrom
  private readonly http = inject(HttpClient);

  /*
    environment.apiUrl =
    https://localhost:7080/api

    Final Venue API =
    https://localhost:7080/api/venues
  */
  private readonly apiUrl =
    `${environment.apiUrl}/venues`;

  /*
    ==========================================
    GET ALL VENUES
    ==========================================

    Backend:
    GET /api/venues

    Public endpoint
  */
  getAll(): Observable<Venue[]> {

    return this.http.get<Venue[]>(
      this.apiUrl
    );
  }

  /*
    ==========================================
    GET SINGLE VENUE
    ==========================================

    Backend:
    GET /api/venues/{id}

    Example:
    GET /api/venues/1

    Public endpoint
  */
  getById(
    id: number
  ): Observable<Venue> {

    return this.http.get<Venue>(
      `${this.apiUrl}/${id}`
    );
  }

  /*
    ==========================================
    GET AVAILABLE VENUES
    ==========================================

    Backend:
    GET /api/venues/available

    Example:
    ?date=2026-09-10
    &startTime=10:00
    &endTime=12:00

    venueId kudukkama call pannina
    available venue list return aagum.
  */
  getAvailable(
    date: string,
    startTime: string,
    endTime: string
  ): Observable<Venue[]> {

    const params = new HttpParams()
      .set('date', date)
      .set('startTime', startTime)
      .set('endTime', endTime);

    return this.http.get<Venue[]>(
      `${this.apiUrl}/available`,
      { params }
    );
  }

  /*
    ==========================================
    CHECK ONE VENUE AVAILABILITY
    ==========================================

    Backend:
    GET /api/venues/available

    Example:
    ?date=2026-09-10
    &startTime=10:00
    &endTime=12:00
    &venueId=1

    Specific venue available-aa illaya
    check panna use pannuvom.
  */
  checkAvailability(
    venueId: number,
    date: string,
    startTime: string,
    endTime: string
  ): Observable<VenueAvailability> {

    const params = new HttpParams()
      .set('date', date)
      .set('startTime', startTime)
      .set('endTime', endTime)
      .set('venueId', venueId.toString());

    return this.http.get<VenueAvailability>(
      `${this.apiUrl}/available`,
      { params }
    );
  }

  /*
    ==========================================
    CREATE VENUE
    ==========================================

    Backend:
    POST /api/venues

    Administrator only
  */
  create(
    request: VenueCreateRequest
  ): Observable<Venue> {

    return this.http.post<Venue>(
      this.apiUrl,
      request
    );
  }

  /*
    ==========================================
    UPDATE VENUE
    ==========================================

    Backend:
    PUT /api/venues/{id}

    Administrator only
  */
  update(
    id: number,
    request: VenueUpdateRequest
  ): Observable<Venue> {

    return this.http.put<Venue>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  /*
    ==========================================
    DELETE VENUE
    ==========================================

    Backend:
    DELETE /api/venues/{id}

    Administrator only
  */
  delete(
    id: number
  ): Observable<MessageResponse> {

    return this.http.delete<MessageResponse>(
      `${this.apiUrl}/${id}`
    );
  }
}