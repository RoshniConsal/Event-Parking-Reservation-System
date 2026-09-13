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
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  finalize
} from 'rxjs';

import {
  BookingDetails as BookingDetailsModel
} from '../../../core/models/booking.model';

import {
  BookingStatus
} from '../../../core/models/enums/booking-status.enum';

import {
  BookingService
} from '../../../core/services/booking';


@Component({
  selector: 'app-booking-details',

  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink
  ],

  templateUrl:
    './booking-details.html',

  styleUrl:
    './booking-details.css'
})
export class BookingDetails
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly bookingService =
    inject(BookingService);


  readonly BookingStatus =
    BookingStatus;


  readonly booking =
    signal<BookingDetailsModel | null>(
      null
    );


  readonly isLoading =
    signal(true);


  readonly errorMessage =
    signal('');


  readonly successMessage =
    signal('');


  readonly isCancelling =
    signal(false);


  ngOnInit(): void {

    const bookingId =
      Number(
        this.route
          .snapshot
          .paramMap
          .get('id')
      );


    if (
      !Number.isInteger(bookingId)
      ||
      bookingId <= 0
    ) {

      this.isLoading.set(false);

      this.errorMessage.set(
        'Invalid booking ID.'
      );

      return;

    }


    this.loadBooking(
      bookingId
    );

  }


  loadBooking(
    bookingId: number
  ): void {

    this.isLoading.set(true);

    this.errorMessage.set('');

    this.successMessage.set('');


    this.bookingService
      .getById(
        bookingId
      )
      .pipe(

        finalize(() => {

          this.isLoading.set(false);

        })

      )
      .subscribe({

        next: booking => {

          this.booking.set(
            booking
          );

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.booking.set(
            null
          );

          this.errorMessage.set(
            this.getLoadErrorMessage(
              error
            )
          );

        }

      });

  }


  statusText(
    status: BookingStatus
  ): string {

    switch (status) {

      case BookingStatus.Pending:
        return 'Pending';

      case BookingStatus.Confirmed:
        return 'Confirmed';

      case BookingStatus.Cancelled:
        return 'Cancelled';

      case BookingStatus.Expired:
        return 'Expired';

      default:
        return 'Unknown';

    }

  }


  statusClass(
    status: BookingStatus
  ): string {

    switch (status) {

      case BookingStatus.Pending:
        return 'pending';

      case BookingStatus.Confirmed:
        return 'confirmed';

      case BookingStatus.Cancelled:
        return 'cancelled';

      case BookingStatus.Expired:
        return 'expired';

      default:
        return '';

    }

  }


  canPay(
    booking: BookingDetailsModel
  ): boolean {

    return (
      booking.status ===
      BookingStatus.Pending
    );

  }


  canCancel(
    booking: BookingDetailsModel
  ): boolean {

    /*
      Backend currently does not support
      refund cancellation for paid /
      confirmed bookings.

      Therefore customer cancellation is
      shown only for Pending bookings.
    */

    return (
      booking.status ===
      BookingStatus.Pending
    );

  }


  cancelBooking(): void {

    const booking =
      this.booking();


    if (
      !booking
      ||
      !this.canCancel(
        booking
      )
      ||
      this.isCancelling()
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `Cancel booking ${booking.bookingNumber}?`
      );


    if (!confirmed) {
      return;
    }


    this.errorMessage.set('');

    this.successMessage.set('');

    this.isCancelling.set(true);


    this.bookingService
      .cancel(
        booking.id
      )
      .pipe(

        finalize(() => {

          this.isCancelling.set(false);

        })

      )
      .subscribe({

        next: updatedBooking => {

          this.booking.set(
            updatedBooking
          );

          this.successMessage.set(
            `Booking ${updatedBooking.bookingNumber} was cancelled successfully.`
          );

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.errorMessage.set(
            this.getCancelErrorMessage(
              error
            )
          );

        }

      });

  }


  private getLoadErrorMessage(
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

      return 'You are not allowed to view this booking.';

    }


    if (
      error.status === 404
    ) {

      return 'The booking could not be found.';

    }


    const backendMessage =
      error.error?.message;


    if (
      typeof backendMessage ===
      'string'
    ) {

      return backendMessage;

    }


    return 'Unable to load booking details. Please try again.';

  }


  private getCancelErrorMessage(
    error: HttpErrorResponse
  ): string {

    if (
      error.status === 0
    ) {

      return 'Unable to connect to the server. Please try again.';

    }


    if (
      error.status === 401
    ) {

      return 'Your login session has expired. Please sign in again.';

    }


    if (
      error.status === 403
    ) {

      return 'You are not allowed to cancel this booking.';

    }


    if (
      error.status === 404
    ) {

      return 'The booking could not be found.';

    }


    if (
      error.status === 409
    ) {

      return (
        error.error?.message
        ??
        'This booking cannot be cancelled in its current status.'
      );

    }


    const backendMessage =
      error.error?.message;


    if (
      typeof backendMessage ===
      'string'
    ) {

      return backendMessage;

    }


    return 'Unable to cancel the booking. Please try again.';

  }

}