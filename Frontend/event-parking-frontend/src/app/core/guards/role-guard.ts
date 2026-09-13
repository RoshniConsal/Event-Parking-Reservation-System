import { inject } from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';

import {
  AuthStateService
} from '../services/auth-state';

/*
  Role based route protection.

  Example:
  Administrator route-ku
  Customer access panna mudiyathu.
*/
export const roleGuard: CanActivateFn =
  (route, state) => {

    // Current authentication state
    const authState =
      inject(AuthStateService);

    // Redirect panna Router
    const router =
      inject(Router);

    /*
      User login pannala na
      login page-ku redirect.
    */
    if (!authState.isAuthenticated()) {

      return router.createUrlTree(
        ['/login'],
        {
          queryParams: {
            returnUrl: state.url
          }
        }
      );
    }

    /*
      Route configuration-la
      allow panna roles.

      Example:
      data: {
        roles: ['Administrator']
      }
    */
    const allowedRoles:
      string[] | undefined =
      route.data['roles'];

    /*
      Route-ku specific role
      configure pannala na
      authenticated user-ku allow.
    */
    if (
      !allowedRoles ||
      allowedRoles.length === 0
    ) {
      return true;
    }

    // Current logged-in user role
    const currentRole =
      authState.role();

    /*
      Current user role
      allowed list-la iruntha
      route open pannalam.
    */
    if (
      currentRole &&
      allowedRoles.includes(
        currentRole
      )
    ) {
      return true;
    }

    /*
      Login irukku,
      aana correct role illa.

      Home page-ku redirect.
    */
    return router.createUrlTree(
      ['/']
    );
  };