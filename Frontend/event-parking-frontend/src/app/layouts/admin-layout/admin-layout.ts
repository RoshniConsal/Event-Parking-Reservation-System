import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import {
  Navbar,
  NavbarItem
} from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-admin-layout',
  imports: [
    RouterOutlet,
    Navbar
  ],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout {

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
}