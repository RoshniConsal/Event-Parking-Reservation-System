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
  Router
} from '@angular/router';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  finalize
} from 'rxjs';

import {
  BookingService
} from '../../../core/services/booking';

import {
  BookingFlowStateService
} from '../../../core/services/booking-flow-state';


@Component({
  selector: 'app-booking-checkout',

  imports: [
    DatePipe,
    DecimalPipe
  ],

  templateUrl:
    './booking-checkout.html',

  styleUrl:
    './booking-checkout.css'
})
export class BookingCheckout
  implements OnInit {

  private readonly router =
    inject(Router);

  private readonly bookingService =
    inject(BookingService);


  readonly bookingFlow =
    inject(BookingFlowStateService);


  readonly isSubmitting =
    signal(false);

  readonly errorMessage =
    signal('');


  ngOnInit(): void {

    const currentEvent =
      this.bookingFlow.event();


    /*
      Event state-e illa na
      checkout page direct-aa
      open panna allow panna maatom.
    */

    if (!currentEvent) {

      this.router.navigate([
        '/events'
      ]);

      return;
    }


    /*
      Seats select pannama
      checkout varakoodathu.
    */

    if (
      !this.bookingFlow
        .hasSelectedSeats()
    ) {

      this.router.navigate([
        '/customer/events',
        currentEvent.id,
        'seats'
      ]);
    }
  }


  /* =========================================================
     EDIT SEATS
     ========================================================= */

  editSeats(): void {

    const currentEvent =
      this.bookingFlow.event();


    if (!currentEvent) {
      return;
    }


    this.router.navigate([
      '/customer/events',
      currentEvent.id,
      'seats'
    ]);
  }


  /* =========================================================
     EDIT PARKING
     ========================================================= */

  editParking(): void {

    const currentEvent =
      this.bookingFlow.event();


    if (!currentEvent) {
      return;
    }


    this.router.navigate([
      '/customer/events',
      currentEvent.id,
      'parking'
    ]);
  }


  /* =========================================================
     CREATE BOOKING
     ========================================================= */

  confirmBooking(): void {

    if (
      this.isSubmitting()
    ) {

      return;
    }


    const request =
      this.bookingFlow
        .buildBookingRequest();


    if (!request) {

      this.errorMessage.set(
        'Your booking selection is incomplete. Please select at least one seat.'
      );

      return;
    }


    this.isSubmitting.set(true);

    this.errorMessage.set('');


    this.bookingService
      .create(request)
      .pipe(

        finalize(() => {

          this.isSubmitting.set(false);

        })

      )
      .subscribe({

        next: booking => {

          /*
            Booking create successful.

            Backend booking ID use panni
            payment page-ku povom.
          */

          this.router.navigate([
            '/customer/bookings',
            booking.id,
            'payment'
          ]);

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.errorMessage.set(
            this.getErrorMessage(
              error
            )
          );

        }

      });
  }


  /* =========================================================
     CANCEL CHECKOUT
     ========================================================= */

  cancelCheckout(): void {

    const currentEvent =
      this.bookingFlow.event();


    if (!currentEvent) {

      this.router.navigate([
        '/events'
      ]);

      return;
    }


    this.router.navigate([
      '/events',
      currentEvent.id
    ]);
  }


  /* =========================================================
     ERROR HANDLING
     ========================================================= */

  private getErrorMessage(
    error: HttpErrorResponse
  ): string {

    if (
      error.status === 0
    ) {

      return 'Unable to connect to the VenueFlow server. Please make sure the backend API is running.';
    }


    /*
      Usually seat / parking
      another customer take pannina
      conflict varalaam.
    */

    if (
      error.status === 409
    ) {

      const backendMessage =
        error.error?.message;


      if (
        typeof backendMessage ===
        'string'
      ) {

        return backendMessage;
      }


      return 'One or more selected seats or the parking slot are no longer available. Please review your selection.';
    }


    if (
      error.status === 400
    ) {

      const backendMessage =
        error.error?.message;


      if (
        typeof backendMessage ===
        'string'
      ) {

        return backendMessage;
      }


      return 'The booking could not be created. Please check your selected seats and parking.';
    }


    if (
      error.status === 401
    ) {

      return 'Your login session has expired. Please sign in again.';
    }


    const backendMessage =
      error.error?.message;


    if (
      typeof backendMessage ===
      'string'
    ) {

      return backendMessage;
    }


    return 'Unable to create your booking. Please try again.';
  }
}