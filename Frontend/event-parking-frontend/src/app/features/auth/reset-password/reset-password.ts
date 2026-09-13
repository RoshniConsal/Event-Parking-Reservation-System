import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

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


const passwordsMatchValidator:
  ValidatorFn =
  (
    control: AbstractControl
  ): ValidationErrors | null => {

    const newPassword =
      control
        .get('newPassword')
        ?.value;

    const confirmPassword =
      control
        .get('confirmPassword')
        ?.value;


    if (
      !newPassword ||
      !confirmPassword
    ) {

      return null;

    }


    return (
      newPassword ===
      confirmPassword
    )
      ? null
      : {
          passwordsMismatch:
            true
        };
  };


@Component({
  selector: 'app-reset-password',

  imports: [
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl:
    './reset-password.html',

  styleUrl:
    './reset-password.css'
})
export class ResetPassword
  implements OnInit {

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly route =
    inject(ActivatedRoute);

  private readonly authService =
    inject(AuthService);


  readonly token =
    signal('');

  readonly tokenMissing =
    signal(false);

  readonly isSubmitting =
    signal(false);

  readonly isSuccess =
    signal(false);

  readonly errorMessage =
    signal('');

  readonly showPassword =
    signal(false);

  readonly showConfirmPassword =
    signal(false);


  readonly resetPasswordForm =
    this.formBuilder
      .nonNullable
      .group(
        {

          newPassword: [
            '',
            [
              Validators.required,
              Validators.minLength(6)
            ]
          ],

          confirmPassword: [
            '',
            [
              Validators.required
            ]
          ]

        },
        {
          validators:
            passwordsMatchValidator
        }
      );


  ngOnInit(): void {

    const token =
      this.route.snapshot
        .queryParamMap
        .get('token');


    if (!token) {

      this.tokenMissing.set(true);

      return;

    }


    this.token.set(token);
  }


  togglePassword(): void {

    this.showPassword.update(
      value => !value
    );
  }


  toggleConfirmPassword(): void {

    this.showConfirmPassword.update(
      value => !value
    );
  }


  submit(): void {

    this.errorMessage.set('');


    if (
      this.tokenMissing() ||
      !this.token()
    ) {

      this.errorMessage.set(
        'Password reset token is missing.'
      );

      return;
    }


    if (
      this.resetPasswordForm.invalid
    ) {

      this.resetPasswordForm
        .markAllAsTouched();

      return;
    }


    const values =
      this.resetPasswordForm
        .getRawValue();


    this.isSubmitting.set(true);


    this.authService
      .resetPassword({

        token:
          this.token(),

        newPassword:
          values.newPassword,

        confirmPassword:
          values.confirmPassword

      })
      .pipe(

        finalize(() => {

          this.isSubmitting.set(false);

        })

      )
      .subscribe({

        next: () => {

          this.isSuccess.set(true);

          this.resetPasswordForm
            .reset();

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.errorMessage.set(
            this.getErrorMessage(
              error
            )
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


    if (
      error.status === 400
    ) {

      return 'This password reset link is invalid or has expired.';

    }


    return 'Password reset failed. Please try again.';
  }
}