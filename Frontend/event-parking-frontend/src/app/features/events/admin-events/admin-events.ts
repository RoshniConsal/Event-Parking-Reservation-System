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
  DatePipe,
  DecimalPipe
} from '@angular/common';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  finalize,
  forkJoin
} from 'rxjs';

import {
  Event,
  EventCreateRequest,
  EventUpdateRequest
} from '../../../core/models/event.model';

import {
  Venue
} from '../../../core/models/venue.model';

import {
  Category
} from '../../../core/models/category.model';

import {
  EventService
} from '../../../core/services/event';

import {
  VenueService
} from '../../../core/services/venue';

import {
  CategoryService
} from '../../../core/services/category';


@Component({
  selector: 'app-admin-events',

  imports: [
    ReactiveFormsModule,
    DatePipe,
    DecimalPipe
  ],

  templateUrl:
    './admin-events.html',

  styleUrl:
    './admin-events.css'
})
export class AdminEvents
  implements OnInit {

  private readonly eventService =
    inject(EventService);

  private readonly venueService =
    inject(VenueService);

  private readonly categoryService =
    inject(CategoryService);

  private readonly fb =
    inject(FormBuilder);


  readonly events =
    signal<Event[]>([]);


  readonly venues =
    signal<Venue[]>([]);


  readonly categories =
    signal<Category[]>([]);


  readonly isLoading =
    signal(true);


  readonly isSaving =
    signal(false);


  readonly deletingId =
    signal<number | null>(null);


  readonly editingEventId =
    signal<number | null>(null);


  readonly errorMessage =
    signal('');


  readonly successMessage =
    signal('');


  readonly eventForm =
    this.fb.nonNullable.group({

      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(150)
        ]
      ],

      description: [
        '',
        [
          Validators.maxLength(1000)
        ]
      ],

      venueId: [
        0,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      categoryId: [
        0,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      startDateTime: [
        '',
        [
          Validators.required
        ]
      ],

      endDateTime: [
        '',
        [
          Validators.required
        ]
      ],

      ticketPrice: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      parkingFee: [
        0,
        [
          Validators.required,
          Validators.min(0)
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

    this.loadPageData();

  }


  loadPageData(): void {

    this.isLoading.set(true);

    this.errorMessage.set('');


    forkJoin({

      events:
        this.eventService.getAll(),

      venues:
        this.venueService.getAll(),

      categories:
        this.categoryService.getAll()

    })
      .pipe(

        finalize(() => {

          this.isLoading.set(false);

        })

      )
      .subscribe({

        next: result => {

          this.events.set(
            [...result.events].sort(
              (a, b) =>
                new Date(
                  a.startDateTime
                ).getTime()
                -
                new Date(
                  b.startDateTime
                ).getTime()
            )
          );


          this.venues.set(
            [...result.venues].sort(
              (a, b) =>
                a.name.localeCompare(
                  b.name
                )
            )
          );


          this.categories.set(
            [...result.categories].sort(
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
              'Unable to load event management data.'
            )
          );

        }

      });

  }


  editEvent(
    event: Event
  ): void {

    this.editingEventId.set(
      event.id
    );

    this.successMessage.set('');

    this.errorMessage.set('');


    this.eventForm.setValue({

      name:
        event.name,

      description:
        event.description ?? '',

      venueId:
        event.venueId,

      categoryId:
        event.categoryId,

      startDateTime:
        this.toDateTimeLocal(
          event.startDateTime
        ),

      endDateTime:
        this.toDateTimeLocal(
          event.endDateTime
        ),

      ticketPrice:
        event.ticketPrice,

      parkingFee:
        event.parkingFee,

      capacity:
        event.capacity

    });


    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  }


  cancelEdit(): void {

    this.editingEventId.set(null);

    this.resetForm();

    this.errorMessage.set('');

  }


  saveEvent(): void {

    this.successMessage.set('');

    this.errorMessage.set('');


    if (
      this.eventForm.invalid
    ) {

      this.eventForm.markAllAsTouched();

      return;

    }


    const formValue =
      this.eventForm.getRawValue();


    const name =
      formValue.name.trim();


    const description =
      formValue.description.trim();


    if (!name) {

      this.errorMessage.set(
        'Event name is required.'
      );

      return;

    }


    const startDate =
      new Date(
        formValue.startDateTime
      );


    const endDate =
      new Date(
        formValue.endDateTime
      );


    if (
      Number.isNaN(
        startDate.getTime()
      )
      ||
      Number.isNaN(
        endDate.getTime()
      )
    ) {

      this.errorMessage.set(
        'Please enter valid event start and end dates.'
      );

      return;

    }


    if (
      endDate <= startDate
    ) {

      this.errorMessage.set(
        'Event end date and time must be after the start date and time.'
      );

      return;

    }


    const selectedVenue =
      this.venues().find(
        venue =>
          venue.id ===
          Number(
            formValue.venueId
          )
      );


    if (
      selectedVenue &&
      Number(
        formValue.capacity
      ) > selectedVenue.capacity
    ) {

      this.errorMessage.set(
        `Event capacity cannot exceed the selected venue capacity of ${selectedVenue.capacity}.`
      );

      return;

    }


    const request:
      EventCreateRequest |
      EventUpdateRequest = {

        name,

        description:
          description.length > 0
            ? description
            : null,

        venueId:
          Number(
            formValue.venueId
          ),

        categoryId:
          Number(
            formValue.categoryId
          ),

        startDateTime:
          formValue.startDateTime,

        endDateTime:
          formValue.endDateTime,

        ticketPrice:
          Number(
            formValue.ticketPrice
          ),

        parkingFee:
          Number(
            formValue.parkingFee
          ),

        capacity:
          Number(
            formValue.capacity
          )

      };


    const editingId =
      this.editingEventId();


    this.isSaving.set(true);


    const operation$ =
      editingId === null

        ? this.eventService.create(
            request
          )

        : this.eventService.update(
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

              ? 'Event created successfully.'

              : 'Event updated successfully.'

          );


          this.editingEventId.set(
            null
          );


          this.resetForm();

          this.loadPageData();

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.errorMessage.set(
            this.getErrorMessage(
              error,

              editingId === null

                ? 'Unable to create event.'

                : 'Unable to update event.'
            )
          );

        }

      });

  }


  deleteEvent(
    event: Event
  ): void {

    const confirmed =
      window.confirm(
        `Delete "${event.name}"? This action cannot be undone.`
      );


    if (!confirmed) {

      return;

    }


    this.successMessage.set('');

    this.errorMessage.set('');

    this.deletingId.set(
      event.id
    );


    this.eventService
      .delete(
        event.id
      )
      .pipe(

        finalize(() => {

          this.deletingId.set(null);

        })

      )
      .subscribe({

        next: () => {

          this.successMessage.set(
            'Event deleted successfully.'
          );


          if (
            this.editingEventId()
            === event.id
          ) {

            this.cancelEdit();

          }


          this.loadPageData();

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Unable to delete event.'
            )
          );

        }

      });

  }


  private resetForm(): void {

    this.eventForm.reset({

      name: '',

      description: '',

      venueId: 0,

      categoryId: 0,

      startDateTime: '',

      endDateTime: '',

      ticketPrice: 0,

      parkingFee: 0,

      capacity: 1

    });

  }


  private toDateTimeLocal(
    value: string
  ): string {

    if (!value) {

      return '';

    }


    return value.length >= 16

      ? value.substring(
          0,
          16
        )

      : value;

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

      return 'You are not allowed to manage events.';

    }


    if (
      error.status === 409
    ) {

      return (
        error.error?.message
        ||
        'This event conflicts with existing event data.'
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