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

} from '@angular/router';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  finalize,
  forkJoin
} from 'rxjs';

import {
  Event,
  SeatLayoutType
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

interface PositionedSeat {
  seat: Seat;
  x: number;
  y: number;
}


@Component({
  selector: 'app-seat-selection',

  imports: [
    DatePipe,
    DecimalPipe,

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


  /* =========================================================
     SAVED EVENT LAYOUT
     ========================================================= */

  readonly layoutType =
    computed<SeatLayoutType>(() => {

      return (
        this.event()
          ?.seatLayoutType
        ||
        'Theatre'
      );
    });


  /* =========================================================
     GROUP SEATS BY ROW
     ========================================================= */

  readonly seatRows =
    computed<SeatRow[]>(() => {

      const groupedSeats =
        new Map<
          string,
          Seat[]
        >();


      for (
        const seat of
        this.seats()
      ) {

        const rowLabel =
          seat.rowLabel
            ?.trim()
          ||
          '-';


        if (
          !groupedSeats.has(
            rowLabel
          )
        ) {

          groupedSeats.set(
            rowLabel,
            []
          );
        }


        groupedSeats
          .get(
            rowLabel
          )!
          .push(
            seat
          );
      }


      return Array
        .from(
          groupedSeats.entries()
        )
        .map(
          (
            [
              rowLabel,
              rowSeats
            ]
          ) => ({

            rowLabel,

            seats:
              [
                ...rowSeats
              ].sort(
                (
                  first,
                  second
                ) =>
                  first.columnNumber
                  -
                  second.columnNumber
              )

          })
        )
        .sort(
          (
            first,
            second
          ) =>
            first.rowLabel
              .localeCompare(
                second.rowLabel,
                undefined,
                {
                  numeric: true
                }
              )
        );
    });


  /* =========================================================
     STADIUM POSITIONS
     ========================================================= */

  readonly stadiumSeatPositions =
    computed<PositionedSeat[]>(() => {

      const rows =
        this.seatRows();

      const positions:
        PositionedSeat[] = [];


      if (
        rows.length === 0
      ) {

        return positions;
      }


      const splitIndex =
        Math.ceil(
          rows.length / 2
        );


      const topRows =
        rows.slice(
          0,
          splitIndex
        );


      const bottomRows =
        rows.slice(
          splitIndex
        );


      /*
        TOP STANDS
      */

      topRows.forEach(
        (
          row,
          rowIndex
        ) => {

          const rowProgress =
            topRows.length <= 1
              ? 0
              : rowIndex /
                (
                  topRows.length
                  -
                  1
                );


          const radiusX =
            46
            -
            rowProgress * 11;


          const radiusY =
            42
            -
            rowProgress * 17;


          row.seats.forEach(
            (
              seat,
              seatIndex
            ) => {

              const progress =
                row.seats.length <= 1
                  ? 0.5
                  : seatIndex /
                    (
                      row.seats.length
                      -
                      1
                    );


              const angle =
                202
                +
                progress * 136;


              const radians =
                angle
                *
                Math.PI
                /
                180;


              positions.push({

                seat,

                x:
                  50
                  +
                  radiusX
                  *
                  Math.cos(
                    radians
                  ),

                y:
                  50
                  +
                  radiusY
                  *
                  Math.sin(
                    radians
                  )
              });
            }
          );
        }
      );


      /*
        BOTTOM STANDS
      */

      bottomRows.forEach(
        (
          row,
          rowIndex
        ) => {

          const rowProgress =
            bottomRows.length <= 1
              ? 0
              : rowIndex /
                (
                  bottomRows.length
                  -
                  1
                );


          const radiusX =
            35
            +
            rowProgress * 11;


          const radiusY =
            25
            +
            rowProgress * 17;


          row.seats.forEach(
            (
              seat,
              seatIndex
            ) => {

              const progress =
                row.seats.length <= 1
                  ? 0.5
                  : seatIndex /
                    (
                      row.seats.length
                      -
                      1
                    );


              const angle =
                22
                +
                progress * 136;


              const radians =
                angle
                *
                Math.PI
                /
                180;


              positions.push({

                seat,

                x:
                  50
                  +
                  radiusX
                  *
                  Math.cos(
                    radians
                  ),

                y:
                  50
                  +
                  radiusY
                  *
                  Math.sin(
                    radians
                  )
              });
            }
          );
        }
      );


      return positions;
    });


  /* =========================================================
     ARENA POSITIONS
     ========================================================= */

  readonly arenaSeatPositions =
    computed<PositionedSeat[]>(() => {

      const rows =
        this.seatRows();

      const positions:
        PositionedSeat[] = [];


      if (
        rows.length === 0
      ) {

        return positions;
      }


      rows.forEach(
        (
          row,
          rowIndex
        ) => {

          const progress =
            rows.length <= 1
              ? 0
              : rowIndex /
                (
                  rows.length
                  -
                  1
                );


          /*
            A = inner ring
            Last row = outer ring
          */

          const radiusX =
            15
            +
            progress * 31;


          const radiusY =
            15
            +
            progress * 31;


          row.seats.forEach(
            (
              seat,
              seatIndex
            ) => {

              const count =
                Math.max(
                  row.seats.length,
                  1
                );


              const angle =
                -90
                +
                (
                  360 /
                  count
                )
                *
                seatIndex;


              const radians =
                angle
                *
                Math.PI
                /
                180;


              positions.push({

                seat,

                x:
                  50
                  +
                  radiusX
                  *
                  Math.cos(
                    radians
                  ),

                y:
                  50
                  +
                  radiusY
                  *
                  Math.sin(
                    radians
                  )
              });
            }
          );
        }
      );


      return positions;
    });


  /* =========================================================
     COUNTS
     ========================================================= */

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


  /* =========================================================
     INIT
     ========================================================= */

  ngOnInit(): void {

    const eventIdValue =
      this.route.snapshot
        .paramMap
        .get(
          'eventId'
        );


    const eventId =
      Number(
        eventIdValue
      );


    if (
      !eventIdValue
      ||
      Number.isNaN(
        eventId
      )
      ||
      eventId <= 0
    ) {

      this.isLoading.set(
        false
      );

      this.errorMessage.set(
        'Invalid event.'
      );

      return;
    }


    this.loadSeatSelection(
      eventId
    );
  }


  /* =========================================================
     LOAD
     ========================================================= */

  loadSeatSelection(
    eventId: number
  ): void {

    this.isLoading.set(
      true
    );

    this.errorMessage.set(
      ''
    );


    forkJoin({

      event:
        this.eventService
          .getById(
            eventId
          ),

      seats:
        this.seatService
          .getByEvent(
            eventId,
            false
          )

    })
      .pipe(

        finalize(() => {

          this.isLoading.set(
            false
          );

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
          error:
            HttpErrorResponse
        ) => {

          this.event.set(
            null
          );

          this.seats.set(
            []
          );


          this.errorMessage.set(
            this.getErrorMessage(
              error
            )
          );

        }

      });
  }


  /* =========================================================
     SELECT SEAT
     ========================================================= */

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
      .toggleSeat(
        seat
      );
  }


  isSelected(
    seat: Seat
  ): boolean {

    return this.bookingFlow
      .isSeatSelected(
        seat.id
      );
  }


  /* =========================================================
     PRICE
     ========================================================= */

  getSeatPrice(
    seat: Seat
  ): number {

    const currentEvent =
      this.event();


    if (
      !currentEvent
    ) {

      return 0;
    }


    return (
      seat.priceOverride
      ??
      currentEvent.ticketPrice
    );
  }


  /* =========================================================
     STATUS
     ========================================================= */

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


  /* =========================================================
     CONTINUE
     ========================================================= */

  continueToParking(): void {

    const currentEvent =
      this.event();


    if (
      !currentEvent
      ||
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


  /* =========================================================
     BACK
     ========================================================= */

  backToEvent(): void {

    const currentEvent =
      this.event();


    if (
      !currentEvent
    ) {

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


  /* =========================================================
     REFRESH
     ========================================================= */

  refreshSeats(): void {

    const currentEvent =
      this.event();


    if (
      !currentEvent
    ) {

      return;
    }


    this.loadSeatSelection(
      currentEvent.id
    );
  }


  /* =========================================================
     SYNC SELECTED
     ========================================================= */

  private syncSelectedSeats(
    latestSeats:
      Seat[]
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
      const seat of
      validSelectedSeats
    ) {

      this.bookingFlow
        .toggleSeat(
          seat
        );
    }
  }


  /* =========================================================
     ERROR
     ========================================================= */

  private getErrorMessage(
    error:
      HttpErrorResponse
  ): string {

    if (
      error.status === 0
    ) {

      return 'Unable to connect to the EventiGo server. Please make sure the backend API is running.';
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