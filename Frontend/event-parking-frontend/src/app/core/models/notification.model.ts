import { NotificationType } from './enums/notification-type.enum';

export interface Notification {
  id: number;
  customerId: number;

  bookingId: number | null;
  eventId: number | null;

  type: NotificationType;

  title: string;
  message: string;

  isRead: boolean;
  createdAt: string;
}