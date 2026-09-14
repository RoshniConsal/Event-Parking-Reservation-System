import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

export interface NavbarItem {
  label: string;
  route: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {

  @Input() brand = 'VenueFlow';
  @Input() items: NavbarItem[] = [];
  @Input() showLogin = true;
  @Input() showLogout = false;

  @Output()
  logoutClicked =
    new EventEmitter<void>();

  readonly logoPath =
    '/branding/venueflow-logo.png';

  logout(): void {
    this.logoutClicked.emit();
  }
}