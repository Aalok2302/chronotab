import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<string>();

  constructor() { }

  sendNotification(message: string) {
    this.notificationSubject.next(message);
  }

  getNotification(): Observable<string> {
    return this.notificationSubject.asObservable();
  }
}