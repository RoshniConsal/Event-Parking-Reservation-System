import {
  inject
} from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';

import {
  AuthStateService
} from '../services/auth-state';

/*
  Login pannatha user
  protected route open panna
  /login-ku redirect pannum.
*/
export const authGuard:
  CanActivateFn =
  (_route, state) => {

    const authState =
      inject(AuthStateService);

    const router =
      inject(Router);

    if (
      authState.isAuthenticated()
    ) {
      return true;
    }

    /*
      Login success piragu
      original requested page-ku
      return panna returnUrl save.
    */
    return router.createUrlTree(
      ['/login'],
      {
        queryParams: {
          returnUrl:
            state.url
        }
      }
    );
  };