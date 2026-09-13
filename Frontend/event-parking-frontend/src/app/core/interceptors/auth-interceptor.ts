import {
  inject
} from '@angular/core';

import {
  HttpInterceptorFn
} from '@angular/common/http';

import {
  AuthStateService
} from '../services/auth-state';

import {
  environment
} from '../../../environments/environment';

/*
  Protected API calls-ku automatically:

  Authorization:
  Bearer <JWT Token>

  header add pannum.
*/
export const authInterceptor:
  HttpInterceptorFn =
  (request, next) => {

    const authState =
      inject(AuthStateService);

    const token =
      authState.getToken();

    /*
      Token unrelated websites-ku
      send panna koodathu.

      Namma backend API request-aa
      check pannrom.
    */
    const isApiRequest =
      request.url.startsWith(
        environment.apiUrl
      );

    if (
      !token ||
      !isApiRequest
    ) {
      return next(request);
    }

    // JWT header add pannrom
    const authenticatedRequest =
      request.clone({
        setHeaders: {
          Authorization:
            `Bearer ${token}`
        }
      });

    return next(
      authenticatedRequest
    );
  };