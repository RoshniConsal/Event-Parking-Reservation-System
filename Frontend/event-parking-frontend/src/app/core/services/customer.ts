import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  Customer,
  CustomerUpdateRequest
} from '../models/customer.model';

import { MessageResponse } from '../models/auth.model';

/*
  Backend reactivate response:

  {
    message: "...",
    customer: { ... }
  }
*/
export interface CustomerReactivationResponse {
  message: string;
  customer: Customer;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/customers`;

  /*
    GET /api/customers

    Admin only.

    Optional:
    ?search=Roshni
  */
  getAll(
    search?: string
  ): Observable<Customer[]> {

    let params = new HttpParams();

    if (search?.trim()) {
      params = params.set(
        'search',
        search.trim()
      );
    }

    return this.http.get<Customer[]>(
      this.apiUrl,
      { params }
    );
  }

  /*
    GET /api/customers/{id}

    Customer own profile
    or Administrator.
  */
  getById(
    id: number
  ): Observable<Customer> {

    return this.http.get<Customer>(
      `${this.apiUrl}/${id}`
    );
  }

  /*
    PUT /api/customers/{id}

    Profile update.
  */
  update(
    id: number,
    request: CustomerUpdateRequest
  ): Observable<Customer> {

    return this.http.put<Customer>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  /*
    DELETE /api/customers/{id}

    Account deactivate.

    Admin only.
  */
  deactivate(
    id: number
  ): Observable<MessageResponse> {

    return this.http.delete<MessageResponse>(
      `${this.apiUrl}/${id}`
    );
  }

  /*
    POST /api/customers/{id}/reactivate

    Admin only.
  */
  reactivate(
    id: number
  ): Observable<CustomerReactivationResponse> {

    return this.http.post<CustomerReactivationResponse>(
      `${this.apiUrl}/${id}/reactivate`,
      null
    );
  }
}