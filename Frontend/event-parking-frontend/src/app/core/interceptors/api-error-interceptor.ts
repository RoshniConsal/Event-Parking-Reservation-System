import {
  inject
} from '@angular/core';

import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import {
  catchError,
  throwError
} from 'rxjs';

import {
  AuthStateService
} from '../services/auth-state';

/*
  Common API errors handle panna
  base interceptor.

  Later STEP 26-la
  complete user-friendly error UI
  add pannuvom.
*/
export const apiErrorInterceptor:
  HttpInterceptorFn =
  (request, next) => {

    const authState =
      inject(AuthStateService);

    return next(request).pipe(

      catchError(
        (
          error:
            HttpErrorResponse
        ) => {

          /*
            Protected API-la 401
            vandha current session
            invalid/expired nu artham.

            Login endpoint invalid
            password 401-ah iruntha
            session clear logic
            unnecessary.
          */
          const isLoginRequest =
            request.url.includes(
              '/auth/login'
            );

          if (
            error.status === 401 &&
            !isLoginRequest
          ) {
            authState.clearSession();
          }

          /*
            Original backend error
            component-ku thirumba
            anupprom.
          */
          return throwError(
            () => error
          );
        }
      )
    );
  };