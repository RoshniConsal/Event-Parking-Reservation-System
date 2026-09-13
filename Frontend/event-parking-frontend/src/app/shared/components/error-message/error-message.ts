import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-message',
  templateUrl: './error-message.html',
  styleUrl: './error-message.css'
})
export class ErrorMessage {
  @Input()
  title = 'Something went wrong';

  @Input()
  message =
    'Unable to complete the request. Please try again.';
}