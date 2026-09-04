export interface Venue {
  id: number;
  name: string;
  address: string;
  capacity: number;
}

export interface VenueCreateRequest {
  name: string;
  address: string;
  capacity: number;
}

export interface VenueUpdateRequest {
  name: string;
  address: string;
  capacity: number;
}

export interface VenueAvailability {
  venueId: number;
  venueName: string;
  startDateTime: string;
  endDateTime: string;
  isAvailable: boolean;
}