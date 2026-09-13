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
  selector: 'app-admin-bookings',

  imports: [
    DatePipe,
    DecimalPipe
  ],

  templateUrl:
    './admin-bookings.html',

  styleUrl:
    './admin-bookings.css'
})
export class AdminBookings
  implements OnInit {

  private readonly bookingService =
    inject(BookingService);


  readonly BookingStatus =
    BookingStatus;


  readonly bookings =
    signal<BookingDetails[]>([]);


  readonly searchTerm =
    signal('');


  readonly selectedStatus =
    signal<BookingStatus | 0>(0);


  readonly expandedBookingId =
    signal<number | null>(null);


  readonly isLoading =
    signal(true);


  readonly cancellingBookingId =
    signal<number | null>(null);


  readonly errorMessage =
    signal('');


  readonly successMessage =
    signal('');


  readonly filteredBookings =
    computed(() => {

      const search =
        this.searchTerm()
          .trim()
          .toLowerCase();

      const status =
        this.selectedStatus();

      return this.bookings()
        .filter(booking => {

          const matchesStatus =
            status === 0 ||
            booking.status === status;


          if (!matchesStatus) {
            return false;
          }


          if (!search) {
            return true;
          }


          return (
            booking.bookingNumber
              .toLowerCase()
              .includes(search) ||

            booking.customerName
              .toLowerCase()
              .includes(search) ||

            booking.eventName
              .toLowerCase()
              .includes(search) ||

            booking.customerId
              .toString()
              .includes(search) ||

            booking.id
              .toString()
              .includes(search)
          );

        });

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
      .getAll()
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


          const expandedId =
            this.expandedBookingId();


          if (
            expandedId !== null &&
            !sortedBookings.some(
              booking =>
                booking.id === expandedId
            )
          ) {

            this.expandedBookingId.set(
              null
            );

          }

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.bookings.set([]);

          this.errorMessage.set(
            this.getLoadErrorMessage(
              error
            )
          );

        }

      });

  }


  onSearchInput(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    this.searchTerm.set(
      input.value
    );

  }


  onStatusChange(
    event: Event
  ): void {

    const select =
      event.target as HTMLSelectElement;


    const value =
      Number(
        select.value
      ) as BookingStatus | 0;


    this.selectedStatus.set(
      value
    );

  }


  clearFilters(): void {

    this.searchTerm.set('');

    this.selectedStatus.set(0);

  }


  toggleDetails(
    bookingId: number
  ): void {

    if (
      this.expandedBookingId() ===
      bookingId
    ) {

      this.expandedBookingId.set(
        null
      );

      return;

    }


    this.expandedBookingId.set(
      bookingId
    );

  }


  isExpanded(
    bookingId: number
  ): boolean {

    return (
      this.expandedBookingId() ===
      bookingId
    );

  }


  canCancel(
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


    if (
      this.cancellingBookingId()
      !== null
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `Cancel booking "${booking.bookingNumber}" for ${booking.customerName}?`
      );


    if (!confirmed) {

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
            `Booking ${updatedBooking.bookingNumber} cancelled successfully.`
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


  seatCount(
    booking: BookingDetails
  ): number {

    return booking.seats?.length ?? 0;

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

      return 'You are not allowed to access admin bookings.';

    }


    const backendMessage =
      error.error?.message;


    if (
      typeof backendMessage ===
      'string'
    ) {

      return backendMessage;

    }


    return 'Unable to load bookings. Please try again.';

  }


  private getCancelErrorMessage(
    error: HttpErrorResponse
  ): string {

    if (
      error.status === 0
    ) {

      return 'Unable to connect to the VenueFlow server. Please try again.';

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