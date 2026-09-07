import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

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

  readonly logoPath = '/branding/venueflow-logo.png';
}