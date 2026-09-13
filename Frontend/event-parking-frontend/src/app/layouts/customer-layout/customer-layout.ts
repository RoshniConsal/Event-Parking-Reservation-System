import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import {
  Navbar,
  NavbarItem
} from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-customer-layout',
  imports: [
    RouterOutlet,
    Navbar
  ],
  templateUrl: './customer-layout.html',
  styleUrl: './customer-layout.css'
})
export class CustomerLayout {

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
}