import { Component, OnInit } from '@angular/core';
import { DataService } from '../../data';

@Component({
  selector: 'app-table',
  standalone: false,
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class TableComponent implements OnInit {
  // --- Core Data Arrays ---
  allData: any[] = [];
  filteredData: any[] = [];
  headers: string[] = [];

  // --- UI States ---
  searchTerm: string = '';         
  selectedCategory: string = 'all';
  today: Date = new Date(); // <--- ADD THIS LINE TO FIX THE ERROR

  // --- Form States ---
  showEntryForm: boolean = false;  
  newEntry: any = {};              

  // --- Inline Editing States ---
  editingIndex: number | null = null; 
  editRowCopy: any = {};              

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.currentData.subscribe(data => {
      this.allData = data || [];
      if (this.allData.length > 0 && this.headers.length === 0) {
        this.headers = Object.keys(this.allData[0]);
      }
      this.applyFilter();
    });
  }

  applyFilter(): void {
    const search = this.searchTerm.toLowerCase().trim();
    this.filteredData = this.allData.filter(row => {
      const matchesSearch = Object.values(row).some(val => 
        String(val).toLowerCase().includes(search)
      );

      let matchesCategory = true;
      if (this.selectedCategory !== 'all') {
        const rowKeys = Object.keys(row);
        const categoryKey = rowKeys.find(k => {
          const keyLower = k.toLowerCase();
          if (this.selectedCategory === 'male') {
             return keyLower.includes('which games') && keyLower.includes('male') && !keyLower.includes('female');
          }
          if (this.selectedCategory === 'kids') {
             return keyLower.includes('which games') && (keyLower.includes('kids') || keyLower.includes('children'));
          }
          return keyLower.includes('which games') && keyLower.includes(this.selectedCategory);
        });

        if (categoryKey) {
          const val = String(row[categoryKey]).toLowerCase();
          matchesCategory = val !== '' && !val.includes('none');
        } else {
          matchesCategory = false;
        }
      }
      return matchesSearch && matchesCategory;
    });
  }

  toggleForm(): void {
    this.showEntryForm = !this.showEntryForm;
    if (this.showEntryForm) {
      this.newEntry = {};
      this.headers.forEach(h => this.newEntry[h] = '');
    }
  }

  submitEntry(): void {
    const hasData = Object.values(this.newEntry).some(val => String(val).trim() !== '');
    if (!hasData) {
      alert("Please fill at least one field.");
      return;
    }
    const updatedData = [this.newEntry, ...this.allData];
    this.saveAndUpdate(updatedData);
    this.showEntryForm = false;
    this.newEntry = {};
  }

  startEdit(index: number, row: any): void {
    this.editingIndex = index;
    this.editRowCopy = { ...row };
  }

  cancelEdit(): void {
    this.editingIndex = null;
    this.editRowCopy = {};
  }

  saveUpdate(indexInFiltered: number): void {
    const itemToUpdate = this.filteredData[indexInFiltered];
    const masterIndex = this.allData.indexOf(itemToUpdate);

    if (masterIndex > -1) {
      const updatedData = [...this.allData];
      updatedData[masterIndex] = { ...this.editRowCopy };
      this.saveAndUpdate(updatedData);
      this.editingIndex = null;
      this.editRowCopy = {};
    }
  }

  deleteRow(indexInFiltered: number): void {
    if (confirm("Are you sure you want to delete this record?")) {
      const itemToDelete = this.filteredData[indexInFiltered];
      const masterIndex = this.allData.indexOf(itemToDelete);
      if (masterIndex > -1) {
        const updatedData = [...this.allData];
        updatedData.splice(masterIndex, 1);
        this.saveAndUpdate(updatedData);
      }
    }
  }

  downloadCSV(): void {
    if (this.allData.length === 0) return;
    const csvHeaders = this.headers.join(',');
    const csvRows = this.allData.map(row => {
      return this.headers.map(h => {
        const val = row[h] === null || row[h] === undefined ? '' : String(row[h]);
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',');
    });
    const blob = new Blob([ [csvHeaders, ...csvRows].join('\n') ], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Master_Data_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private saveAndUpdate(newData: any[]): void {
    this.today = new Date(); // Update the timestamp on save
    this.dataService.updateData(newData);
  }

  sort(header: string): void {
    this.filteredData.sort((a, b) => {
      const valA = (a[header] ?? '').toString().toLowerCase();
      const valB = (b[header] ?? '').toString().toLowerCase();
      return valA > valB ? 1 : -1;
    });
  }

  printTable(): void {
    window.print();
  }
}