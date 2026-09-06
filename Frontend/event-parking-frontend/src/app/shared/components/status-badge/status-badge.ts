import { Component, Input } from '@angular/core';

export type BadgeTone =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.css'
})
export class StatusBadge {
  @Input() label = '';

  @Input()
  tone: BadgeTone = 'primary';
}