import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataService {
  // Check karo ki kya pehle se localStorage mein data hai
  private savedData = JSON.parse(localStorage.getItem('eventData') || '[]');
  private dataSource = new BehaviorSubject<any[]>(this.savedData);
  currentData = this.dataSource.asObservable();

  updateData(data: any[]) {
    // 1. LocalStorage mein save karo (Refresh ke liye)
    localStorage.setItem('eventData', JSON.stringify(data));
    // 2. Components ko notify karo
    this.dataSource.next(data);
  }

  // Clear button ke liye (Optional)
  clearData() {
    localStorage.removeItem('eventData');
    this.dataSource.next([]);
  }
}