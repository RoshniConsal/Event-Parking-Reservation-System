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
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';

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
  Event
} from '../../../core/models/event.model';

import {
  Category
} from '../../../core/models/category.model';

import {
  Venue
} from '../../../core/models/venue.model';

import {
  EventFilters,
  EventService
} from '../../../core/services/event';

import {
  CategoryService
} from '../../../core/services/category';

import {
  VenueService
} from '../../../core/services/venue';


@Component({
  selector: 'app-event-list',

  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule
  ],

  templateUrl:
    './event-list.html',

  styleUrl:
    './event-list.css'
})
export class EventList
  implements OnInit {

  private readonly eventService =
    inject(EventService);

  private readonly categoryService =
    inject(CategoryService);

  private readonly venueService =
    inject(VenueService);

  private readonly formBuilder =
    inject(FormBuilder);


  readonly events =
    signal<Event[]>([]);

  readonly categories =
    signal<Category[]>([]);

  readonly venues =
    signal<Venue[]>([]);

  readonly isLoading =
    signal(true);

  readonly errorMessage =
    signal('');


  readonly filterForm =
    this.formBuilder
      .nonNullable
      .group({

        name: [''],

        date: [''],

        categoryId: [''],

        venueId: ['']

      });


  ngOnInit(): void {

    this.loadFilterOptions();

    this.loadEvents();

  }


  /* =========================================================
     LOAD CATEGORY + VENUE FILTER DATA
     ========================================================= */

  private loadFilterOptions(): void {

    this.categoryService
      .getAll()
      .subscribe({

        next: categories => {

          this.categories.set(
            categories
          );

        },

        error: () => {

          this.categories.set([]);

        }

      });


    this.venueService
      .getAll()
      .subscribe({

        next: venues => {

          this.venues.set(
            venues
          );

        },

        error: () => {

          this.venues.set([]);

        }

      });

  }


  /* =========================================================
     LOAD EVENTS
     ========================================================= */

  loadEvents(
    filters: EventFilters = {}
  ): void {

    this.isLoading.set(true);

    this.errorMessage.set('');


    this.eventService
      .getAll(filters)
      .pipe(

        finalize(() => {

          this.isLoading.set(false);

        })

      )
      .subscribe({

        next: events => {

          const sortedEvents =
            [...events].sort(
              (first, second) =>

                new Date(
                  first.startDateTime
                ).getTime()

                -

                new Date(
                  second.startDateTime
                ).getTime()
            );


          this.events.set(
            sortedEvents
          );

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.events.set([]);

          this.errorMessage.set(
            this.getErrorMessage(
              error
            )
          );

        }

      });

  }


  /* =========================================================
     APPLY FILTERS
     ========================================================= */

  applyFilters(): void {

    const values =
      this.filterForm
        .getRawValue();


    const filters: EventFilters = {};


    if (
      values.name.trim()
    ) {

      filters.name =
        values.name.trim();

    }


    if (values.date) {

      filters.date =
        values.date;

    }


    if (values.categoryId) {

      filters.categoryId =
        Number(
          values.categoryId
        );

    }


    if (values.venueId) {

      filters.venueId =
        Number(
          values.venueId
        );

    }


    this.loadEvents(filters);

  }


  /* =========================================================
     CLEAR FILTERS
     ========================================================= */

  clearFilters(): void {

    this.filterForm.reset({

      name: '',

      date: '',

      categoryId: '',

      venueId: ''

    });


    this.loadEvents();

  }


  /* =========================================================
     CHECK ACTIVE FILTER
     ========================================================= */

  hasActiveFilters(): boolean {

    const values =
      this.filterForm
        .getRawValue();


    return Boolean(

      values.name.trim() ||

      values.date ||

      values.categoryId ||

      values.venueId

    );

  }


  /* =========================================================
     API ERROR
     ========================================================= */

  private getErrorMessage(
    error: HttpErrorResponse
  ): string {

    if (
      error.status === 0
    ) {

      return 'Unable to connect to the VenueFlow server. Please make sure the backend API is running.';

    }


    const backendMessage =
      error.error?.message;


    if (
      typeof backendMessage ===
      'string'
    ) {

      return backendMessage;

    }


    return 'Unable to load events. Please try again.';

  }
}