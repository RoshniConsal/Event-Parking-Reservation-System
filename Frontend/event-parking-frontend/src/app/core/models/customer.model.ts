import { CustomerStatus } from './enums/customer-status.enum';

export interface Customer {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: CustomerStatus;
  emailVerified: boolean;
  createdAt: string;
}

export interface CustomerUpdateRequest {
  fullName: string;
  phone: string;
}