import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css'
})
export class EmptyState {
  @Input() title = 'Nothing here yet';

  @Input()
  message =
    'There is currently no information to display.';

  @Input()
  actionLabel: string | null = null;

  @Output()
  action =
    new EventEmitter<void>();
}