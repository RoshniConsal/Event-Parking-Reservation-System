import {
  Component,
  computed,
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
  BookingDetails
} from '../../../core/models/booking.model';

import {
  BookingStatus
} from '../../../core/models/enums/booking-status.enum';

import {
  BookingService
} from '../../../core/services/booking';


@Component({
  selector: 'app-my-bookings',

  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink
  ],

  templateUrl:
    './my-bookings.html',

  styleUrl:
    './my-bookings.css'
})
export class MyBookings
  implements OnInit {

  private readonly bookingService =
    inject(BookingService);


  readonly BookingStatus =
    BookingStatus;


  readonly bookings =
    signal<BookingDetails[]>([]);


  readonly selectedStatus =
    signal<BookingStatus | 0>(0);


  readonly isLoading =
    signal(true);


  readonly errorMessage =
    signal('');


  readonly successMessage =
    signal('');


  readonly cancellingBookingId =
    signal<number | null>(null);


  readonly filteredBookings =
    computed(() => {

      const status =
        this.selectedStatus();

      const items =
        this.bookings();

      if (status === 0) {
        return items;
      }

      return items.filter(
        booking =>
          booking.status === status
      );

    });


  readonly totalBookings =
    computed(() =>
      this.bookings().length
    );


  readonly pendingBookings =
    computed(() =>
      this.bookings()
        .filter(
          booking =>
            booking.status ===
            BookingStatus.Pending
        )
        .length
    );


  readonly confirmedBookings =
    computed(() =>
      this.bookings()
        .filter(
          booking =>
            booking.status ===
            BookingStatus.Confirmed
        )
        .length
    );


  readonly cancelledBookings =
    computed(() =>
      this.bookings()
        .filter(
          booking =>
            booking.status ===
            BookingStatus.Cancelled
        )
        .length
    );


  readonly expiredBookings =
    computed(() =>
      this.bookings()
        .filter(
          booking =>
            booking.status ===
            BookingStatus.Expired
        )
        .length
    );


  ngOnInit(): void {

    this.loadBookings();

  }


  loadBookings(): void {

    this.isLoading.set(true);

    this.errorMessage.set('');

    this.successMessage.set('');


    this.bookingService
      .getMy()
      .pipe(

        finalize(() => {

          this.isLoading.set(false);

        })

      )
      .subscribe({

        next: bookings => {

          const sortedBookings =
            [...bookings]
              .sort(
                (a, b) =>
                  new Date(
                    b.createdAt
                  ).getTime()
                  -
                  new Date(
                    a.createdAt
                  ).getTime()
              );


          this.bookings.set(
            sortedBookings
          );

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.bookings.set([]);

          this.errorMessage.set(
            this.getErrorMessage(
              error
            )
          );

        }

      });

  }


  setStatusFilter(
    status: BookingStatus | 0
  ): void {

    this.selectedStatus.set(
      status
    );

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


  canCancel(
  booking: BookingDetails
): boolean {

  return (
    booking.status ===
    BookingStatus.Pending
  );

}


  canPay(
    booking: BookingDetails
  ): boolean {

    return (
      booking.status ===
      BookingStatus.Pending
    );

  }


  cancelBooking(
    booking: BookingDetails
  ): void {

    if (
      !this.canCancel(
        booking
      )
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


    if (
      this.cancellingBookingId() !==
      null
    ) {
      return;
    }


    this.errorMessage.set('');

    this.successMessage.set('');

    this.cancellingBookingId.set(
      booking.id
    );


    this.bookingService
      .cancel(
        booking.id
      )
      .pipe(

        finalize(() => {

          this.cancellingBookingId.set(
            null
          );

        })

      )
      .subscribe({

        next: updatedBooking => {

          this.bookings.update(
            current =>
              current.map(
                item =>
                  item.id ===
                  updatedBooking.id

                    ? updatedBooking

                    : item
              )
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

      return 'You are not allowed to access these bookings.';

    }


    const backendMessage =
      error.error?.message;


    if (
      typeof backendMessage ===
      'string'
    ) {

      return backendMessage;

    }


    return 'Unable to load your bookings. Please try again.';

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