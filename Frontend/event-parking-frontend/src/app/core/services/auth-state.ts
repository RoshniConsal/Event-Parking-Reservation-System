import {
  computed,
  Injectable,
  signal
} from '@angular/core';

import {
  LoginResponse
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {

  // Login session save panna use pannura browser key
  private readonly storageKey =
    'eventpark_auth';

  /*
    App start aagumbothu localStorage-la
    existing session irukka check pannum.
  */
  private readonly currentUserSignal =
    signal<LoginResponse | null>(
      this.readStoredSession()
    );

  // Components-ku readonly current user
  readonly currentUser =
    this.currentUserSignal.asReadonly();

  // User currently logged in-aa?
  readonly isAuthenticated =
    computed(() => {

      const session =
        this.currentUserSignal();

      if (!session?.token) {
        return false;
      }

      return !this.isSessionExpired(
        session
      );
    });

  // Current logged user role
  readonly role =
    computed(() => {
      return (
        this.currentUserSignal()?.role
        ?? null
      );
    });

  // Current customer ID
  readonly customerId =
    computed(() => {
      return (
        this.currentUserSignal()?.customerId
        ?? null
      );
    });

  // Current user full name
  readonly fullName =
    computed(() => {
      return (
        this.currentUserSignal()?.fullName
        ?? null
      );
    });

  /*
    Login success aana
    backend LoginResponse save pannum.
  */
  setSession(
    session: LoginResponse
  ): void {

    if (
      typeof localStorage !==
      'undefined'
    ) {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(session)
      );
    }

    this.currentUserSignal.set(
      session
    );
  }

  // Login session remove pannum
  clearSession(): void {

    if (
      typeof localStorage !==
      'undefined'
    ) {
      localStorage.removeItem(
        this.storageKey
      );
    }

    this.currentUserSignal.set(
      null
    );
  }

  // Logout
  logout(): void {
    this.clearSession();
  }

  /*
    JWT token edukka interceptor
    indha method use pannum.
  */
  getToken(): string | null {

    const session =
      this.currentUserSignal();

    if (!session) {
      return null;
    }

    if (
      this.isSessionExpired(session)
    ) {
      this.clearSession();

      return null;
    }

    return session.token;
  }

  // Role check
  isInRole(
    role: string
  ): boolean {

    return (
      this.currentUserSignal()?.role
      === role
    );
  }

  /*
    Browser refresh pannalum
    login session restore pannum.
  */
  private readStoredSession():
    LoginResponse | null {

    if (
      typeof localStorage ===
      'undefined'
    ) {
      return null;
    }

    const stored =
      localStorage.getItem(
        this.storageKey
      );

    if (!stored) {
      return null;
    }

    try {

      const session: LoginResponse =
        JSON.parse(stored);

      if (
        this.isSessionExpired(session)
      ) {

        localStorage.removeItem(
          this.storageKey
        );

        return null;
      }

      return session;

    } catch {

      localStorage.removeItem(
        this.storageKey
      );

      return null;
    }
  }

  /*
    Backend expiresAt value use panni
    session expire aagiducha check pannum.
  */
  private isSessionExpired(
    session: LoginResponse
  ): boolean {

    const expiry =
      new Date(
        session.expiresAt
      ).getTime();

    if (
      Number.isNaN(expiry)
    ) {
      return true;
    }

    return Date.now() >= expiry;
  }
}