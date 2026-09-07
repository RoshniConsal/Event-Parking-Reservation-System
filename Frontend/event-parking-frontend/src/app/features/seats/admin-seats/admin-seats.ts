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
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
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


@Component({
  selector: 'app-admin-seats',

  imports: [
    FormsModule,
    DatePipe,
    DecimalPipe
  ],

  templateUrl:
    './admin-seats.html',

  styleUrl:
    './admin-seats.css'
})
export class AdminSeats
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly eventService =
    inject(EventService);

  private readonly seatService =
    inject(SeatService);


  readonly event =
    signal<Event | null>(null);

  readonly seats =
    signal<Seat[]>([]);

  readonly isLoading =
    signal(true);

  readonly isSaving =
    signal(false);

  readonly errorMessage =
    signal('');

  readonly successMessage =
    signal('');


  readonly showCreateForm =
    signal(false);

  readonly showGenerateForm =
    signal(false);

  readonly editingSeatId =
    signal<number | null>(null);


  readonly SeatStatus =
    SeatStatus;


  /* =========================================================
     CREATE FORM
     ========================================================= */

  createSeatNumber = '';

  createRowLabel = '';

  createColumnNumber:
    number | null = null;

  createSeatType = 'Regular';

  createPriceOverride:
    number | null = null;


  /* =========================================================
     GENERATE FORM
     ========================================================= */

  generateRows = 10;

  generateSeatsPerRow = 10;

  generateSeatType = 'Regular';

  generatePriceOverride:
    number | null = null;


  /* =========================================================
     EDIT FORM
     ========================================================= */

  editSeatNumber = '';

  editRowLabel = '';

  editColumnNumber:
    number | null = null;

  editSeatType = '';

  editPriceOverride:
    number | null = null;


  /* =========================================================
     COMPUTED
     ========================================================= */

  readonly sortedSeats =
    computed(() => {

      return [
        ...this.seats()
      ].sort(
        (
          first,
          second
        ) => {

          const rowCompare =
            first.rowLabel
              .localeCompare(
                second.rowLabel,
                undefined,
                {
                  numeric: true
                }
              );


          if (
            rowCompare !== 0
          ) {

            return rowCompare;

          }


          return (
            first.columnNumber
            -
            second.columnNumber
          );

        }
      );

    });


  readonly availableCount =
    computed(() =>

      this.seats()
        .filter(
          seat =>
            seat.status ===
            SeatStatus.Available
        )
        .length

    );


  readonly heldCount =
    computed(() =>

      this.seats()
        .filter(
          seat =>
            seat.status ===
            SeatStatus.Held
        )
        .length

    );


  readonly bookedCount =
    computed(() =>

      this.seats()
        .filter(
          seat =>
            seat.status ===
            SeatStatus.Booked
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
        .get('eventId');


    const eventId =
      Number(
        eventIdValue
      );


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


    this.loadData(
      eventId
    );
  }


  /* =========================================================
     LOAD
     ========================================================= */

  loadData(
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


  /* =========================================================
     OPEN CREATE
     ========================================================= */

  openCreateForm(): void {

    this.showGenerateForm.set(
      false
    );

    this.editingSeatId.set(
      null
    );

    this.resetCreateForm();

    this.showCreateForm.set(
      true
    );

    this.clearMessages();
  }


  closeCreateForm(): void {

    this.showCreateForm.set(
      false
    );
  }


  /* =========================================================
     CREATE SINGLE SEAT
     ========================================================= */

  createSeat(): void {

    const currentEvent =
      this.event();


    if (!currentEvent) {

      return;
    }


    if (
      !this.createSeatNumber.trim()
      ||
      !this.createRowLabel.trim()
      ||
      this.createColumnNumber ===
        null
      ||
      this.createColumnNumber <= 0
    ) {

      this.errorMessage.set(
        'Seat number, row label and a valid column number are required.'
      );

      return;
    }


    this.isSaving.set(true);

    this.clearMessages();


    this.seatService
      .create(
        currentEvent.id,
        {

          seatNumber:
            this.createSeatNumber
              .trim(),

          rowLabel:
            this.createRowLabel
              .trim(),

          columnNumber:
            this.createColumnNumber,

          seatType:
            this.createSeatType
              .trim()
            || null,

          priceOverride:
            this.createPriceOverride

        }
      )
      .pipe(

        finalize(() => {

          this.isSaving.set(false);

        })

      )
      .subscribe({

        next: createdSeat => {

          this.seats.update(
            current => [
              ...current,
              createdSeat
            ]
          );


          this.successMessage.set(
            `Seat ${createdSeat.seatNumber} created successfully.`
          );


          this.showCreateForm.set(
            false
          );


          this.resetCreateForm();

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.errorMessage.set(
            this.getErrorMessage(
              error
            )
          );

        }

      });
  }


  /* =========================================================
     GENERATE FORM
     ========================================================= */

  openGenerateForm(): void {

    this.showCreateForm.set(
      false
    );

    this.editingSeatId.set(
      null
    );

    this.showGenerateForm.set(
      true
    );

    this.clearMessages();
  }


  closeGenerateForm(): void {

    this.showGenerateForm.set(
      false
    );
  }


  /* =========================================================
     GENERATE SEAT MAP
     ========================================================= */

  generateSeatMap(): void {

    const currentEvent =
      this.event();


    if (!currentEvent) {

      return;
    }


    if (
      this.generateRows <= 0
      ||
      this.generateSeatsPerRow <= 0
    ) {

      this.errorMessage.set(
        'Rows and seats per row must be greater than zero.'
      );

      return;
    }


    if (
      this.seats().length > 0
    ) {

      const confirmed =
        window.confirm(
          'This event already has seats. Generating another map may create duplicate seats and the backend may reject it. Continue?'
        );


      if (!confirmed) {

        return;

      }
    }


    this.isSaving.set(true);

    this.clearMessages();


    this.seatService
      .generateSeatMap(
        currentEvent.id,
        this.generateRows,
        this.generateSeatsPerRow,
        this.generateSeatType
          .trim()
        || null,
        this.generatePriceOverride
      )
      .pipe(

        finalize(() => {

          this.isSaving.set(false);

        })

      )
      .subscribe({

        next: response => {

          this.seats.set(
            response.seats
          );


          this.successMessage.set(
            response.message
            ||
            `${response.totalSeats} seats generated successfully.`
          );


          this.showGenerateForm.set(
            false
          );

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.errorMessage.set(
            this.getErrorMessage(
              error
            )
          );

        }

      });
  }


  /* =========================================================
     EDIT
     ========================================================= */

  startEdit(
    seat: Seat
  ): void {

    this.showCreateForm.set(
      false
    );

    this.showGenerateForm.set(
      false
    );

    this.editingSeatId.set(
      seat.id
    );


    this.editSeatNumber =
      seat.seatNumber;

    this.editRowLabel =
      seat.rowLabel;

    this.editColumnNumber =
      seat.columnNumber;

    this.editSeatType =
      seat.seatType
      || '';

    this.editPriceOverride =
      seat.priceOverride;


    this.clearMessages();
  }


  cancelEdit(): void {

    this.editingSeatId.set(
      null
    );
  }


  saveEdit(): void {

    const seatId =
      this.editingSeatId();


    if (!seatId) {

      return;
    }


    if (
      !this.editSeatNumber.trim()
      ||
      !this.editRowLabel.trim()
      ||
      this.editColumnNumber ===
        null
      ||
      this.editColumnNumber <= 0
    ) {

      this.errorMessage.set(
        'Seat number, row label and a valid column number are required.'
      );

      return;
    }


    this.isSaving.set(true);

    this.clearMessages();


    this.seatService
      .update(
        seatId,
        {

          seatNumber:
            this.editSeatNumber
              .trim(),

          rowLabel:
            this.editRowLabel
              .trim(),

          columnNumber:
            this.editColumnNumber,

          seatType:
            this.editSeatType
              .trim()
            || null,

          priceOverride:
            this.editPriceOverride

        }
      )
      .pipe(

        finalize(() => {

          this.isSaving.set(false);

        })

      )
      .subscribe({

        next: updatedSeat => {

          this.seats.update(
            current =>
              current.map(
                seat =>
                  seat.id ===
                  updatedSeat.id
                    ?
                    updatedSeat
                    :
                    seat
              )
          );


          this.editingSeatId.set(
            null
          );


          this.successMessage.set(
            `Seat ${updatedSeat.seatNumber} updated successfully.`
          );

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.errorMessage.set(
            this.getErrorMessage(
              error
            )
          );

        }

      });
  }


  /* =========================================================
     DELETE
     ========================================================= */

  deleteSeat(
    seat: Seat
  ): void {

    if (
      seat.status !==
      SeatStatus.Available
    ) {

      this.errorMessage.set(
        'Only available seats can be deleted from this screen.'
      );

      return;
    }


    const confirmed =
      window.confirm(
        `Delete seat ${seat.seatNumber}?`
      );


    if (!confirmed) {

      return;

    }


    this.isSaving.set(true);

    this.clearMessages();


    this.seatService
      .delete(
        seat.id
      )
      .pipe(

        finalize(() => {

          this.isSaving.set(false);

        })

      )
      .subscribe({

        next: () => {

          this.seats.update(
            current =>
              current.filter(
                currentSeat =>
                  currentSeat.id !==
                  seat.id
              )
          );


          this.successMessage.set(
            `Seat ${seat.seatNumber} deleted successfully.`
          );

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.errorMessage.set(
            this.getErrorMessage(
              error
            )
          );

        }

      });
  }


  /* =========================================================
     STATUS
     ========================================================= */

  getStatusText(
    status: SeatStatus
  ): string {

    switch (status) {

      case SeatStatus.Available:

        return 'Available';


      case SeatStatus.Held:

        return 'Held';


      case SeatStatus.Booked:

        return 'Booked';


      default:

        return 'Unknown';

    }
  }


  getStatusClass(
    status: SeatStatus
  ): string {

    switch (status) {

      case SeatStatus.Available:

        return 'available';


      case SeatStatus.Held:

        return 'held';


      case SeatStatus.Booked:

        return 'booked';


      default:

        return '';

    }
  }


  /* =========================================================
     NAVIGATION
     ========================================================= */

  backToEvents(): void {

    this.router.navigate([
      '/admin/events'
    ]);
  }


  refresh(): void {

    const currentEvent =
      this.event();


    if (!currentEvent) {

      return;

    }


    this.loadData(
      currentEvent.id
    );
  }


  /* =========================================================
     HELPERS
     ========================================================= */

  private resetCreateForm(): void {

    this.createSeatNumber = '';

    this.createRowLabel = '';

    this.createColumnNumber = null;

    this.createSeatType =
      'Regular';

    this.createPriceOverride =
      null;
  }


  private clearMessages(): void {

    this.errorMessage.set('');

    this.successMessage.set('');
  }


  private getErrorMessage(
    error: HttpErrorResponse
  ): string {

    if (
      error.status === 0
    ) {

      return 'Unable to connect to the VenueFlow server.';
    }


    const backendMessage =
      error.error?.message;


    if (
      typeof backendMessage ===
      'string'
    ) {

      return backendMessage;
    }


    if (
      error.status === 400
    ) {

      return 'The seat information is invalid.';
    }


    if (
      error.status === 404
    ) {

      return 'Event or seat could not be found.';
    }


    if (
      error.status === 409
    ) {

      return 'A seat with the same number or position may already exist.';
    }


    if (
      error.status === 401
    ) {

      return 'Your login session has expired.';
    }


    if (
      error.status === 403
    ) {

      return 'Administrator access is required.';
    }


    return 'Unable to complete the seat operation.';
  }
}