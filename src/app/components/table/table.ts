import { Component, OnInit } from '@angular/core';
import { DataService } from '../../data';


@Component({
  selector: 'app-table',
  standalone: false,
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class TableComponent implements OnInit {
  allData: any[] = [];         // Pura data store karne ke liye
  filteredData: any[] = [];    // Filtered data (search ke baad) ke liye
  headers: string[] = [];      // Excel ke columns ke naam
  searchTerm: string = '';     // Search box ki value

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    // 1. Service se data "subscribe" kiya
    this.dataService.currentData.subscribe(data => {
      this.allData = data;
      this.filteredData = data;

      // 2. Agar data hai, toh columns ke naam (headers) nikal lo
      if (data.length > 0) {
        this.headers = Object.keys(data[0]);
      }
    });
  }

  // 3. Search functionality
  applyFilter(): void {
    const search = this.searchTerm.toLowerCase();
    this.filteredData = this.allData.filter(row => {
      return Object.values(row).some(val => 
        String(val).toLowerCase().includes(search)
      );
    });
  }

  // 4. Sorting functionality
  sort(header: string): void {
    this.filteredData.sort((a, b) => {
      const valA = a[header];
      const valB = b[header];
      return valA > valB ? 1 : -1;
    });
  }
}