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
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  finalize,
  forkJoin
} from 'rxjs';

import {
  Event
} from '../../../core/models/event.model';

import {
  Seat
} from '../../../core/models/seat.model';

import {
  SeatStatus
} from '../../../core/models/enums/seat-status.enum';

import {
  EventService
} from '../../../core/services/event';

import {
  SeatService
} from '../../../core/services/seat';

import {
  BookingFlowStateService
} from '../../../core/services/booking-flow-state';


interface SeatRow {
  rowLabel: string;
  seats: Seat[];
}


@Component({
  selector: 'app-seat-selection',

  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink
  ],

  templateUrl:
    './seat-selection.html',

  styleUrl:
    './seat-selection.css'
})
export class SeatSelection
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly eventService =
    inject(EventService);

  private readonly seatService =
    inject(SeatService);


  readonly bookingFlow =
    inject(BookingFlowStateService);


  readonly event =
    signal<Event | null>(null);

  readonly seats =
    signal<Seat[]>([]);

  readonly isLoading =
    signal(true);

  readonly errorMessage =
    signal('');


  readonly SeatStatus =
    SeatStatus;


  readonly seatRows =
    computed<SeatRow[]>(() => {

      const groupedSeats =
        new Map<string, Seat[]>();


      for (
        const seat
        of this.seats()
      ) {

        const rowLabel =
          seat.rowLabel?.trim()
          || '-';


        if (
          !groupedSeats.has(rowLabel)
        ) {

          groupedSeats.set(
            rowLabel,
            []
          );

        }


        groupedSeats
          .get(rowLabel)!
          .push(seat);
      }


      return Array
        .from(
          groupedSeats.entries()
        )
        .map(
          ([rowLabel, seats]) => ({

            rowLabel,

            seats:
              [...seats].sort(
                (first, second) =>
                  first.columnNumber
                  -
                  second.columnNumber
              )

          })
        )
        .sort(
          (first, second) =>
            first.rowLabel.localeCompare(
              second.rowLabel,
              undefined,
              {
                numeric: true
              }
            )
        );

    });


  readonly availableSeatCount =
    computed(() =>

      this.seats()
        .filter(
          seat =>
            seat.status ===
            SeatStatus.Available
        )
        .length

    );


  ngOnInit(): void {

    const eventIdValue =
      this.route.snapshot
        .paramMap
        .get('eventId');


    const eventId =
      Number(eventIdValue);


    if (
      !eventIdValue ||
      Number.isNaN(eventId) ||
      eventId <= 0
    ) {

      this.isLoading.set(false);

      this.errorMessage.set(
        'Invalid event.'
      );

      return;
    }


    this.loadSeatSelection(
      eventId
    );
  }


  loadSeatSelection(
    eventId: number
  ): void {

    this.isLoading.set(true);

    this.errorMessage.set('');


    forkJoin({

      event:
        this.eventService
          .getById(eventId),

      seats:
        this.seatService
          .getByEvent(
            eventId,
            false
          )

    })
      .pipe(

        finalize(() => {

          this.isLoading.set(false);

        })

      )
      .subscribe({

        next: response => {

          this.event.set(
            response.event
          );


          this.seats.set(
            response.seats
          );


          this.bookingFlow
            .setEvent(
              response.event
            );


          this.syncSelectedSeats(
            response.seats
          );

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.event.set(null);

          this.seats.set([]);

          this.errorMessage.set(
            this.getErrorMessage(
              error
            )
          );

        }

      });
  }


  toggleSeat(
    seat: Seat
  ): void {

    if (
      seat.status !==
      SeatStatus.Available
    ) {

      return;
    }


    this.bookingFlow
      .toggleSeat(seat);
  }


  isSelected(
    seat: Seat
  ): boolean {

    return this.bookingFlow
      .isSeatSelected(
        seat.id
      );
  }


  getSeatPrice(
    seat: Seat
  ): number {

    const currentEvent =
      this.event();


    if (!currentEvent) {

      return 0;

    }


    return (
      seat.priceOverride
      ??
      currentEvent.ticketPrice
    );
  }


  getSeatStatusText(
    seat: Seat
  ): string {

    switch (
      seat.status
    ) {

      case SeatStatus.Available:

        return 'Available';


      case SeatStatus.Held:

        return 'Held';


      case SeatStatus.Booked:

        return 'Booked';


      default:

        return 'Unavailable';
    }
  }


  continueToParking(): void {

    const currentEvent =
      this.event();


    if (
      !currentEvent ||
      !this.bookingFlow
        .hasSelectedSeats()
    ) {

      return;
    }


    this.router.navigate([
      '/customer/events',
      currentEvent.id,
      'parking'
    ]);
  }


  backToEvent(): void {

    const currentEvent =
      this.event();


    if (!currentEvent) {

      this.router.navigate([
        '/events'
      ]);

      return;
    }


    this.router.navigate([
      '/events',
      currentEvent.id
    ]);
  }


  refreshSeats(): void {

    const currentEvent =
      this.event();


    if (!currentEvent) {

      return;
    }


    this.loadSeatSelection(
      currentEvent.id
    );
  }


  private syncSelectedSeats(
    latestSeats: Seat[]
  ): void {

    const oldSelectedIds =
      new Set(
        this.bookingFlow
          .selectedSeatIds()
      );


    if (
      oldSelectedIds.size === 0
    ) {

      return;
    }


    const validSelectedSeats =
      latestSeats.filter(
        seat =>
          oldSelectedIds.has(
            seat.id
          )
          &&
          seat.status ===
          SeatStatus.Available
      );


    this.bookingFlow
      .clearSeats();


    for (
      const seat
      of validSelectedSeats
    ) {

      this.bookingFlow
        .toggleSeat(seat);

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
      error.status === 404
    ) {

      return 'Event or seat information could not be found.';
    }


    const backendMessage =
      error.error?.message;


    if (
      typeof backendMessage ===
      'string'
    ) {

      return backendMessage;
    }


    return 'Unable to load seats. Please try again.';
  }
}