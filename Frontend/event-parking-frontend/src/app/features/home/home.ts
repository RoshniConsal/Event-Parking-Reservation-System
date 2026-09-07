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
  RouterLink
} from '@angular/router';

import {
  finalize
} from 'rxjs';

import {
  Event
} from '../../core/models/event.model';

import {
  EventService
} from '../../core/services/event';

import {
  LoadingSpinner
} from '../../shared/components/loading-spinner/loading-spinner';

import {
  ErrorMessage
} from '../../shared/components/error-message/error-message';

import {
  TiltCard
} from '../../shared/directives/tilt-card';

@Component({
  selector: 'app-home',

  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    LoadingSpinner,
    ErrorMessage,
    TiltCard
  ],

  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  // Event API service
  private readonly eventService =
    inject(EventService);

  // Latest upcoming events
  readonly featuredEvents =
    signal<Event[]>([]);

  // API loading state
  readonly isLoading =
    signal(true);

  // API error state
  readonly hasError =
    signal(false);

  ngOnInit(): void {
    this.loadFeaturedEvents();
  }

  /*
    Backend-la irunthu events load panni
    nearest upcoming 3 events mattum
    landing page-la show pannuvom.
  */
  private loadFeaturedEvents(): void {

    this.isLoading.set(true);
    this.hasError.set(false);

    this.eventService
      .getAll()
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({

        next: (events) => {

          const now =
            Date.now();

          const upcomingEvents =
            events
              .filter(
                event =>
                  new Date(
                    event.startDateTime
                  ).getTime() >= now
              )
              .sort(
                (first, second) =>
                  new Date(
                    first.startDateTime
                  ).getTime()
                  -
                  new Date(
                    second.startDateTime
                  ).getTime()
              )
              .slice(0, 3);

          this.featuredEvents.set(
            upcomingEvents
          );
        },

        error: () => {
          this.hasError.set(true);
        }
      });
  }
}