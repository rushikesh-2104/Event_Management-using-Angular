import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { Chart } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent {
  data: any[] = [];

  // TOP CARDS
  totalParticipants = 0;
  totalGameEntries = 0;
  totalEventEntries = 0;

  // DATA STORAGE
  femaleGameCount: { [key: string]: number } = {};
  maleGameCount: { [key: string]: number } = {};
  childrenGameCount: { [key: string]: number } = {};
  activityStats: { [key: string]: number } = {}; // New storage for Activity chart

  // CHART REFERENCES
  femaleChart: any;
  maleChart: any;
  childrenChart: any;
  activityChart: any; // New reference

  onFileUpload(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      this.data = XLSX.utils.sheet_to_json(sheet);
      this.processData();
    };
    reader.readAsBinaryString(file);
  }

  processData(): void {
    if (!this.data || this.data.length === 0) return;

    this.totalParticipants = this.data.length;
    this.totalGameEntries = 0;
    this.totalEventEntries = 0;
    this.femaleGameCount = {};
    this.maleGameCount = {};
    this.childrenGameCount = {};
    this.activityStats = {}; 

    this.data.forEach(row => {
      const keys = Object.keys(row);
      
      // KEY DETECTION
      const overallGamesKey = keys.find(k => {
        const key = k.toLowerCase();
        return key.includes('which games') && !key.includes('female') && !key.includes('male') && !key.includes('children') && !key.includes('kids');
      });

      const femaleGamesKey = keys.find(k => k.toLowerCase().includes('which games') && k.toLowerCase().includes('female'));
      const maleGamesKey = keys.find(k => k.toLowerCase().includes('which games') && k.toLowerCase().includes('male') && !k.toLowerCase().includes('female'));
      const childrenGamesKey = keys.find(k => k.toLowerCase().includes('which games') && (k.toLowerCase().includes('children') || k.toLowerCase().includes('kids')));
      const activitiesKey = keys.find(k => k.toLowerCase().includes('which activity')); // Detects the "Which activity are you interested in?" column

      // 1. Total Game Selections Card
      if (overallGamesKey && row[overallGamesKey]) {
        const val = String(row[overallGamesKey]);
        if (!val.toLowerCase().includes('none')) {
          this.totalGameEntries += val.split(',').filter(g => g.trim().length > 0).length;
        }
      }

      // 2. Total Event Selections Card & Activity Chart Data
      if (activitiesKey && row[activitiesKey]) {
        const val = String(row[activitiesKey]);
        if (!val.toLowerCase().includes('none')) {
          const items = val.split(',').map(a => a.trim()).filter(a => a.length > 0);
          this.totalEventEntries += items.length;
          
          // Populate the specific activity stats for the chart
          items.forEach(item => {
            this.activityStats[item] = (this.activityStats[item] || 0) + 1;
          });
        }
      }

      // 3. Process Other Chart Data (Female, Male, Kids)
      const fillStorage = (key: string | undefined, storage: any) => {
        if (key && row[key]) {
          String(row[key]).split(',').forEach(g => {
            const name = g.trim();
            if (!name) return;
            if (name.toLowerCase().includes('none')) {
              storage['NONE (Male/Skipped)'] = (storage['NONE (Male/Skipped)'] || 0) + 1;
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

    // Render all charts
    this.renderChart('femaleChart', this.femaleGameCount, '#a855f7', 'female');
    this.renderChart('maleChart', this.maleGameCount, '#3b82f6', 'male');
    this.renderChart('childrenChart', this.childrenGameCount, '#f59e0b', 'children');
    this.renderChart('activityChart', this.activityStats, '#10b981', 'activity'); // New Emerald Green color for activities
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
            formatter: (val) => `${val} (${((val / total) * 100).toFixed(1)}%)`
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