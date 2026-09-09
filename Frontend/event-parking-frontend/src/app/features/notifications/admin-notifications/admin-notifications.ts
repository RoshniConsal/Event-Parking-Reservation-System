import {
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  DatePipe
} from '@angular/common';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  finalize
} from 'rxjs';

import {
  Notification
} from '../../../core/models/notification.model';

import {
  NotificationType
} from '../../../core/models/enums/notification-type.enum';

import {
  NotificationService
} from '../../../core/services/notification';


@Component({
  selector: 'app-admin-notifications',

  imports: [
    DatePipe
  ],

  templateUrl:
    './admin-notifications.html',

  styleUrl:
    './admin-notifications.css'
})
export class AdminNotifications
  implements OnInit {

  private readonly notificationService =
    inject(NotificationService);


  readonly NotificationType =
    NotificationType;


  readonly notifications =
    signal<Notification[]>([]);


  readonly searchTerm =
    signal('');


  readonly selectedType =
    signal<NotificationType | 0>(0);


  readonly selectedReadState =
    signal<'all' | 'unread' | 'read'>(
      'all'
    );


  readonly isLoading =
    signal(true);


  readonly errorMessage =
    signal('');


  readonly successMessage =
    signal('');


  readonly updatingNotificationId =
    signal<number | null>(null);


  readonly filteredNotifications =
    computed(() => {

      const search =
        this.searchTerm()
          .trim()
          .toLowerCase();


      const type =
        this.selectedType();


      const readState =
        this.selectedReadState();


      return this.notifications()
        .filter(notification => {

          const matchesType =
            type === 0 ||
            notification.type === type;


          const matchesReadState =
            readState === 'all' ||

            (
              readState === 'read' &&
              notification.isRead
            ) ||

            (
              readState === 'unread' &&
              !notification.isRead
            );


          if (
            !matchesType ||
            !matchesReadState
          ) {

            return false;

          }


          if (!search) {

            return true;

          }


          return (

            notification.title
              .toLowerCase()
              .includes(search) ||

            notification.message
              .toLowerCase()
              .includes(search) ||

            notification.id
              .toString()
              .includes(search) ||

            notification.customerId
              .toString()
              .includes(search) ||

            notification.bookingId
              ?.toString()
              .includes(search) ||

            notification.eventId
              ?.toString()
              .includes(search)

          );

        });

    });


  readonly totalNotifications =
    computed(() =>
      this.notifications().length
    );


  readonly unreadNotifications =
    computed(() =>
      this.notifications()
        .filter(
          notification =>
            !notification.isRead
        )
        .length
    );


  readonly readNotifications =
    computed(() =>
      this.notifications()
        .filter(
          notification =>
            notification.isRead
        )
        .length
    );


  readonly bookingNotifications =
    computed(() =>
      this.notifications()
        .filter(
          notification =>
            notification.type ===
              NotificationType.BookingConfirmed
            ||
            notification.type ===
              NotificationType.BookingCancelled
        )
        .length
    );


  readonly paymentNotifications =
    computed(() =>
      this.notifications()
        .filter(
          notification =>
            notification.type ===
            NotificationType.PaymentCompleted
        )
        .length
    );


  ngOnInit(): void {

    this.loadNotifications();

  }


  loadNotifications(): void {

    this.isLoading.set(true);

    this.errorMessage.set('');

    this.successMessage.set('');


    this.notificationService
      .getAll()
      .pipe(

        finalize(() => {

          this.isLoading.set(false);

        })

      )
      .subscribe({

        next: notifications => {

          const sortedNotifications =
            [...notifications]
              .sort(
                (a, b) =>
                  new Date(
                    b.createdAt
                  ).getTime()
                  -
                  new Date(
                    a.createdAt
                  ).getTime()
              );


          this.notifications.set(
            sortedNotifications
          );

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.notifications.set([]);

          this.errorMessage.set(
            this.getErrorMessage(
              error
            )
          );

        }

      });

  }


  onSearchInput(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    this.searchTerm.set(
      input.value
    );

  }


  onTypeChange(
    event: Event
  ): void {

    const select =
      event.target as HTMLSelectElement;


    this.selectedType.set(
      Number(
        select.value
      ) as NotificationType | 0
    );

  }


  onReadStateChange(
    event: Event
  ): void {

    const select =
      event.target as HTMLSelectElement;


    this.selectedReadState.set(
      select.value as
        'all' |
        'unread' |
        'read'
    );

  }


  clearFilters(): void {

    this.searchTerm.set('');

    this.selectedType.set(0);

    this.selectedReadState.set(
      'all'
    );

  }


  markAsRead(
    notification: Notification
  ): void {

    if (
      notification.isRead ||
      this.updatingNotificationId() !==
        null
    ) {

      return;

    }


    this.errorMessage.set('');

    this.successMessage.set('');


    this.updatingNotificationId.set(
      notification.id
    );


    this.notificationService
      .markAsRead(
        notification.id
      )
      .pipe(

        finalize(() => {

          this.updatingNotificationId.set(
            null
          );

        })

      )
      .subscribe({

        next: updatedNotification => {

          this.notifications.update(
            current =>
              current.map(
                item =>
                  item.id ===
                  updatedNotification.id

                    ? updatedNotification

                    : item
              )
          );


          this.successMessage.set(
            `Notification #${updatedNotification.id} marked as read successfully.`
          );

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.errorMessage.set(
            this.getMarkAsReadErrorMessage(
              error
            )
          );

        }

      });

  }


  typeText(
    type: NotificationType
  ): string {

    switch (type) {

      case NotificationType.BookingConfirmed:
        return 'Booking Confirmed';

      case NotificationType.BookingCancelled:
        return 'Booking Cancelled';

      case NotificationType.PaymentCompleted:
        return 'Payment Completed';

      case NotificationType.EventReminder:
        return 'Event Reminder';

      case NotificationType.EventUpdated:
        return 'Event Updated';

      default:
        return 'Notification';

    }

  }


  typeClass(
    type: NotificationType
  ): string {

    switch (type) {

      case NotificationType.BookingConfirmed:
        return 'booking-confirmed';

      case NotificationType.BookingCancelled:
        return 'booking-cancelled';

      case NotificationType.PaymentCompleted:
        return 'payment-completed';

      case NotificationType.EventReminder:
        return 'event-reminder';

      case NotificationType.EventUpdated:
        return 'event-updated';

      default:
        return '';

    }

  }


  typeShort(
    type: NotificationType
  ): string {

    switch (type) {

      case NotificationType.BookingConfirmed:
        return 'BC';

      case NotificationType.BookingCancelled:
        return 'BX';

      case NotificationType.PaymentCompleted:
        return 'PC';

      case NotificationType.EventReminder:
        return 'ER';

      case NotificationType.EventUpdated:
        return 'EU';

      default:
        return 'NT';

    }

  }


  private getErrorMessage(
    error: HttpErrorResponse
  ): string {

    if (
      error.status === 0
    ) {

      return 'Unable to connect to the VenueFlow server. Please make sure the backend API is running.';

    }


    if (
      error.status === 401
    ) {

      return 'Your login session has expired. Please sign in again.';

    }


    if (
      error.status === 403
    ) {

      return 'You are not allowed to access admin notifications.';

    }


    const backendMessage =
      error.error?.message;


    if (
      typeof backendMessage ===
      'string'
    ) {

      return backendMessage;

    }


    return 'Unable to load notifications. Please try again.';

  }


  private getMarkAsReadErrorMessage(
    error: HttpErrorResponse
  ): string {

    if (
      error.status === 0
    ) {

      return 'Unable to connect to the server. Please try again.';

    }


    if (
      error.status === 401
    ) {

      return 'Your login session has expired. Please sign in again.';

    }


    if (
      error.status === 403
    ) {

      return 'You are not allowed to update this notification.';

    }


    if (
      error.status === 404
    ) {

      return 'The notification could not be found.';

    }


    const backendMessage =
      error.error?.message;


    if (
      typeof backendMessage ===
      'string'
    ) {

      return backendMessage;

    }


    return 'Unable to mark the notification as read. Please try again.';

  }

}