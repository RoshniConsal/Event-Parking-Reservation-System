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

  readonly isSubmitting =
    signal(false);

  readonly errorMessage =
    signal('');

  readonly showPassword =
    signal(false);

  readonly loginForm =
    this.formBuilder.nonNullable.group({

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

      this.loginForm.markAllAsTouched();

      return;
    }

    this.isSubmitting.set(true);

    this.authService
      .login(
        this.loginForm.getRawValue()
      )
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
        })
      )
      .subscribe({

        next: (response) => {

          const returnUrl =
            this.activatedRoute
              .snapshot
              .queryParamMap
              .get('returnUrl');

          if (
            returnUrl &&
            returnUrl.startsWith('/')
          ) {

            this.router.navigateByUrl(
              returnUrl
            );

            return;
          }

          if (
            response.role ===
            'Administrator'
          ) {

            this.router.navigate(
              ['/admin/dashboard']
            );

            return;
          }

          this.router.navigate(
            ['/customer/dashboard']
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

    if (error.status === 0) {
      return 'Unable to connect to the server. Please make sure the backend API is running.';
    }

    if (error.status === 401) {
      return 'Invalid email or password.';
    }

    if (error.status === 403) {
      return 'Your account does not have permission to sign in.';
    }

    return 'Login failed. Please try again.';
  }
}