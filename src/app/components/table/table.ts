import { Component, OnInit } from '@angular/core';
import { DataService } from '../../data';

@Component({
  selector: 'app-table',
  standalone: false,
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class TableComponent implements OnInit {
  allData: any[] = [];         // Master data from service
  filteredData: any[] = [];    // Data after search and category filters
  headers: string[] = [];      // Excel column headers
  searchTerm: string = '';     // Search box value
  selectedCategory: string = 'all'; // Dropdown filter value

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    // Service se data subscribe kiya (LocalStorage logic DataService mein hai)
    this.dataService.currentData.subscribe(data => {
      this.allData = data || [];
      this.applyFilter(); // Load hote hi filter run karo

      if (this.allData.length > 0) {
        this.headers = Object.keys(this.allData[0]);
      }
    });
  }

  // Search aur Category filter ka combined logic
  applyFilter(): void {
    const search = this.searchTerm.toLowerCase().trim();
    
    this.filteredData = this.allData.filter(row => {
      // 1. Global Search Check (Kisi bhi column mein 'cricket' ya 'naam' mile)
      const matchesSearch = Object.values(row).some(val => 
        String(val).toLowerCase().includes(search)
      );

      // 2. Category Check (Male, Female, Kids distribution)
      let matchesCategory = true;
      if (this.selectedCategory !== 'all') {
        const rowKeys = Object.keys(row);
        
        // Smart Key Finding: Accurate column dhoondne ke liye
        const categoryKey = rowKeys.find(k => {
          const keyLower = k.toLowerCase();
          
          // Male select kiya toh Female column ko ignore karo
          if (this.selectedCategory === 'male') {
             return keyLower.includes('which games') && keyLower.includes('male') && !keyLower.includes('female');
          }
          
          // Kids select kiya toh 'Kids' aur 'Children' dono check karo
          if (this.selectedCategory === 'kids') {
             return keyLower.includes('which games') && (keyLower.includes('kids') || keyLower.includes('children'));
          }

          // Default logic for Female
          return keyLower.includes('which games') && keyLower.includes(this.selectedCategory);
        });

        if (categoryKey) {
          const val = String(row[categoryKey]).toLowerCase();
          // Filter out if column is empty or contains 'none'
          matchesCategory = val !== '' && !val.includes('none');
        } else {
          matchesCategory = false;
        }
      }

      return matchesSearch && matchesCategory;
    });
  }

  // Sorting functionality
  sort(header: string): void {
    this.filteredData.sort((a, b) => {
      const valA = a[header] ?? '';
      const valB = b[header] ?? '';
      return valA > valB ? 1 : -1;
    });
  }

  // Browser print functionality
  printTable(): void {
    window.print();
  }
}