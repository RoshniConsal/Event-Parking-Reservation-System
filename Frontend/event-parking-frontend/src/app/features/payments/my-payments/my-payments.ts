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
  Payment
} from '../../../core/models/payment.model';

import {
  PaymentMethod
} from '../../../core/models/enums/payment-method.enum';

import {
  PaymentStatus
} from '../../../core/models/enums/payment-status.enum';

import {
  PaymentService
} from '../../../core/services/payment';


@Component({
  selector: 'app-my-payments',

  imports: [
    DatePipe,
    DecimalPipe
  ],

  templateUrl:
    './my-payments.html',

  styleUrl:
    './my-payments.css'
})
export class MyPayments
  implements OnInit {

  private readonly paymentService =
    inject(PaymentService);


  readonly PaymentStatus =
    PaymentStatus;


  readonly payments =
    signal<Payment[]>([]);


  readonly selectedStatus =
    signal<PaymentStatus | 0>(0);


  readonly isLoading =
    signal(true);


  readonly errorMessage =
    signal('');


  readonly filteredPayments =
    computed(() => {

      const status =
        this.selectedStatus();

      if (status === 0) {
        return this.payments();
      }

      return this.payments().filter(
        payment =>
          payment.status === status
      );

    });


  readonly totalPayments =
    computed(() =>
      this.payments().length
    );


  readonly completedPayments =
    computed(() =>
      this.payments()
        .filter(
          payment =>
            payment.status ===
            PaymentStatus.Completed
        )
        .length
    );


  readonly pendingPayments =
    computed(() =>
      this.payments()
        .filter(
          payment =>
            payment.status ===
            PaymentStatus.Pending
        )
        .length
    );


  readonly totalPaid =
    computed(() =>
      this.payments()
        .filter(
          payment =>
            payment.status ===
            PaymentStatus.Completed
        )
        .reduce(
          (
            total,
            payment
          ) =>
            total + payment.amount,
          0
        )
    );


  ngOnInit(): void {

    this.loadPayments();

  }


  loadPayments(): void {

    this.isLoading.set(true);

    this.errorMessage.set('');


    this.paymentService
      .getMy()
      .pipe(

        finalize(() => {

          this.isLoading.set(false);

        })

      )
      .subscribe({

        next: payments => {

          const sortedPayments =
            [...payments]
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


          this.payments.set(
            sortedPayments
          );

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.payments.set([]);

          this.errorMessage.set(
            this.getErrorMessage(
              error
            )
          );

        }

      });

  }


  setStatusFilter(
    status: PaymentStatus | 0
  ): void {

    this.selectedStatus.set(
      status
    );

  }


  statusText(
    status: PaymentStatus
  ): string {

    switch (status) {

      case PaymentStatus.Pending:
        return 'Pending';

      case PaymentStatus.Completed:
        return 'Completed';

      default:
        return 'Unknown';

    }

  }


  statusClass(
    status: PaymentStatus
  ): string {

    switch (status) {

      case PaymentStatus.Pending:
        return 'pending';

      case PaymentStatus.Completed:
        return 'completed';

      default:
        return '';

    }

  }


  paymentMethodText(
    method: PaymentMethod
  ): string {

    switch (method) {

      case PaymentMethod.Card:
        return 'Card';

      case PaymentMethod.BankTransfer:
        return 'Bank Transfer';

      case PaymentMethod.MobileWallet:
        return 'Mobile Wallet';

      case PaymentMethod.NotSpecified:
        return 'Not Specified';

      default:
        return 'Unknown';

    }

  }


  paymentMethodShort(
    method: PaymentMethod
  ): string {

    switch (method) {

      case PaymentMethod.Card:
        return 'CD';

      case PaymentMethod.BankTransfer:
        return 'BT';

      case PaymentMethod.MobileWallet:
        return 'MW';

      default:
        return 'PM';

    }

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

      return 'You are not allowed to access these payments.';

    }


    const backendMessage =
      error.error?.message;


    if (
      typeof backendMessage ===
      'string'
    ) {

      return backendMessage;

    }


    return 'Unable to load your payments. Please try again.';

  }

}