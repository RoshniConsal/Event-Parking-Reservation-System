import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  Notification
} from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/notifications`;

  /*
    GET /api/notifications

    Administrator only.
  */
  getAll(): Observable<Notification[]> {

    return this.http.get<Notification[]>(
      this.apiUrl
    );
  }

  /*
    GET /api/notifications/my

    unreadOnly=true na
    unread notifications mattum.
  */
  getMy(
    unreadOnly = false
  ): Observable<Notification[]> {

    const params = new HttpParams()
      .set(
        'unreadOnly',
        unreadOnly.toString()
      );

    return this.http.get<Notification[]>(
      `${this.apiUrl}/my`,
      { params }
    );
  }

  // GET /api/notifications/{id}
  getById(
    id: number
  ): Observable<Notification> {

    return this.http.get<Notification>(
      `${this.apiUrl}/${id}`
    );
  }

  /*
    PUT /api/notifications/{id}/read

    Notification mark as read.
  */
  markAsRead(
    id: number
  ): Observable<Notification> {

    return this.http.put<Notification>(
      `${this.apiUrl}/${id}/read`,
      null
    );
  }
}