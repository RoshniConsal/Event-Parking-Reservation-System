import {
  Component,
  inject
} from '@angular/core';

import {
  RouterOutlet
} from '@angular/router';

import {
  Navbar,
  NavbarItem
} from '../../shared/components/navbar/navbar';

import {
  AuthStateService
} from '../../core/services/auth-state';


@Component({
  selector: 'app-public-layout',

  imports: [
    RouterOutlet,
    Navbar
  ],

  templateUrl:
    './public-layout.html',

  styleUrl:
    './public-layout.css'
})
export class PublicLayout {

  readonly authState =
    inject(AuthStateService);


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