import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataService {
  // Yeh ek "Tijori" hai jisme data rahega
  private dataSource = new BehaviorSubject<any[]>([]);
  currentData = this.dataSource.asObservable();

  // Dashboard isko call karega data bharne ke liye
  setData(data: any[]) {
    this.dataSource.next(data);
  }
}