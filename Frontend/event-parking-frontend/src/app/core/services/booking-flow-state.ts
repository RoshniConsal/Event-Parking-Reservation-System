import {
    computed,
    Injectable,
    signal
  } from '@angular/core';
  
  import {
    Event
  } from '../models/event.model';
  
  import {
    Seat
  } from '../models/seat.model';
  
  import {
    ParkingSlot
  } from '../models/parking-slot.model';
  
  import {
    BookingCreateRequest
  } from '../models/booking.model';
  
  
  interface BookingFlowSnapshot {
  
    event: Event | null;
  
    selectedSeats: Seat[];
  
    selectedParkingSlot: ParkingSlot | null;
  }
  
  
  @Injectable({
    providedIn: 'root'
  })
  export class BookingFlowStateService {
  
    private readonly storageKey =
      'venueflow_booking_flow';
  
  
    /* =========================================================
       EVENT
       ========================================================= */
  
    readonly event =
      signal<Event | null>(null);
  
  
    /* =========================================================
       SELECTED SEATS
       ========================================================= */
  
    readonly selectedSeats =
      signal<Seat[]>([]);
  
  
    /* =========================================================
       SELECTED PARKING
       ========================================================= */
  
    readonly selectedParkingSlot =
      signal<ParkingSlot | null>(null);
  
  
    /* =========================================================
       COMPUTED VALUES
       ========================================================= */
  
    readonly selectedSeatIds =
      computed(() =>
  
        this.selectedSeats()
          .map(
            seat => seat.id
          )
  
      );
  
  
    readonly selectedSeatCount =
      computed(() =>
  
        this.selectedSeats().length
  
      );
  
  
    readonly seatTotal =
      computed(() => {
  
        const currentEvent =
          this.event();
  
        if (!currentEvent) {
          return 0;
        }
  
        return this.selectedSeats()
          .reduce(
            (
              total,
              seat
            ) => {
  
              const seatPrice =
                seat.priceOverride
                ??
                currentEvent.ticketPrice;
  
              return total + seatPrice;
  
            },
            0
          );
  
      });
  
  
    readonly parkingTotal =
      computed(() =>
  
        this.selectedParkingSlot()
          ?.fee
        ??
        0
  
      );
  
  
    readonly grandTotal =
      computed(() =>
  
        this.seatTotal()
        +
        this.parkingTotal()
  
      );
  
  
    readonly hasSelectedSeats =
      computed(() =>
  
        this.selectedSeats().length > 0
  
      );
  
  
    readonly hasSelectedParking =
      computed(() =>
  
        this.selectedParkingSlot()
        !== null
  
      );
  
  
    /* =========================================================
       CONSTRUCTOR
       ========================================================= */
  
    constructor() {
  
      this.restoreState();
  
    }
  
  
    /* =========================================================
       SET EVENT
       ========================================================= */
  
    setEvent(
      event: Event
    ): void {
  
      const currentEvent =
        this.event();
  
  
      /*
        User another event-ku pona,
        previous event seat / parking
        selection clear aaganum.
      */
  
      if (
        currentEvent &&
        currentEvent.id !== event.id
      ) {
  
        this.selectedSeats.set([]);
  
        this.selectedParkingSlot.set(null);
  
      }
  
  
      this.event.set(event);
  
      this.saveState();
    }
  
  
    /* =========================================================
       TOGGLE SEAT
       ========================================================= */
  
    toggleSeat(
      seat: Seat
    ): void {
  
      const currentEvent =
        this.event();
  
  
      /*
        Wrong event seat select
        panna allow panna maatom.
      */
  
      if (
        currentEvent &&
        seat.eventId !== currentEvent.id
      ) {
  
        return;
  
      }
  
  
      const currentSeats =
        this.selectedSeats();
  
  
      const alreadySelected =
        currentSeats.some(
          selectedSeat =>
            selectedSeat.id === seat.id
        );
  
  
      if (alreadySelected) {
  
        this.selectedSeats.set(
  
          currentSeats.filter(
            selectedSeat =>
              selectedSeat.id !== seat.id
          )
  
        );
  
      } else {
  
        this.selectedSeats.set([
          ...currentSeats,
          seat
        ]);
  
      }
  
  
      this.saveState();
    }
  
  
    /* =========================================================
       CHECK SEAT SELECTED
       ========================================================= */
  
    isSeatSelected(
      seatId: number
    ): boolean {
  
      return this.selectedSeats()
        .some(
          seat =>
            seat.id === seatId
        );
    }
  
  
    /* =========================================================
       REMOVE ONE SEAT
       ========================================================= */
  
    removeSeat(
      seatId: number
    ): void {
  
      this.selectedSeats.set(
  
        this.selectedSeats()
          .filter(
            seat =>
              seat.id !== seatId
          )
  
      );
  
  
      this.saveState();
    }
  
  
    /* =========================================================
       CLEAR ALL SEATS
       ========================================================= */
  
    clearSeats(): void {
  
      this.selectedSeats.set([]);
  
      this.saveState();
    }
  
  
    /* =========================================================
       SET PARKING SLOT
       ========================================================= */
  
    setParkingSlot(
      slot: ParkingSlot
    ): void {
  
      const currentEvent =
        this.event();
  
  
      /*
        Wrong event parking slot
        select panna allow panna maatom.
      */
  
      if (
        currentEvent &&
        slot.eventId !== currentEvent.id
      ) {
  
        return;
  
      }
  
  
      this.selectedParkingSlot.set(
        slot
      );
  
  
      this.saveState();
    }
  
  
    /* =========================================================
       CLEAR PARKING
       ========================================================= */
  
    clearParking(): void {
  
      this.selectedParkingSlot.set(
        null
      );
  
  
      this.saveState();
    }
  
  
    /* =========================================================
       CREATE BACKEND BOOKING REQUEST
       ========================================================= */
  
    buildBookingRequest():
      BookingCreateRequest | null {
  
      const currentEvent =
        this.event();
  
  
      if (
        !currentEvent ||
        this.selectedSeats().length === 0
      ) {
  
        return null;
  
      }
  
  
      return {
  
        eventId:
          currentEvent.id,
  
        seatIds:
          this.selectedSeatIds(),
  
        parkingSlotId:
          this.selectedParkingSlot()
            ?.id
          ??
          null
  
      };
    }
  
  
    /* =========================================================
       RESET COMPLETE FLOW
       ========================================================= */
  
    reset(): void {
  
      this.event.set(null);
  
      this.selectedSeats.set([]);
  
      this.selectedParkingSlot.set(null);
  
  
      if (
        typeof sessionStorage !==
        'undefined'
      ) {
  
        sessionStorage.removeItem(
          this.storageKey
        );
  
      }
    }
  
  
    /* =========================================================
       SAVE STATE
       ========================================================= */
  
    private saveState(): void {
  
      if (
        typeof sessionStorage ===
        'undefined'
      ) {
  
        return;
  
      }
  
  
      const snapshot:
        BookingFlowSnapshot = {
  
          event:
            this.event(),
  
          selectedSeats:
            this.selectedSeats(),
  
          selectedParkingSlot:
            this.selectedParkingSlot()
  
        };
  
  
      sessionStorage.setItem(
  
        this.storageKey,
  
        JSON.stringify(snapshot)
  
      );
    }
  
  
    /* =========================================================
       RESTORE STATE
       ========================================================= */
  
    private restoreState(): void {
  
      if (
        typeof sessionStorage ===
        'undefined'
      ) {
  
        return;
  
      }
  
  
      const storedValue =
        sessionStorage.getItem(
          this.storageKey
        );
  
  
      if (!storedValue) {
  
        return;
  
      }
  
  
      try {
  
        const snapshot =
          JSON.parse(
            storedValue
          ) as BookingFlowSnapshot;
  
  
        this.event.set(
          snapshot.event ?? null
        );
  
  
        this.selectedSeats.set(
          Array.isArray(
            snapshot.selectedSeats
          )
            ? snapshot.selectedSeats
            : []
        );
  
  
        this.selectedParkingSlot.set(
          snapshot.selectedParkingSlot
          ??
          null
        );
  
      } catch {
  
        sessionStorage.removeItem(
          this.storageKey
        );
  
      }
    }
  }