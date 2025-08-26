import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  standalone: false,
  template: `
    <div *ngIf="message" class="fixed bottom-5 right-5 bg-black bg-opacity-70 text-white px-4 py-2 rounded-md z-50 text-sm">
      {{ message }}
    </div>
  `
})
export class NotificationComponent implements OnInit, OnDestroy {
  message: string | null = null;
  private notificationSubscription: Subscription | undefined;
  private timeoutId: any;

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.notificationSubscription = this.notificationService.getNotification().subscribe(message => {
      this.message = message;
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
      this.timeoutId = setTimeout(() => {
        this.message = null;
      }, 3000); // Notification disappears after 3 seconds
    });
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}