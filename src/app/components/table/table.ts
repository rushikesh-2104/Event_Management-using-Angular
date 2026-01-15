import { Component, OnInit } from '@angular/core';
import { DataService } from '../../data';

@Component({
  selector: 'app-table',
  standalone: false,
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class TableComponent implements OnInit {
  allData: any[] = [];
  filteredData: any[] = [];
  headers: string[] = [];
  searchTerm: string = '';

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    // Service se data subscribe kiya (Refresh persistence ab DataService handle kar raha hai)
    this.dataService.currentData.subscribe(data => {
      this.allData = data || [];
      this.filteredData = [...this.allData];

      if (this.allData.length > 0) {
        this.headers = Object.keys(this.allData[0]);
      }
    });
  }

  // Global Search logic
  applyFilter(): void {
    const search = this.searchTerm.toLowerCase().trim();
    if (!search) {
      this.filteredData = [...this.allData];
      return;
    }

    this.filteredData = this.allData.filter(row => {
      return Object.values(row).some(val => 
        String(val).toLowerCase().includes(search)
      );
    });
  }

  // Sorting logic
  sort(header: string): void {
    this.filteredData.sort((a, b) => {
      const valA = a[header] ?? '';
      const valB = b[header] ?? '';
      return valA > valB ? 1 : -1;
    });
  }

  // Naya Print function
  printTable(): void {
    window.print();
  }
}