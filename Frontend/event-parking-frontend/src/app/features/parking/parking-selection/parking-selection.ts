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

import {
  BookingFlowStateService
} from '../../../core/services/booking-flow-state';


interface ParkingZoneGroup {
  zone: string;
  slots: ParkingSlot[];
}


@Component({
  selector: 'app-parking-selection',

  imports: [
    DatePipe,
    DecimalPipe
  ],

  templateUrl:
    './parking-selection.html',

  styleUrl:
    './parking-selection.css'
})
export class ParkingSelection
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly eventService =
    inject(EventService);

  private readonly parkingService =
    inject(ParkingService);


  readonly bookingFlow =
    inject(BookingFlowStateService);


  readonly event =
    signal<Event | null>(null);

  readonly parkingSlots =
    signal<ParkingSlot[]>([]);

  readonly isLoading =
    signal(true);

  readonly errorMessage =
    signal('');


  readonly ParkingSlotStatus =
    ParkingSlotStatus;


  /* =========================================================
     AVAILABLE COUNT
     ========================================================= */

  readonly availableParkingCount =
    computed(() =>

      this.parkingSlots()
        .filter(
          slot =>
            slot.status ===
            ParkingSlotStatus.Available
        )
        .length

    );


  /* =========================================================
     GROUP BY ZONE
     ========================================================= */

  readonly parkingZones =
    computed<ParkingZoneGroup[]>(() => {

      const groups =
        new Map<
          string,
          ParkingSlot[]
        >();


      for (
        const slot
        of this.parkingSlots()
      ) {

        const zone =
          slot.zone?.trim()
          || 'General';


        if (
          !groups.has(zone)
        ) {

          groups.set(
            zone,
            []
          );

        }


        groups
          .get(zone)!
          .push(slot);
      }


      return Array
        .from(
          groups.entries()
        )
        .map(
          ([zone, slots]) => ({

            zone,

            slots:
              [...slots].sort(
                (
                  first,
                  second
                ) =>

                  first.slotNumber
                    .localeCompare(
                      second.slotNumber,
                      undefined,
                      {
                        numeric: true
                      }
                    )

              )

          })
        )
        .sort(
          (
            first,
            second
          ) =>

            first.zone
              .localeCompare(
                second.zone,
                undefined,
                {
                  numeric: true
                }
              )
        );

    });


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


    this.loadParking(
      eventId
    );
  }


  /* =========================================================
     LOAD EVENT + PARKING
     ========================================================= */

  loadParking(
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


          /*
            Booking flow event
            synchronize pannuvom.
          */

          this.bookingFlow
            .setEvent(
              response.event
            );


          /*
            Seat selection illama
            parking page-ku direct
            varakoodathu.
          */

          if (
            !this.bookingFlow
              .hasSelectedSeats()
          ) {

            this.router.navigate([
              '/customer/events',
              response.event.id,
              'seats'
            ]);

            return;
          }


          this.syncSelectedParking(
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
     SELECT PARKING
     ========================================================= */

  selectParking(
    slot: ParkingSlot
  ): void {

    if (
      slot.status !==
      ParkingSlotStatus.Available
    ) {

      return;
    }


    const selectedSlot =
      this.bookingFlow
        .selectedParkingSlot();


    /*
      Same slot again click panna
      unselect.
    */

    if (
      selectedSlot?.id ===
      slot.id
    ) {

      this.bookingFlow
        .clearParking();

      return;
    }


    this.bookingFlow
      .setParkingSlot(
        slot
      );
  }


  /* =========================================================
     CHECK SELECTED
     ========================================================= */

  isSelected(
    slot: ParkingSlot
  ): boolean {

    return (
      this.bookingFlow
        .selectedParkingSlot()
        ?.id
      ===
      slot.id
    );
  }


  /* =========================================================
     STATUS TEXT
     ========================================================= */

  getStatusText(
    slot: ParkingSlot
  ): string {

    switch (
      slot.status
    ) {

      case ParkingSlotStatus.Available:

        return 'Available';


      case ParkingSlotStatus.Held:

        return 'Held';


      case ParkingSlotStatus.Booked:

        return 'Booked';


      case ParkingSlotStatus.Unavailable:

        return 'Unavailable';


      default:

        return 'Unavailable';
    }
  }


  /* =========================================================
     BACK TO SEATS
     ========================================================= */

  backToSeats(): void {

    const currentEvent =
      this.event();


    if (!currentEvent) {

      return;
    }


    this.router.navigate([
      '/customer/events',
      currentEvent.id,
      'seats'
    ]);
  }


  /* =========================================================
     CONTINUE CHECKOUT
     ========================================================= */

  continueToCheckout(): void {

    if (
      !this.bookingFlow
        .hasSelectedSeats()
    ) {

      return;
    }


    this.router.navigate([
      '/customer/checkout'
    ]);
  }


  /* =========================================================
     SKIP PARKING
     ========================================================= */

  skipParking(): void {

    this.bookingFlow
      .clearParking();


    this.continueToCheckout();
  }


  /* =========================================================
     REFRESH
     ========================================================= */

  refreshParking(): void {

    const currentEvent =
      this.event();


    if (!currentEvent) {

      return;
    }


    this.loadParking(
      currentEvent.id
    );
  }


  /* =========================================================
     SYNC EXISTING PARKING
     ========================================================= */

  private syncSelectedParking(
    latestSlots: ParkingSlot[]
  ): void {

    const selectedSlot =
      this.bookingFlow
        .selectedParkingSlot();


    if (!selectedSlot) {

      return;
    }


    const latestSelectedSlot =
      latestSlots.find(
        slot =>
          slot.id ===
          selectedSlot.id
      );


    /*
      Selected slot backend-la
      available illana remove.
    */

    if (
      !latestSelectedSlot ||
      latestSelectedSlot.status !==
      ParkingSlotStatus.Available
    ) {

      this.bookingFlow
        .clearParking();

      return;
    }


    /*
      Latest backend values
      replace pannuvom.
    */

    this.bookingFlow
      .setParkingSlot(
        latestSelectedSlot
      );
  }


  /* =========================================================
     ERROR
     ========================================================= */

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

      return 'Event or parking information could not be found.';
    }


    const backendMessage =
      error.error?.message;


    if (
      typeof backendMessage ===
      'string'
    ) {

      return backendMessage;
    }


    return 'Unable to load parking slots. Please try again.';
  }
}