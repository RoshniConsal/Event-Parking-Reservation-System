import {
  Component,
  inject
} from '@angular/core';

import {
  Router,
  RouterOutlet
} from '@angular/router';

import {
  Navbar,
  NavbarItem
} from '../../shared/components/navbar/navbar';

import {
  AuthService
} from '../../core/services/auth';

@Component({
  selector: 'app-customer-layout',

  imports: [
    RouterOutlet,
    Navbar
  ],

  templateUrl:
    './customer-layout.html',

  styleUrl:
    './customer-layout.css'
})
export class CustomerLayout {

  private readonly router =
    inject(Router);

  private readonly authService =
    inject(AuthService);

  readonly navItems: NavbarItem[] = [
    {
      label: 'Dashboard',
      route: '/customer/dashboard'
    },
    {
      label: 'Events',
      route: '/events'
    },
    {
      label: 'My Bookings',
      route: '/customer/bookings'
    },
    {
      label: 'Payments',
      route: '/customer/payments'
    },
    {
      label: 'Notifications',
      route: '/customer/notifications'
    }
  ];

  logout(): void {

    this.authService.logout();

    this.router.navigate([
      '/customer-login'
    ]);
  }
}