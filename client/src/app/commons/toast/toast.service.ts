import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<string>();
  toastState = this.toastSubject.asObservable();

  showToast(message: string) {
    this.toastSubject.next(message);
    setTimeout(() => {
      this.toastSubject.next('');
    }, 5000);
  }
}