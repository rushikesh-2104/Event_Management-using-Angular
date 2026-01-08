import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent {

  data: any[] = [];

  totalParticipants: number = 0;
  totalGameEntries: number = 0;
  totalEventEntries: number = 0;

  gameCount: { [key: string]: number } = {};
  chart: any;

  onFileUpload(event: any): void {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e: any) => {
      const binaryData = e.target.result;

      const workbook = XLSX.read(binaryData, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      this.data = XLSX.utils.sheet_to_json(sheet);
      console.log('Excel Data:', this.data);

      this.processData();
    };

    reader.readAsBinaryString(file);
  }

  processData(): void {
    this.totalParticipants = this.data.length;
    this.totalGameEntries = 0;
    this.totalEventEntries = 0;
    this.gameCount = {};

    if (!this.data.length) return;

    this.data.forEach(row => {
      Object.keys(row).forEach(key => {
        const value: string = String(row[key] || '');

        // 🎮 GAME ENTRIES + GAME COUNT
        if (key.toLowerCase().includes('which games')) {
          if (value && !value.toLowerCase().includes('none')) {
            value.split(',').forEach(game => {
              const g = game.trim();
              if (g) {
                this.totalGameEntries++; // count game entry
                this.gameCount[g] = (this.gameCount[g] || 0) + 1;
              }
            });
          }
        }

        // 🎭 EVENT / ACTIVITY ENTRIES
        if (key.toLowerCase().includes('which activity')) {
          if (value && !value.toLowerCase().includes('none')) {
            value.split(',').forEach(activity => {
              if (activity.trim()) {
                this.totalEventEntries++; // count activity entry
              }
            });
          }
        }
      });
    });

    console.log('Game Count:', this.gameCount);
    console.log('Total Game Entries:', this.totalGameEntries);
    console.log('Total Event Entries:', this.totalEventEntries);

    this.renderChart();
  }

  renderChart(): void {
    const labels = Object.keys(this.gameCount);
    const values = Object.values(this.gameCount);

    if (!labels.length) {
      console.warn('No game data found for chart');
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart('gamesChart', {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Game Participation',
            data: values,
            backgroundColor: '#3b82f6'
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

}
