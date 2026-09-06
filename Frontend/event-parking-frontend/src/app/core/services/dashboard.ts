import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  AdminDashboard,
  CustomerDashboard
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/dashboard`;

  /*
    GET /api/dashboard/admin

    Administrator only
  */
  getAdminDashboard():
    Observable<AdminDashboard> {

    return this.http.get<AdminDashboard>(
      `${this.apiUrl}/admin`
    );
  }

  /*
    GET /api/dashboard/customer

    Customer only
  */
  getCustomerDashboard():
    Observable<CustomerDashboard> {

    return this.http.get<CustomerDashboard>(
      `${this.apiUrl}/customer`
    );
  }
}