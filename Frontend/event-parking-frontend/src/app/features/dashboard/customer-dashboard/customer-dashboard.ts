import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  DatePipe,
  DecimalPipe
} from '@angular/common';

import {
  RouterLink
} from '@angular/router';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  finalize
} from 'rxjs';

import {
  CustomerDashboard as CustomerDashboardData
} from '../../../core/models/dashboard.model';

import {
  DashboardService
} from '../../../core/services/dashboard';

import {
  AuthStateService
} from '../../../core/services/auth-state';


@Component({
  selector: 'app-customer-dashboard',

  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink
  ],

  templateUrl:
    './customer-dashboard.html',

  styleUrl:
    './customer-dashboard.css'
})
export class CustomerDashboard
  implements OnInit {

  private readonly dashboardService =
    inject(DashboardService);


  readonly authState =
    inject(AuthStateService);


  readonly dashboard =
    signal<CustomerDashboardData | null>(
      null
    );


  readonly isLoading =
    signal(true);


  readonly errorMessage =
    signal('');


  ngOnInit(): void {

    this.loadDashboard();

  }


  loadDashboard(): void {

    this.isLoading.set(true);

    this.errorMessage.set('');


    this.dashboardService
      .getCustomerDashboard()
      .pipe(

        finalize(() => {

          this.isLoading.set(false);

        })

      )
      .subscribe({

        next: dashboard => {

          this.dashboard.set(
            dashboard
          );

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.dashboard.set(null);

          this.errorMessage.set(
            this.getErrorMessage(
              error
            )
          );

        }

      });

  }


  private getErrorMessage(
    error: HttpErrorResponse
  ): string {

    if (
      error.status === 0
    ) {

      return 'Unable to connect to the VenueFlow server. Please make sure the backend API is running.';

    }


    if (
      error.status === 401
    ) {

      return 'Your login session has expired. Please sign in again.';

    }


    if (
      error.status === 403
    ) {

      return 'You are not allowed to access the customer dashboard.';

    }


    const backendMessage =
      error.error?.message;


    if (
      typeof backendMessage ===
      'string'
    ) {

      return backendMessage;

    }


    return 'Unable to load your dashboard. Please try again.';

  }
}