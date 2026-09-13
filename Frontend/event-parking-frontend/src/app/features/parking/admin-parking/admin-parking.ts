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
  ParkingSlot
} from '../../../core/models/parking-slot.model';

import {
  ParkingSlotStatus
} from '../../../core/models/enums/parking-slot-status.enum';

import {
  EventService
} from '../../../core/services/event';

import {
  ParkingService
} from '../../../core/services/parking';


@Component({
  selector: 'app-admin-parking',

  imports: [
    FormsModule,
    DatePipe,
    DecimalPipe
  ],

  templateUrl:
    './admin-parking.html',

  styleUrl:
    './admin-parking.css'
})
export class AdminParking
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly eventService =
    inject(EventService);

  private readonly parkingService =
    inject(ParkingService);


  readonly event =
    signal<Event | null>(null);

  readonly parkingSlots =
    signal<ParkingSlot[]>([]);

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

  readonly editingSlotId =
    signal<number | null>(null);


  readonly ParkingSlotStatus =
    ParkingSlotStatus;


  /* =========================================================
     CREATE FORM
     ========================================================= */

  createSlotNumber = '';

  createZone = '';

  createFee:
    number | null = null;


  /* =========================================================
     EDIT FORM
     ========================================================= */

  editSlotNumber = '';

  editZone = '';

  editFee:
    number | null = null;

  editStatus:
    ParkingSlotStatus =
      ParkingSlotStatus.Available;


  /* =========================================================
     COUNTS
     ========================================================= */

  readonly totalCount =
    computed(() =>
      this.parkingSlots().length
    );


  readonly availableCount =
    computed(() =>

      this.parkingSlots()
        .filter(
          slot =>
            slot.status ===
            ParkingSlotStatus.Available
        )
        .length

    );


  readonly heldCount =
    computed(() =>

      this.parkingSlots()
        .filter(
          slot =>
            slot.status ===
            ParkingSlotStatus.Held
        )
        .length

    );


  readonly bookedCount =
    computed(() =>

      this.parkingSlots()
        .filter(
          slot =>
            slot.status ===
            ParkingSlotStatus.Booked
        )
        .length

    );


  readonly unavailableCount =
    computed(() =>

      this.parkingSlots()
        .filter(
          slot =>
            slot.status ===
            ParkingSlotStatus.Unavailable
        )
        .length

    );


  readonly sortedSlots =
    computed(() => {

      return [
        ...this.parkingSlots()
      ].sort(
        (
          first,
          second
        ) => {

          const zoneCompare =
            first.zone.localeCompare(
              second.zone,
              undefined,
              {
                numeric: true
              }
            );


          if (
            zoneCompare !== 0
          ) {

            return zoneCompare;

          }


          return first.slotNumber
            .localeCompare(
              second.slotNumber,
              undefined,
              {
                numeric: true
              }
            );

        }
      );

    });


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
     LOAD EVENT + PARKING
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

      parkingSlots:
        this.parkingService
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

          this.parkingSlots.set(
            response.parkingSlots
          );

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.event.set(null);

          this.parkingSlots.set([]);

          this.errorMessage.set(
            this.getErrorMessage(
              error
            )
          );

        }

      });
  }


  /* =========================================================
     CREATE FORM
     ========================================================= */

  openCreateForm(): void {

    this.editingSlotId.set(
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
     CREATE SLOT
     ========================================================= */

  createParkingSlot(): void {

    const currentEvent =
      this.event();

    const fee =
      this.createFee;


    if (!currentEvent) {

      return;
    }


    if (
      !this.createSlotNumber.trim()
      ||
      !this.createZone.trim()
      ||
      fee === null
      ||
      fee < 0
    ) {

      this.errorMessage.set(
        'Slot number, zone and a valid fee are required.'
      );

      return;
    }


    this.isSaving.set(true);

    this.clearMessages();


    this.parkingService
      .create(
        currentEvent.id,
        {

          slotNumber:
            this.createSlotNumber
              .trim(),

          zone:
            this.createZone
              .trim(),

          fee

        }
      )
      .pipe(

        finalize(() => {

          this.isSaving.set(false);

        })

      )
      .subscribe({

        next: createdSlot => {

          this.parkingSlots.update(
            current => [
              ...current,
              createdSlot
            ]
          );


          this.successMessage.set(
            `Parking slot ${createdSlot.slotNumber} created successfully.`
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
     EDIT
     ========================================================= */

  startEdit(
    slot: ParkingSlot
  ): void {

    this.showCreateForm.set(
      false
    );


    this.editingSlotId.set(
      slot.id
    );


    this.editSlotNumber =
      slot.slotNumber;

    this.editZone =
      slot.zone;

    this.editFee =
      slot.fee;

    this.editStatus =
      slot.status;


    this.clearMessages();
  }


  cancelEdit(): void {

    this.editingSlotId.set(
      null
    );
  }


  saveEdit(): void {

    const slotId =
      this.editingSlotId();

    const fee =
      this.editFee;


    if (!slotId) {

      return;
    }


    if (
      !this.editSlotNumber.trim()
      ||
      !this.editZone.trim()
      ||
      fee === null
      ||
      fee < 0
    ) {

      this.errorMessage.set(
        'Slot number, zone and a valid fee are required.'
      );

      return;
    }


    this.isSaving.set(true);

    this.clearMessages();


    this.parkingService
      .update(
        slotId,
        {

          slotNumber:
            this.editSlotNumber
              .trim(),

          zone:
            this.editZone
              .trim(),

          fee,

          status:
            this.editStatus

        }
      )
      .pipe(

        finalize(() => {

          this.isSaving.set(false);

        })

      )
      .subscribe({

        next: updatedSlot => {

          this.parkingSlots.update(
            current =>
              current.map(
                slot =>
                  slot.id ===
                  updatedSlot.id
                    ?
                    updatedSlot
                    :
                    slot
              )
          );


          this.editingSlotId.set(
            null
          );


          this.successMessage.set(
            `Parking slot ${updatedSlot.slotNumber} updated successfully.`
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

  deleteParkingSlot(
    slot: ParkingSlot
  ): void {

    if (
      slot.status ===
        ParkingSlotStatus.Booked
      ||
      slot.status ===
        ParkingSlotStatus.Held
    ) {

      this.errorMessage.set(
        'Booked or held parking slots cannot be deleted.'
      );

      return;
    }


    const confirmed =
      window.confirm(
        `Delete parking slot ${slot.slotNumber}?`
      );


    if (!confirmed) {

      return;
    }


    this.isSaving.set(true);

    this.clearMessages();


    this.parkingService
      .delete(
        slot.id
      )
      .pipe(

        finalize(() => {

          this.isSaving.set(false);

        })

      )
      .subscribe({

        next: () => {

          this.parkingSlots.update(
            current =>
              current.filter(
                currentSlot =>
                  currentSlot.id !==
                  slot.id
              )
          );


          this.successMessage.set(
            `Parking slot ${slot.slotNumber} deleted successfully.`
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
    status: ParkingSlotStatus
  ): string {

    switch (status) {

      case ParkingSlotStatus.Available:

        return 'Available';


      case ParkingSlotStatus.Held:

        return 'Held';


      case ParkingSlotStatus.Booked:

        return 'Booked';


      case ParkingSlotStatus.Unavailable:

        return 'Unavailable';


      default:

        return 'Unknown';

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

    this.createSlotNumber = '';

    this.createZone = '';

    this.createFee = null;
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

      return 'The parking slot information is invalid.';
    }


    if (
      error.status === 404
    ) {

      return 'Event or parking slot could not be found.';
    }


    if (
      error.status === 409
    ) {

      return 'A parking slot with this number may already exist.';
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


    return 'Unable to complete the parking operation.';
  }
}