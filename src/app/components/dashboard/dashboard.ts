import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { Chart } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DataService } from '../../data';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  data: any[] = [];

  totalParticipants = 0;
  totalGameEntries = 0;
  totalEventEntries = 0;

  femaleGameCount: { [key: string]: number } = {};
  maleGameCount: { [key: string]: number } = {};
  childrenGameCount: { [key: string]: number } = {};
  activityStats: { [key: string]: number } = {}; 

  femaleChart: any;
  maleChart: any;
  childrenChart: any;
  activityChart: any;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    // 1. Page load hote hi Service se saved data uthao (Persistence)
    this.dataService.currentData.subscribe(savedData => {
      if (savedData && savedData.length > 0) {
        this.data = savedData;
        this.processData();
      }
    });
  }

  onFileUpload(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      
      // 2. Data ko service ke through update karo (Yeh localStorage mein bhi save karega)
      this.dataService.updateData(jsonData); 
    };
    reader.readAsBinaryString(file);
  }

  processData(): void {
    if (!this.data || this.data.length === 0) return;

    // Reset counts before processing
    this.totalParticipants = this.data.length;
    this.totalGameEntries = 0;
    this.totalEventEntries = 0;
    this.femaleGameCount = {};
    this.maleGameCount = {};
    this.childrenGameCount = {};
    this.activityStats = {}; 

    this.data.forEach(row => {
      const keys = Object.keys(row);
      
      const overallGamesKey = keys.find(k => {
        const key = k.toLowerCase();
        return key.includes('which games') && !key.includes('female') && !key.includes('male') && !key.includes('children') && !key.includes('kids');
      });

      const femaleGamesKey = keys.find(k => k.toLowerCase().includes('which games') && k.toLowerCase().includes('female'));
      const maleGamesKey = keys.find(k => k.toLowerCase().includes('which games') && k.toLowerCase().includes('male') && !k.toLowerCase().includes('female'));
      const childrenGamesKey = keys.find(k => k.toLowerCase().includes('which games') && (k.toLowerCase().includes('children') || k.toLowerCase().includes('kids')));
      const activitiesKey = keys.find(k => k.toLowerCase().includes('which activity')); 

      // Stats Calculation Logic
      if (overallGamesKey && row[overallGamesKey]) {
        const val = String(row[overallGamesKey]);
        if (!val.toLowerCase().includes('none')) {
          this.totalGameEntries += val.split(',').filter(g => g.trim().length > 0).length;
        }
      }

      if (activitiesKey && row[activitiesKey]) {
        const val = String(row[activitiesKey]);
        if (!val.toLowerCase().includes('none')) {
          const items = val.split(',').map(a => a.trim()).filter(a => a.length > 0);
          this.totalEventEntries += items.length;
          items.forEach(item => {
            this.activityStats[item] = (this.activityStats[item] || 0) + 1;
          });
        }
      }

      const fillStorage = (key: string | undefined, storage: any) => {
        if (key && row[key]) {
          String(row[key]).split(',').forEach(g => {
            const name = g.trim();
            if (!name) return;
            if (name.toLowerCase().includes('none')) {
              storage['NONE (Skipped)'] = (storage['NONE (Skipped)'] || 0) + 1;
            } else {
              storage[name] = (storage[name] || 0) + 1;
            }
          });
        }
      };

      fillStorage(femaleGamesKey, this.femaleGameCount);
      fillStorage(maleGamesKey, this.maleGameCount);
      fillStorage(childrenGamesKey, this.childrenGameCount);
    });

    // Render Charts
    setTimeout(() => { // Timeout ensures DOM is ready for Canvas
      this.renderChart('femaleChart', this.femaleGameCount, '#a855f7', 'female');
      this.renderChart('maleChart', this.maleGameCount, '#3b82f6', 'male');
      this.renderChart('childrenChart', this.childrenGameCount, '#f59e0b', 'children');
      this.renderChart('activityChart', this.activityStats, '#10b981', 'activity');
    }, 100);
  }

  renderChart(id: string, dataset: any, color: string, type: string): void {
    const labels = Object.keys(dataset);
    const values = Object.values(dataset);
    const total = this.totalParticipants;

    // Destroy old chart instances to prevent memory leaks
    if (type === 'female') this.femaleChart?.destroy();
    if (type === 'male') this.maleChart?.destroy();
    if (type === 'children') this.childrenChart?.destroy();
    if (type === 'activity') this.activityChart?.destroy();

    const chart = new Chart(id, {
      type: 'bar',
      plugins: [ChartDataLabels],
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: color, borderRadius: 4, barThickness: 15 }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: {
            anchor: 'end', align: 'right', color: 'white',
            font: { size: 10 },
            formatter: (val) => `${val} (${((val / total) * 100).toFixed(0)}%)`
          }
        },
        scales: {
          x: { beginAtZero: true, grid: { display: false }, ticks: { display: false } },
          y: { grid: { display: false }, ticks: { color: 'white', font: { size: 11 } } }
        }
      }
    });

    if (type === 'female') this.femaleChart = chart;
    if (type === 'male') this.maleChart = chart;
    if (type === 'children') this.childrenChart = chart;
    if (type === 'activity') this.activityChart = chart;
  }
}