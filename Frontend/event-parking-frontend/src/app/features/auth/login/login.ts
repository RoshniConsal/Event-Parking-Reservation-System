import {
  Component,
  inject,
  signal
} from '@angular/core';

import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import {
  Router,
  RouterLink,
  ActivatedRoute
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


type LoginPortal =
  'Customer' |
  'Administrator';


@Component({
  selector: 'app-login',

  imports: [
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);

  private readonly activatedRoute =
    inject(ActivatedRoute);


  readonly expectedRole: LoginPortal =
    this.activatedRoute
      .snapshot
      .data['loginRole'] === 'Administrator'
        ? 'Administrator'
        : 'Customer';


  readonly isAdminLogin =
    this.expectedRole ===
    'Administrator';


  readonly isSubmitting =
    signal(false);

  readonly errorMessage =
    signal('');

  readonly showPassword =
    signal(false);


  readonly loginForm =
    this.formBuilder
      .nonNullable
      .group({

        email: [
          '',
          [
            Validators.required,
            Validators.email
          ]
        ],

        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6)
          ]
        ]

      });


  togglePassword(): void {

    this.showPassword.update(
      value => !value
    );
  }


  submit(): void {

    this.errorMessage.set('');

    if (this.loginForm.invalid) {

      this.loginForm
        .markAllAsTouched();

      return;
    }

    this.isSubmitting.set(true);

    this.authService
      .login(
        this.loginForm
          .getRawValue()
      )
      .pipe(
        finalize(() => {

          this.isSubmitting.set(false);

        })
      )
      .subscribe({

        next: (response) => {

          // CUSTOMER LOGIN PAGE-LA
          // CUSTOMER MATTUM ALLOW

          // ADMIN LOGIN PAGE-LA
          // ADMIN MATTUM ALLOW

          if (
            response.role !==
            this.expectedRole
          ) {

            this.authService.logout();

            if (this.isAdminLogin) {

              this.errorMessage.set(
                'This portal is for administrators only. Please use Customer Login for a customer account.'
              );

            } else {

              this.errorMessage.set(
                'This portal is for customers only. Please use Admin Login for an administrator account.'
              );

            }

            return;
          }


          const returnUrl =
            this.activatedRoute
              .snapshot
              .queryParamMap
              .get('returnUrl');


          if (
            returnUrl &&
            this.isAllowedReturnUrl(
              returnUrl
            )
          ) {

            this.router.navigateByUrl(
              returnUrl
            );

            return;
          }


          if (this.isAdminLogin) {

            this.router.navigate([
              '/admin/dashboard'
            ]);

            return;
          }


          this.router.navigate([
            '/customer/dashboard'
          ]);
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


  private isAllowedReturnUrl(
    returnUrl: string
  ): boolean {

    if (this.isAdminLogin) {

      return (
        returnUrl === '/admin' ||
        returnUrl.startsWith(
          '/admin/'
        )
      );
    }


    return (
      returnUrl === '/customer' ||
      returnUrl.startsWith(
        '/customer/'
      )
    );
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


    if (error.status === 0) {

      return (
        'Unable to connect to the server. ' +
        'Please make sure the backend API is running.'
      );
    }


    if (error.status === 401) {

      return (
        'Invalid email or password.'
      );
    }


    if (error.status === 403) {

      return (
        'Your account does not have permission to sign in.'
      );
    }


    return (
      'Login failed. Please try again.'
    );
  }

}