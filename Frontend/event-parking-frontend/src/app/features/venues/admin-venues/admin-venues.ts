import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import {
  DecimalPipe
} from '@angular/common';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  finalize
} from 'rxjs';

import {
  Venue,
  VenueCreateRequest,
  VenueUpdateRequest
} from '../../../core/models/venue.model';

import {
  VenueService
} from '../../../core/services/venue';


@Component({
  selector: 'app-admin-venues',

  imports: [
    ReactiveFormsModule,
    DecimalPipe
  ],

  templateUrl:
    './admin-venues.html',

  styleUrl:
    './admin-venues.css'
})
export class AdminVenues
  implements OnInit {

  private readonly venueService =
    inject(VenueService);

  private readonly fb =
    inject(FormBuilder);


  readonly venues =
    signal<Venue[]>([]);


  readonly isLoading =
    signal(true);


  readonly isSaving =
    signal(false);


  readonly deletingId =
    signal<number | null>(null);


  readonly editingVenueId =
    signal<number | null>(null);


  readonly errorMessage =
    signal('');


  readonly successMessage =
    signal('');


  readonly venueForm =
    this.fb.nonNullable.group({

      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(150)
        ]
      ],

      address: [
        '',
        [
          Validators.required,
          Validators.maxLength(300)
        ]
      ],

      capacity: [
        1,
        [
          Validators.required,
          Validators.min(1)
        ]
      ]

    });


  ngOnInit(): void {

    this.loadVenues();

  }


  loadVenues(): void {

    this.isLoading.set(true);

    this.errorMessage.set('');


    this.venueService
      .getAll()
      .pipe(

        finalize(() => {

          this.isLoading.set(false);

        })

      )
      .subscribe({

        next: venues => {

          this.venues.set(
            [...venues].sort(
              (a, b) =>
                a.name.localeCompare(
                  b.name
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
              'Unable to load venues.'
            )
          );

        }

      });

  }


  editVenue(
    venue: Venue
  ): void {

    this.editingVenueId.set(
      venue.id
    );

    this.successMessage.set('');

    this.errorMessage.set('');


    this.venueForm.setValue({

      name:
        venue.name,

      address:
        venue.address,

      capacity:
        venue.capacity

    });


    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  }


  cancelEdit(): void {

    this.editingVenueId.set(null);

    this.venueForm.reset({

      name: '',
      address: '',
      capacity: 1

    });

    this.errorMessage.set('');

  }


  saveVenue(): void {

    this.successMessage.set('');

    this.errorMessage.set('');


    if (
      this.venueForm.invalid
    ) {

      this.venueForm.markAllAsTouched();

      return;

    }


    const formValue =
      this.venueForm.getRawValue();


    const request:
      VenueCreateRequest |
      VenueUpdateRequest = {

        name:
          formValue.name.trim(),

        address:
          formValue.address.trim(),

        capacity:
          Number(
            formValue.capacity
          )

      };


    if (
      !request.name ||
      !request.address
    ) {

      this.errorMessage.set(
        'Venue name and address are required.'
      );

      return;

    }


    const editingId =
      this.editingVenueId();


    this.isSaving.set(true);


    const operation$ =
      editingId === null

        ? this.venueService.create(
            request
          )

        : this.venueService.update(
            editingId,
            request
          );


    operation$
      .pipe(

        finalize(() => {

          this.isSaving.set(false);

        })

      )
      .subscribe({

        next: () => {

          this.successMessage.set(

            editingId === null

              ? 'Venue created successfully.'

              : 'Venue updated successfully.'

          );


          this.editingVenueId.set(
            null
          );


          this.venueForm.reset({

            name: '',
            address: '',
            capacity: 1

          });


          this.loadVenues();

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              editingId === null

                ? 'Unable to create venue.'

                : 'Unable to update venue.'
            )
          );

        }

      });

  }


  deleteVenue(
    venue: Venue
  ): void {

    const confirmed =
      window.confirm(
        `Delete "${venue.name}"? This action cannot be undone.`
      );


    if (!confirmed) {

      return;

    }


    this.successMessage.set('');

    this.errorMessage.set('');

    this.deletingId.set(
      venue.id
    );


    this.venueService
      .delete(
        venue.id
      )
      .pipe(

        finalize(() => {

          this.deletingId.set(null);

        })

      )
      .subscribe({

        next: () => {

          this.successMessage.set(
            'Venue deleted successfully.'
          );


          if (
            this.editingVenueId()
            === venue.id
          ) {

            this.cancelEdit();

          }


          this.loadVenues();

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Unable to delete venue.'
            )
          );

        }

      });

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

      return 'You are not allowed to manage venues.';

    }


    if (
      error.status === 409
    ) {

      return (
        error.error?.message
        ||
        'This venue cannot be changed because it is currently being used.'
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


    return fallback;

  }

}