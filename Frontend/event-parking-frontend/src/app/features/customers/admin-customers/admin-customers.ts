import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  DatePipe
} from '@angular/common';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  finalize
} from 'rxjs';

import {
  Customer,
  CustomerUpdateRequest
} from '../../../core/models/customer.model';

import {
  CustomerStatus
} from '../../../core/models/enums/customer-status.enum';

import {
  CustomerService
} from '../../../core/services/customer';


@Component({
  selector: 'app-admin-customers',

  imports: [
    ReactiveFormsModule,
    DatePipe
  ],

  templateUrl:
    './admin-customers.html',

  styleUrl:
    './admin-customers.css'
})
export class AdminCustomers
  implements OnInit {

  private readonly customerService =
    inject(CustomerService);

  private readonly fb =
    inject(FormBuilder);


  readonly CustomerStatus =
    CustomerStatus;


  readonly customers =
    signal<Customer[]>([]);


  readonly isLoading =
    signal(true);


  readonly isSaving =
    signal(false);


  readonly actionCustomerId =
    signal<number | null>(null);


  readonly editingCustomerId =
    signal<number | null>(null);


  readonly errorMessage =
    signal('');


  readonly successMessage =
    signal('');


  readonly searchForm =
    this.fb.nonNullable.group({

      search: ['']

    });


  readonly customerForm =
    this.fb.nonNullable.group({

      fullName: [
        '',
        [
          Validators.required,
          Validators.maxLength(150)
        ]
      ],

      phone: [
        '',
        [
          Validators.required,
          Validators.maxLength(30)
        ]
      ]

    });


  ngOnInit(): void {

    this.loadCustomers();

  }


  loadCustomers(
    search?: string
  ): void {

    this.isLoading.set(true);

    this.errorMessage.set('');


    this.customerService
      .getAll(
        search?.trim()
      )
      .pipe(

        finalize(() => {

          this.isLoading.set(false);

        })

      )
      .subscribe({

        next: customers => {

          this.customers.set(
            [...customers].sort(
              (a, b) =>
                a.fullName.localeCompare(
                  b.fullName
                )
            )
          );

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Unable to load customers.'
            )
          );

        }

      });

  }


  searchCustomers(): void {

    const search =
      this.searchForm.controls.search
        .value
        .trim();


    this.loadCustomers(
      search || undefined
    );

  }


  clearSearch(): void {

    this.searchForm.reset({
      search: ''
    });


    this.loadCustomers();

  }


  editCustomer(
    customer: Customer
  ): void {

    this.editingCustomerId.set(
      customer.id
    );

    this.successMessage.set('');

    this.errorMessage.set('');


    this.customerForm.setValue({

      fullName:
        customer.fullName,

      phone:
        customer.phone

    });


    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  }


  cancelEdit(): void {

    this.editingCustomerId.set(null);

    this.customerForm.reset({

      fullName: '',
      phone: ''

    });

    this.errorMessage.set('');

  }


  updateCustomer(): void {

    this.successMessage.set('');

    this.errorMessage.set('');


    const customerId =
      this.editingCustomerId();


    if (
      customerId === null
    ) {

      return;

    }


    if (
      this.customerForm.invalid
    ) {

      this.customerForm.markAllAsTouched();

      return;

    }


    const formValue =
      this.customerForm.getRawValue();


    const fullName =
      formValue.fullName.trim();


    const phone =
      formValue.phone.trim();


    if (
      !fullName ||
      !phone
    ) {

      this.errorMessage.set(
        'Full name and phone number are required.'
      );

      return;

    }


    const request:
      CustomerUpdateRequest = {

        fullName,
        phone

      };


    this.isSaving.set(true);


    this.customerService
      .update(
        customerId,
        request
      )
      .pipe(

        finalize(() => {

          this.isSaving.set(false);

        })

      )
      .subscribe({

        next: () => {

          this.successMessage.set(
            'Customer updated successfully.'
          );


          this.editingCustomerId.set(
            null
          );


          this.customerForm.reset({

            fullName: '',
            phone: ''

          });


          this.reloadCurrentSearch();

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Unable to update customer.'
            )
          );

        }

      });

  }


  deactivateCustomer(
    customer: Customer
  ): void {

    const confirmed =
      window.confirm(
        `Deactivate "${customer.fullName}"?`
      );


    if (!confirmed) {

      return;

    }


    this.successMessage.set('');

    this.errorMessage.set('');

    this.actionCustomerId.set(
      customer.id
    );


    this.customerService
      .deactivate(
        customer.id
      )
      .pipe(

        finalize(() => {

          this.actionCustomerId.set(null);

        })

      )
      .subscribe({

        next: response => {

          this.successMessage.set(
            response.message
            ||
            'Customer deactivated successfully.'
          );


          if (
            this.editingCustomerId()
            === customer.id
          ) {

            this.cancelEdit();

          }


          this.reloadCurrentSearch();

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Unable to deactivate customer.'
            )
          );

        }

      });

  }


  reactivateCustomer(
    customer: Customer
  ): void {

    const confirmed =
      window.confirm(
        `Reactivate "${customer.fullName}"?`
      );


    if (!confirmed) {

      return;

    }


    this.successMessage.set('');

    this.errorMessage.set('');

    this.actionCustomerId.set(
      customer.id
    );


    this.customerService
      .reactivate(
        customer.id
      )
      .pipe(

        finalize(() => {

          this.actionCustomerId.set(null);

        })

      )
      .subscribe({

        next: response => {

          this.successMessage.set(
            response.message
            ||
            'Customer reactivated successfully.'
          );


          this.reloadCurrentSearch();

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Unable to reactivate customer.'
            )
          );

        }

      });

  }


  isActive(
    customer: Customer
  ): boolean {

    return (
      customer.status ===
      CustomerStatus.Active
    );

  }


  getStatusLabel(
    customer: Customer
  ): string {

    return this.isActive(
      customer
    )
      ? 'Active'
      : 'Deactivated';

  }


  private reloadCurrentSearch(): void {

    const search =
      this.searchForm.controls.search
        .value
        .trim();


    this.loadCustomers(
      search || undefined
    );

  }


  private getErrorMessage(
    error: HttpErrorResponse,
    fallback: string
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

      return 'You are not allowed to manage customers.';

    }


    if (
      error.status === 404
    ) {

      return (
        error.error?.message
        ||
        'Customer was not found.'
      );

    }


    if (
      error.status === 409
    ) {

      return (
        error.error?.message
        ||
        'This customer action cannot be completed because of existing reservations or account rules.'
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


    const validationErrors =
      error.error?.errors;


    if (
      validationErrors &&
      typeof validationErrors ===
      'object'
    ) {

      const firstError =
        Object.values(
          validationErrors
        )
          .flat()
          .find(
            message =>
              typeof message ===
              'string'
          );


      if (
        typeof firstError ===
        'string'
      ) {

        return firstError;

      }

    }


    return fallback;

  }

}