export interface Event {
  id: number;
  name: string;
  description: string | null;
  venueId: number;
  venueName: string;
  categoryId: number;
  categoryName: string;
  startDateTime: string;
  endDateTime: string;
  ticketPrice: number;
  parkingFee: number;
  capacity: number;
}

export interface EventCreateRequest {
  name: string;
  description: string | null;
  venueId: number;
  categoryId: number;
  startDateTime: string;
  endDateTime: string;
  ticketPrice: number;
  parkingFee: number;
  capacity: number;
}

export interface EventUpdateRequest {
  name: string;
  description: string | null;
  venueId: number;
  categoryId: number;
  startDateTime: string;
  endDateTime: string;
  ticketPrice: number;
  parkingFee: number;
  capacity: number;
}