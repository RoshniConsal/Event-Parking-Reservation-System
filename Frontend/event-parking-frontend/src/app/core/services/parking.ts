import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  ParkingSlot,
  ParkingSlotCreateRequest,
  ParkingSlotUpdateRequest
} from '../models/parking-slot.model';

@Injectable({
  providedIn: 'root'
})
export class ParkingService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    environment.apiUrl;

  /*
    GET /api/events/{eventId}/parking-slots
  */
  getByEvent(
    eventId: number,
    availableOnly = false
  ): Observable<ParkingSlot[]> {

    const params = new HttpParams()
      .set(
        'availableOnly',
        availableOnly.toString()
      );

    return this.http.get<ParkingSlot[]>(
      `${this.apiUrl}/events/${eventId}/parking-slots`,
      { params }
    );
  }

  // GET /api/parking-slots/{id}
  getById(
    id: number
  ): Observable<ParkingSlot> {

    return this.http.get<ParkingSlot>(
      `${this.apiUrl}/parking-slots/${id}`
    );
  }

  /*
    POST /api/events/{eventId}/parking-slots

    Admin only
  */
  create(
    eventId: number,
    request: ParkingSlotCreateRequest
  ): Observable<ParkingSlot> {

    return this.http.post<ParkingSlot>(
      `${this.apiUrl}/events/${eventId}/parking-slots`,
      request
    );
  }

  // PUT /api/parking-slots/{id}
  update(
    id: number,
    request: ParkingSlotUpdateRequest
  ): Observable<ParkingSlot> {

    return this.http.put<ParkingSlot>(
      `${this.apiUrl}/parking-slots/${id}`,
      request
    );
  }

  /*
    DELETE /api/parking-slots/{id}

    Backend 204 No Content return pannuthu.
  */
  delete(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/parking-slots/${id}`
    );
  }
}