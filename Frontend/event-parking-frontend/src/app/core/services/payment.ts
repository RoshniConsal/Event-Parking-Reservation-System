import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  Payment,
  PaymentCreateRequest
} from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    environment.apiUrl;

  /*
    GET /api/payments

    Administrator only.
  */
  getAll(): Observable<Payment[]> {

    return this.http.get<Payment[]>(
      `${this.apiUrl}/payments`
    );
  }

  /*
    GET /api/payments/my

    Customer own payments.
  */
  getMy(): Observable<Payment[]> {

    return this.http.get<Payment[]>(
      `${this.apiUrl}/payments/my`
    );
  }

  // GET /api/payments/{id}
  getById(
    id: number
  ): Observable<Payment> {

    return this.http.get<Payment>(
      `${this.apiUrl}/payments/${id}`
    );
  }

  /*
    POST /api/bookings/{bookingId}/payments

    Pending booking payment.
  */
  create(
    bookingId: number,
    request: PaymentCreateRequest
  ): Observable<Payment> {

    return this.http.post<Payment>(
      `${this.apiUrl}/bookings/${bookingId}/payments`,
      request
    );
  }
}