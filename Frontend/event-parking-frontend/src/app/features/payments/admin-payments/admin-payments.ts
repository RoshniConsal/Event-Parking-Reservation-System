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
  selector: 'app-admin-payments',

  imports: [
    DatePipe,
    DecimalPipe
  ],

  templateUrl:
    './admin-payments.html',

  styleUrl:
    './admin-payments.css'
})
export class AdminPayments
  implements OnInit {

  private readonly paymentService =
    inject(PaymentService);


  readonly PaymentStatus =
    PaymentStatus;


  readonly PaymentMethod =
    PaymentMethod;


  readonly payments =
    signal<Payment[]>([]);


  readonly searchTerm =
    signal('');


  readonly selectedStatus =
    signal<PaymentStatus | 0>(0);


  readonly selectedMethod =
    signal<number>(-1);


  readonly isLoading =
    signal(true);


  readonly errorMessage =
    signal('');


  readonly filteredPayments =
    computed(() => {

      const search =
        this.searchTerm()
          .trim()
          .toLowerCase();


      const status =
        this.selectedStatus();


      const method =
        this.selectedMethod();


      return this.payments()
        .filter(payment => {

          const matchesStatus =
            status === 0 ||
            payment.status === status;


          const matchesMethod =
            method === -1 ||
            payment.paymentMethod === method;


          if (
            !matchesStatus ||
            !matchesMethod
          ) {

            return false;

          }


          if (!search) {

            return true;

          }


          return (

            payment.bookingNumber
              .toLowerCase()
              .includes(search) ||

            payment.customerName
              .toLowerCase()
              .includes(search) ||

            payment.transactionReference
              .toLowerCase()
              .includes(search) ||

            payment.id
              .toString()
              .includes(search) ||

            payment.bookingId
              .toString()
              .includes(search) ||

            payment.customerId
              .toString()
              .includes(search)

          );

        });

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


  readonly totalRevenue =
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


  readonly pendingAmount =
    computed(() =>
      this.payments()
        .filter(
          payment =>
            payment.status ===
            PaymentStatus.Pending
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
      .getAll()
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
      ) as PaymentStatus | 0;


    this.selectedStatus.set(
      value
    );

  }


  onMethodChange(
    event: Event
  ): void {

    const select =
      event.target as HTMLSelectElement;


    this.selectedMethod.set(
      Number(
        select.value
      )
    );

  }


  clearFilters(): void {

    this.searchTerm.set('');

    this.selectedStatus.set(0);

    this.selectedMethod.set(-1);

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

      return 'You are not allowed to access admin payments.';

    }


    const backendMessage =
      error.error?.message;


    if (
      typeof backendMessage ===
      'string'
    ) {

      return backendMessage;

    }


    return 'Unable to load payments. Please try again.';

  }

}