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
  selector: 'app-admin-layout',

  imports: [
    RouterOutlet,
    Navbar
  ],

  templateUrl:
    './admin-layout.html',

  styleUrl:
    './admin-layout.css'
})
export class AdminLayout {

  private readonly router =
    inject(Router);

  private readonly authService =
    inject(AuthService);

  readonly navItems: NavbarItem[] = [
    {
      label: 'Dashboard',
      route: '/admin/dashboard'
    },
    {
      label: 'Venues',
      route: '/admin/venues'
    },
    {
      label: 'Categories',
      route: '/admin/categories'
    },
    {
      label: 'Events',
      route: '/admin/events'
    },
    {
      label: 'Customers',
      route: '/admin/customers'
    },
    {
      label: 'Bookings',
      route: '/admin/bookings'
    },
    {
      label: 'Payments',
      route: '/admin/payments'
    },
    {
      label: 'Notifications',
      route: '/admin/notifications'
    }
  ];

  logout(): void {

    this.authService.logout();

    this.router.navigate([
      '/admin-login'
    ]);
  }
}