import { ParkingSlotStatus } from './enums/parking-slot-status.enum';

export interface ParkingSlot {
  id: number;
  eventId: number;
  slotNumber: string;
  zone: string;
  fee: number;
  status: ParkingSlotStatus;
}

export interface ParkingSlotCreateRequest {
  slotNumber: string;
  zone: string;
  fee: number;
}

export interface ParkingSlotUpdateRequest {
  slotNumber: string;
  zone: string;
  fee: number;
  status: ParkingSlotStatus;
}