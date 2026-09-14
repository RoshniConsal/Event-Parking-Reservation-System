import {
  inject,
  Injectable
} from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  environment
} from '../../../environments/environment';

import {
  ParkingSlot,
  ParkingSlotCreateRequest,
  ParkingSlotGenerateRequest,
  ParkingSlotUpdateRequest
} from '../models/parking-slot.model';


@Injectable({
  providedIn: 'root'
})
export class ParkingService {

  private readonly http =
    inject(HttpClient);


  private readonly apiUrl =
    environment.apiUrl;


  /* =====================================================
     GET EVENT PARKING
     ===================================================== */

  getByEvent(
    eventId: number,
    availableOnly = false
  ): Observable<ParkingSlot[]> {

    const params =
      new HttpParams()
        .set(
          'availableOnly',
          availableOnly.toString()
        );


    return this.http
      .get<ParkingSlot[]>(

        `${this.apiUrl}/events/${eventId}/parking-slots`,

        {
          params
        }
      );
  }


  /* =====================================================
     GET SLOT
     ===================================================== */

  getById(
    id: number
  ): Observable<ParkingSlot> {

    return this.http
      .get<ParkingSlot>(

        `${this.apiUrl}/parking-slots/${id}`

      );
  }


  /* =====================================================
     CREATE ONE SLOT
     ===================================================== */

  create(
    eventId: number,
    request:
      ParkingSlotCreateRequest
  ): Observable<ParkingSlot> {

    return this.http
      .post<ParkingSlot>(

        `${this.apiUrl}/events/${eventId}/parking-slots`,

        request

      );
  }


  /* =====================================================
     GENERATE MANY SLOTS
     ===================================================== */

  generate(
    eventId: number,
    request:
      ParkingSlotGenerateRequest
  ): Observable<ParkingSlot[]> {

    return this.http
      .post<ParkingSlot[]>(

        `${this.apiUrl}/events/${eventId}/parking-slots/generate`,

        request

      );
  }


  /* =====================================================
     UPDATE
     ===================================================== */

  update(
    id: number,
    request:
      ParkingSlotUpdateRequest
  ): Observable<ParkingSlot> {

    return this.http
      .put<ParkingSlot>(

        `${this.apiUrl}/parking-slots/${id}`,

        request

      );
  }


  /* =====================================================
     DELETE
     ===================================================== */

  delete(
    id: number
  ): Observable<void> {

    return this.http
      .delete<void>(

        `${this.apiUrl}/parking-slots/${id}`

      );
  }

}