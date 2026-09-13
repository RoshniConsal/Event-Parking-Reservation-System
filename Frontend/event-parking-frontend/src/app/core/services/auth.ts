import {
  inject,
  Injectable
} from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Observable,
  tap
} from 'rxjs';

import {
  environment
} from '../../../environments/environment';

import {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  MessageResponse,
  RegisterRequest,
  ResendVerificationRequest,
  ResetPasswordRequest
} from '../models/auth.model';

import {
  Customer
} from '../models/customer.model';

import {
  AuthStateService
} from './auth-state';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http =
    inject(HttpClient);

  private readonly authState =
    inject(AuthStateService);

  private readonly apiUrl =
    environment.apiUrl;

  /*
    POST /api/auth/login

    Login success aana
    session automatic-aa save pannum.
  */
  login(
    request: LoginRequest
  ): Observable<LoginResponse> {

    return this.http
      .post<LoginResponse>(
        `${this.apiUrl}/auth/login`,
        request
      )
      .pipe(
        tap((response) => {
          this.authState.setSession(
            response
          );
        })
      );
  }

  /*
    POST /api/customers/register
  */
  register(
    request: RegisterRequest
  ): Observable<Customer> {

    return this.http.post<Customer>(
      `${this.apiUrl}/customers/register`,
      request
    );
  }

  /*
    GET /api/auth/verify-email?token=...
  */
  verifyEmail(
    token: string
  ): Observable<MessageResponse> {

    const params =
      new HttpParams()
        .set(
          'token',
          token
        );

    return this.http.get<MessageResponse>(
      `${this.apiUrl}/auth/verify-email`,
      { params }
    );
  }

  /*
    POST /api/auth/resend-verification
  */
  resendVerification(
    request:
      ResendVerificationRequest
  ): Observable<MessageResponse> {

    return this.http.post<MessageResponse>(
      `${this.apiUrl}/auth/resend-verification`,
      request
    );
  }

  /*
    POST /api/auth/forgot-password
  */
  forgotPassword(
    request:
      ForgotPasswordRequest
  ): Observable<MessageResponse> {

    return this.http.post<MessageResponse>(
      `${this.apiUrl}/auth/forgot-password`,
      request
    );
  }

  /*
    POST /api/auth/reset-password
  */
  resetPassword(
    request:
      ResetPasswordRequest
  ): Observable<MessageResponse> {

    return this.http.post<MessageResponse>(
      `${this.apiUrl}/auth/reset-password`,
      request
    );
  }

  /*
    Backend logout endpoint illa.

    Frontend saved JWT/session
    clear pannuvom.
  */
  logout(): void {
    this.authState.logout();
  }
}