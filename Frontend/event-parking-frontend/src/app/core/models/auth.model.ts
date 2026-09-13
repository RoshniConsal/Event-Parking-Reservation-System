export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  customerId: number;
  fullName: string;
  email: string;
  role: string;
  emailVerified: boolean;
  token: string;
  expiresAt: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface MessageResponse {
  message: string;
}