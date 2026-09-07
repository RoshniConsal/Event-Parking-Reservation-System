import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import {
  Navbar,
  NavbarItem
} from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-public-layout',
  imports: [
    RouterOutlet,
    Navbar
  ],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.css'
})
export class PublicLayout {

  readonly navItems: NavbarItem[] = [
    {
      label: 'Home',
      route: '/'
    },
    {
      label: 'Events',
      route: '/events'
    }
  ];
}