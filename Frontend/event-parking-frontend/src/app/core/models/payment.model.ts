import { PaymentMethod } from './enums/payment-method.enum';
import { PaymentStatus } from './enums/payment-status.enum';

export interface Payment {
  id: number;
  bookingId: number;
  bookingNumber: string;

  customerId: number;
  customerName: string;

  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;

  transactionReference: string;
  createdAt: string;
}

export interface PaymentCreateRequest {
  paymentMethod: PaymentMethod;
}