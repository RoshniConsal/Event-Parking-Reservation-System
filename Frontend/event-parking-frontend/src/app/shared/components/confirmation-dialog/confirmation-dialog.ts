import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.html',
  styleUrl: './confirmation-dialog.css'
})
export class ConfirmationDialog {
  @Input() open = false;

  @Input()
  title = 'Confirm action';

  @Input()
  message =
    'Are you sure you want to continue?';

  @Input()
  confirmLabel = 'Confirm';

  @Input()
  cancelLabel = 'Cancel';

  @Input()
  danger = false;

  @Output()
  confirmed =
    new EventEmitter<void>();

  @Output()
  cancelled =
    new EventEmitter<void>();
}