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
  Router,
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
  EventService
} from '../../../core/services/event';

import {
  AuthStateService
} from '../../../core/services/auth-state';


@Component({
  selector: 'app-event-details',

  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink
  ],

  templateUrl:
    './event-details.html',

  styleUrl:
    './event-details.css'
})
export class EventDetails
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly eventService =
    inject(EventService);

  readonly authState =
    inject(AuthStateService);


  readonly event =
    signal<Event | null>(null);

  readonly isLoading =
    signal(true);

  readonly errorMessage =
    signal('');


  ngOnInit(): void {

    const idValue =
      this.route.snapshot
        .paramMap
        .get('id');


    const eventId =
      Number(idValue);


    if (
      !idValue ||
      Number.isNaN(eventId) ||
      eventId <= 0
    ) {

      this.isLoading.set(false);

      this.errorMessage.set(
        'Invalid event.'
      );

      return;
    }


    this.loadEvent(eventId);
  }


  loadEvent(
    eventId: number
  ): void {

    this.isLoading.set(true);

    this.errorMessage.set('');


    this.eventService
      .getById(eventId)
      .pipe(

        finalize(() => {

          this.isLoading.set(false);

        })

      )
      .subscribe({

        next: event => {

          this.event.set(event);

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.event.set(null);

          this.errorMessage.set(
            this.getErrorMessage(
              error
            )
          );

        }

      });
  }


  reserveEvent(): void {

    const currentEvent =
      this.event();


    if (!currentEvent) {
      return;
    }


    const seatUrl =
      `/customer/events/${currentEvent.id}/seats`;


    /*
      Login pannala na:
      Login page-ku send pannuvom.
    */

    if (
      !this.authState.isAuthenticated()
    ) {

      this.router.navigate(
        ['/login'],
        {
          queryParams: {
            returnUrl:
              seatUrl
          }
        }
      );

      return;
    }


    /*
      Customer:
      Seat Selection-ku pogum.
    */

    if (
      this.authState.role()
      === 'Customer'
    ) {

      this.router.navigateByUrl(
        seatUrl
      );

      return;
    }


    /*
      Administrator:
      Customer booking flow-ku
      send panna maatom.
    */

    if (
      this.authState.role()
      === 'Administrator'
    ) {

      this.router.navigate(
        ['/admin/events']
      );
    }
  }


  isPastEvent(
    event: Event
  ): boolean {

    return (
      new Date(
        event.endDateTime
      ).getTime()
      <
      Date.now()
    );
  }


  getDuration(
    event: Event
  ): string {

    const start =
      new Date(
        event.startDateTime
      ).getTime();

    const end =
      new Date(
        event.endDateTime
      ).getTime();


    const totalMinutes =
      Math.max(
        0,
        Math.round(
          (end - start) /
          60000
        )
      );


    const hours =
      Math.floor(
        totalMinutes / 60
      );

    const minutes =
      totalMinutes % 60;


    if (
      hours > 0 &&
      minutes > 0
    ) {

      return `${hours}h ${minutes}m`;

    }


    if (hours > 0) {

      return `${hours}h`;

    }


    return `${minutes}m`;
  }


  private getErrorMessage(
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

      return 'This event could not be found.';

    }


    const backendMessage =
      error.error?.message;


    if (
      typeof backendMessage ===
      'string'
    ) {

      return backendMessage;

    }


    return 'Unable to load event details.';
  }
}