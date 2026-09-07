import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css'
})
export class StatCard {
  @Input() title = '';

  @Input()
  value: string | number = 0;

  @Input()
  subtitle = '';

  @Input()
  icon = '✦';
}