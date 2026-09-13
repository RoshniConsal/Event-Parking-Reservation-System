import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  finalize
} from 'rxjs';

import {
  AuthService
} from '../../../core/services/auth';


@Component({
  selector: 'app-verify-email',

  imports: [
    RouterLink
  ],

  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css'
})
export class VerifyEmail implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly authService =
    inject(AuthService);


  /* =========================================================
     PAGE STATE
     ========================================================= */

  readonly email =
    signal('');

  readonly isRegistered =
    signal(false);

  readonly isVerifying =
    signal(false);

  readonly isVerified =
    signal(false);

  readonly verificationError =
    signal('');

  readonly isResending =
    signal(false);

  readonly resendMessage =
    signal('');

  readonly resendError =
    signal('');


  /* =========================================================
     PAGE LOAD
     ========================================================= */

  ngOnInit(): void {

    const token =
      this.route.snapshot
        .queryParamMap
        .get('token');

    const email =
      this.route.snapshot
        .queryParamMap
        .get('email');

    const registered =
      this.route.snapshot
        .queryParamMap
        .get('registered');


    if (email) {

      this.email.set(email);

    }


    this.isRegistered.set(
      registered === 'true'
    );


    /*
      Email verification link-la
      token iruntha backend-ku
      automatic-aa verify request pogum.
    */

    if (token) {

      this.verifyEmail(token);

    }
  }


  /* =========================================================
     VERIFY EMAIL
     ========================================================= */

  private verifyEmail(
    token: string
  ): void {

    this.isVerifying.set(true);

    this.verificationError.set('');


    this.authService
      .verifyEmail(token)
      .pipe(

        finalize(() => {

          this.isVerifying.set(false);

        })

      )
      .subscribe({

        next: () => {

          this.isVerified.set(true);

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.verificationError.set(
            this.getVerificationError(
              error
            )
          );

        }

      });
  }


  /* =========================================================
     RESEND VERIFICATION
     ========================================================= */

  resendVerification(): void {

    const email =
      this.email().trim();


    if (!email) {

      this.resendError.set(
        'Email address is not available. Please return to registration or sign in.'
      );

      return;
    }


    this.resendMessage.set('');

    this.resendError.set('');

    this.isResending.set(true);


    this.authService
      .resendVerification({
        email
      })
      .pipe(

        finalize(() => {

          this.isResending.set(false);

        })

      )
      .subscribe({

        next: response => {

          this.resendMessage.set(
            response.message ||
            'Verification instructions have been sent.'
          );

        },


        error: (
          error: HttpErrorResponse
        ) => {

          const backendMessage =
            error.error?.message;


          this.resendError.set(

            typeof backendMessage ===
            'string'

              ? backendMessage

              : 'Unable to resend the verification email. Please try again.'

          );

        }

      });
  }


  /* =========================================================
     ERROR MESSAGE
     ========================================================= */

  private getVerificationError(
    error: HttpErrorResponse
  ): string {

    const backendMessage =
      error.error?.message;


    if (
      typeof backendMessage ===
      'string'
    ) {

      return backendMessage;

    }


    if (
      error.status === 0
    ) {

      return 'Unable to connect to the server. Please make sure the backend API is running.';

    }


    if (
      error.status === 400
    ) {

      return 'This verification link is invalid or has expired.';

    }


    return 'Email verification failed. Please try again.';
  }
}