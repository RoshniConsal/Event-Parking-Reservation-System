import { SeatStatus } from './enums/seat-status.enum';

export interface Seat {
  id: number;
  eventId: number;
  seatNumber: string;
  rowLabel: string;
  columnNumber: number;
  seatType: string | null;
  priceOverride: number | null;
  status: SeatStatus;
}

export interface SeatCreateRequest {
  seatNumber: string;
  rowLabel: string;
  columnNumber: number;
  seatType: string | null;
  priceOverride: number | null;
}

export interface SeatUpdateRequest {
  seatNumber: string;
  rowLabel: string;
  columnNumber: number;
  seatType: string | null;
  priceOverride: number | null;
}

export interface GenerateSeatMapResponse {
  message: string;
  totalSeats: number;
  seats: Seat[];
}