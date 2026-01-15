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

  // TOP CARDS
  totalParticipants = 0;
  totalGameEntries = 0;
  totalEventEntries = 0;

  // DATA STORAGE
  femaleGameCount: { [key: string]: number } = {};
  maleGameCount: { [key: string]: number } = {};
  childrenGameCount: { [key: string]: number } = {};
  activityStats: { [key: string]: number } = {}; 

  // CHART REFERENCES
  femaleChart: any;
  maleChart: any;
  childrenChart: any;
  activityChart: any;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
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
      this.dataService.updateData(jsonData);
    };
    reader.readAsBinaryString(file);
  }

  processData(): void {
    if (!this.data || this.data.length === 0) return;

    this.totalParticipants = this.data.length;
    this.totalGameEntries = 0; // Reset for recalculation
    this.totalEventEntries = 0;
    this.femaleGameCount = {};
    this.maleGameCount = {};
    this.childrenGameCount = {};
    this.activityStats = {}; 

    this.data.forEach(row => {
      const keys = Object.keys(row);
      
      const femaleGamesKey = keys.find(k => k.toLowerCase().includes('which games') && k.toLowerCase().includes('female'));
      const maleGamesKey = keys.find(k => k.toLowerCase().includes('which games') && k.toLowerCase().includes('male') && !k.toLowerCase().includes('female'));
      const childrenGamesKey = keys.find(k => k.toLowerCase().includes('which games') && (k.toLowerCase().includes('children') || k.toLowerCase().includes('kids')));
      const activitiesKey = keys.find(k => k.toLowerCase().includes('which activity')); 

      // 1. Events/Activity Count Logic
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

      // 2. Games Count Logic (Male, Female, Kids Combined)
      const fillStorage = (key: string | undefined, storage: any) => {
        if (key && row[key]) {
          const val = String(row[key]);
          if (!val.toLowerCase().includes('none')) {
            const games = val.split(',').map(g => g.trim()).filter(g => g.length > 0);
            
            // Yahan total games count ho rahe hain
            this.totalGameEntries += games.length;

            games.forEach(name => {
              storage[name] = (storage[name] || 0) + 1;
            });
          } else {
            storage['NONE'] = (storage['NONE'] || 0) + 1;
          }
        }
      };

      fillStorage(femaleGamesKey, this.femaleGameCount);
      fillStorage(maleGamesKey, this.maleGameCount);
      fillStorage(childrenGamesKey, this.childrenGameCount);
    });

    // Timeout ensures Canvas elements are ready in DOM
    setTimeout(() => {
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

    if (type === 'female' && this.femaleChart) this.femaleChart.destroy();
    if (type === 'male' && this.maleChart) this.maleChart.destroy();
    if (type === 'children' && this.childrenChart) this.childrenChart.destroy();
    if (type === 'activity' && this.activityChart) this.activityChart.destroy();

    const chart = new Chart(id, {
      type: 'bar',
      plugins: [ChartDataLabels],
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: color, borderRadius: 4, barThickness: 20 }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { right: 80 } },
        plugins: {
          legend: { display: false },
          datalabels: {
            anchor: 'end', align: 'right', color: 'white',
            formatter: (val: any) => `${val} (${((val / total) * 100).toFixed(1)}%)`
          }
        },
        scales: {
          x: { beginAtZero: true, grid: { display: false }, ticks: { color: '#94a3b8' } },
          y: { grid: { display: false }, ticks: { color: 'white' } }
        }
      }
    });

    if (type === 'female') this.femaleChart = chart;
    if (type === 'male') this.maleChart = chart;
    if (type === 'children') this.childrenChart = chart;
    if (type === 'activity') this.activityChart = chart;
  }
}