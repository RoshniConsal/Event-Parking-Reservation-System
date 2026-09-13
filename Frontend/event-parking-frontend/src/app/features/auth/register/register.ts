import {
  Component,
  inject,
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
  Router,
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


/* =========================================================
   PASSWORD MATCH VALIDATOR
   ========================================================= */

const passwordsMatchValidator: ValidatorFn =
  (
    control: AbstractControl
  ): ValidationErrors | null => {

    const password =
      control.get('password')?.value;

    const confirmPassword =
      control.get('confirmPassword')?.value;

    if (
      !password ||
      !confirmPassword
    ) {
      return null;
    }

    if (
      password === confirmPassword
    ) {
      return null;
    }

    return {
      passwordsMismatch: true
    };
  };


@Component({
  selector: 'app-register',

  imports: [
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);

  private readonly activatedRoute =
    inject(ActivatedRoute);


  /* =========================================================
     UI STATE
     ========================================================= */

  readonly isSubmitting =
    signal(false);

  readonly errorMessage =
    signal('');

  readonly showPassword =
    signal(false);

  readonly showConfirmPassword =
    signal(false);


  /* =========================================================
     REGISTER FORM
     ========================================================= */

  readonly registerForm =
    this.formBuilder.nonNullable.group(
      {

        fullName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(100)
          ]
        ],

        email: [
          '',
          [
            Validators.required,
            Validators.email
          ]
        ],

        phone: [
          '',
          [
            Validators.required,

            Validators.pattern(
              /^[0-9+\-\s()]{7,20}$/
            )
          ]
        ],

        password: [
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


  /* =========================================================
     PASSWORD VISIBILITY
     ========================================================= */

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


  /* =========================================================
     SUBMIT
     ========================================================= */

  submit(): void {

    this.errorMessage.set('');

    if (
      this.registerForm.invalid
    ) {

      this.registerForm
        .markAllAsTouched();

      return;
    }


    const request =
      this.registerForm
        .getRawValue();


    this.isSubmitting.set(true);


    this.authService
      .register(request)
      .pipe(

        finalize(() => {

          this.isSubmitting.set(false);

        })

      )
      .subscribe({

        next: () => {

          this.router.navigate(
            ['/verify-email'],
            {
              queryParams: {

                email:
                  request.email,

                registered:
                  'true'

              }
            }
          );

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


  /* =========================================================
     API ERROR MESSAGE
     ========================================================= */

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

      return 'Unable to connect to the server. Please make sure the backend API is running.';

    }


    if (
      error.status === 409
    ) {

      return 'An account with this email address already exists.';

    }


    if (
      error.status === 400
    ) {

      return 'Please check your registration details and try again.';

    }


    return 'Registration failed. Please try again.';
  }
}