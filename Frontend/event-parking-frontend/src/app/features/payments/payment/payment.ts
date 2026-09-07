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
  Router
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
  Payment as PaymentRecord
} from '../../../core/models/payment.model';

import {
  PaymentMethod
} from '../../../core/models/enums/payment-method.enum';

import {
  BookingStatus
} from '../../../core/models/enums/booking-status.enum';

import {
  BookingService
} from '../../../core/services/booking';

import {
  PaymentService
} from '../../../core/services/payment';

import {
  BookingFlowStateService
} from '../../../core/services/booking-flow-state';


interface PaymentMethodOption {
  value: PaymentMethod;
  title: string;
  description: string;
  icon: string;
}


@Component({
  selector: 'app-payment',

  imports: [
    DatePipe,
    DecimalPipe
  ],

  templateUrl:
    './payment.html',

  styleUrl:
    './payment.css'
})
export class Payment
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly bookingService =
    inject(BookingService);

  private readonly paymentService =
    inject(PaymentService);

  private readonly bookingFlow =
    inject(BookingFlowStateService);


  readonly booking =
    signal<BookingDetails | null>(null);

  readonly paymentResult =
    signal<PaymentRecord | null>(null);

  readonly selectedPaymentMethod =
    signal<PaymentMethod>(
      PaymentMethod.NotSpecified
    );

  readonly isLoading =
    signal(true);

  readonly isPaying =
    signal(false);

  readonly errorMessage =
    signal('');

  readonly successMessage =
    signal('');


  readonly paymentMethods:
    PaymentMethodOption[] = [

      {
        value:
          PaymentMethod.Card,

        title:
          'Credit / Debit Card',

        description:
          'Pay securely using your bank card.',

        icon:
          'CARD'
      },

      {
        value:
          PaymentMethod.BankTransfer,

        title:
          'Bank Transfer',

        description:
          'Complete payment using bank transfer.',

        icon:
          'BANK'
      },

      {
        value:
          PaymentMethod.MobileWallet,

        title:
          'Mobile Wallet',

        description:
          'Pay using a supported digital wallet.',

        icon:
          'WALLET'
      }

    ];


  readonly PaymentMethod =
    PaymentMethod;

  readonly BookingStatus =
    BookingStatus;


  ngOnInit(): void {

    const bookingIdValue =
      this.route.snapshot
        .paramMap
        .get('bookingId');


    const bookingId =
      Number(
        bookingIdValue
      );


    if (
      !bookingIdValue ||
      Number.isNaN(bookingId) ||
      bookingId <= 0
    ) {

      this.isLoading.set(false);

      this.errorMessage.set(
        'Invalid booking.'
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

          this.booking.set(null);

          this.errorMessage.set(
            this.getBookingErrorMessage(
              error
            )
          );

        }

      });
  }


  selectPaymentMethod(
    method: PaymentMethod
  ): void {

    if (
      this.isPaying()
    ) {

      return;
    }


    this.selectedPaymentMethod.set(
      method
    );

    this.errorMessage.set('');
  }


  isPaymentMethodSelected(
    method: PaymentMethod
  ): boolean {

    return (
      this.selectedPaymentMethod()
      ===
      method
    );
  }


  payNow(): void {

    if (
      this.isPaying()
    ) {

      return;
    }


    const currentBooking =
      this.booking();


    if (!currentBooking) {

      this.errorMessage.set(
        'Booking information is unavailable.'
      );

      return;
    }


    if (
      currentBooking.status !==
      BookingStatus.Pending
    ) {

      this.errorMessage.set(
        'Only pending bookings can be paid.'
      );

      return;
    }


    const paymentMethod =
      this.selectedPaymentMethod();


    if (
      paymentMethod ===
      PaymentMethod.NotSpecified
    ) {

      this.errorMessage.set(
        'Please select a payment method.'
      );

      return;
    }


    this.isPaying.set(true);

    this.errorMessage.set('');

    this.successMessage.set('');


    this.paymentService
      .create(
        currentBooking.id,
        {
          paymentMethod
        }
      )
      .pipe(

        finalize(() => {

          this.isPaying.set(false);

        })

      )
      .subscribe({

        next: payment => {

          this.paymentResult.set(
            payment
          );


          this.successMessage.set(
            'Payment completed successfully.'
          );


          this.bookingFlow
            .reset();

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.errorMessage.set(
            this.getPaymentErrorMessage(
              error
            )
          );

        }

      });
  }


  viewBooking(): void {

    const currentBooking =
      this.booking();


    if (!currentBooking) {
      return;
    }


    this.router.navigate([
      '/customer/bookings',
      currentBooking.id
    ]);
  }


  goToMyBookings(): void {

    this.router.navigate([
      '/customer/bookings'
    ]);
  }


  backToCheckout(): void {

    if (
      this.paymentResult()
    ) {

      return;
    }


    this.router.navigate([
      '/customer/checkout'
    ]);
  }


  refreshBooking(): void {

    const currentBooking =
      this.booking();


    if (!currentBooking) {

      const bookingIdValue =
        this.route.snapshot
          .paramMap
          .get('bookingId');


      const bookingId =
        Number(
          bookingIdValue
        );


      if (
        bookingId > 0
      ) {

        this.loadBooking(
          bookingId
        );
      }


      return;
    }


    this.loadBooking(
      currentBooking.id
    );
  }


  private getBookingErrorMessage(
    error: HttpErrorResponse
  ): string {

    if (
      error.status === 0
    ) {

      return 'Unable to connect to the VenueFlow server.';
    }


    if (
      error.status === 404
    ) {

      return 'Booking could not be found.';
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


    const backendMessage =
      error.error?.message;


    if (
      typeof backendMessage ===
      'string'
    ) {

      return backendMessage;
    }


    return 'Unable to load booking details.';
  }


  private getPaymentErrorMessage(
    error: HttpErrorResponse
  ): string {

    if (
      error.status === 0
    ) {

      return 'Unable to connect to the VenueFlow server.';
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


      return 'Payment could not be processed. Please check the booking status.';
    }


    if (
      error.status === 404
    ) {

      return 'Booking could not be found.';
    }


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


      return 'This booking may already have been paid or is no longer available.';
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


    return 'Payment failed. Please try again.';
  }
}