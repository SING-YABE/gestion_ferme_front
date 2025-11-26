// src/app/components/chart/chart.component.ts
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit, OnChanges {
  @Input() chartData: any;
  @Input() height: string = '300px';

  public data: any;
  public options: any;
  public type: string = 'bar';

  ngOnInit() {
    this.updateChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['chartData']) {
      this.updateChart();
    }
  }

  private updateChart() {
    if (!this.chartData) return;

    this.type = this.chartData.type || 'bar';
    
    this.data = {
      labels: this.chartData.labels || [],
      datasets: this.chartData.datasets?.map((dataset: any, index: number) => ({
        label: dataset.label,
        data: dataset.data,
        backgroundColor: dataset.backgroundColor || this.getDefaultColors(index),
        borderColor: dataset.borderColor || this.getBorderColors(index),
        borderWidth: 1,
        fill: this.type === 'line'
      })) || []
    };

    this.options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        },
        title: {
          display: true,
          text: this.chartData.title || '',
          font: {
            size: 16,
            weight: 'bold'
          }
        }
      },
      scales: this.type === 'pie' || this.type === 'doughnut' ? {} : {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            borderDash: [3, 3]
          }
        }
      }
    };
  }

  private getDefaultColors(index: number): string {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];
    return colors[index % colors.length];
  }

  private getBorderColors(index: number): string {
    const colors = [
      '#1D4ED8', '#DC2626', '#047857', '#D97706', '#7C3AED',
      '#DB2777', '#0891B2', '#65A30D', '#EA580C', '#4F46E5'
    ];
    return colors[index % colors.length];
  }
}