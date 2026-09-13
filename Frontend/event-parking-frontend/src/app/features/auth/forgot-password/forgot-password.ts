import {
  Component,
  inject,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
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
  selector: 'app-forgot-password',

  imports: [
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl:
    './forgot-password.html',

  styleUrl:
    './forgot-password.css'
})
export class ForgotPassword {

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly authService =
    inject(AuthService);


  readonly isSubmitting =
    signal(false);

  readonly successMessage =
    signal('');

  readonly errorMessage =
    signal('');


  readonly forgotPasswordForm =
    this.formBuilder
      .nonNullable
      .group({

        email: [
          '',
          [
            Validators.required,
            Validators.email
          ]
        ]

      });


  submit(): void {

    this.successMessage.set('');
    this.errorMessage.set('');


    if (
      this.forgotPasswordForm.invalid
    ) {

      this.forgotPasswordForm
        .markAllAsTouched();

      return;
    }


    this.isSubmitting.set(true);


    const request =
      this.forgotPasswordForm
        .getRawValue();


    this.authService
      .forgotPassword(request)
      .pipe(

        finalize(() => {

          this.isSubmitting.set(false);

        })

      )
      .subscribe({

        next: response => {

          this.successMessage.set(
            response.message ||
            'Password reset instructions have been sent.'
          );

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.errorMessage.set(
            this.getErrorMessage(error)
          );

        }

      });
  }


  private getErrorMessage(
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

      return 'Unable to connect to the server. Please try again later.';

    }


    return 'Unable to process your request. Please try again.';
  }
}