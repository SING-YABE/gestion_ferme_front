import { Component } from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core';
import { ProjectService, ProjectKpiData } from '../../@core/service/project.service';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { CommonModule, DecimalPipe } from '@angular/common';
import { NgIf } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { BadgeModule } from 'primeng/badge';
import { ProgressBarModule } from 'primeng/progressbar';
interface CardState {
  isLoading: boolean;
  isLoaded: boolean;
}

@Component({
  selector: 'app-kpi',
  standalone: true,
  imports: [
BadgeModule,
    CommonModule,
    NgIf,
    DecimalPipe,
    MessageModule,
    ProgressBarModule,
    ChartModule,
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
    MessagesModule
  ],
  templateUrl: './kpi.component.html',
  styleUrl: './kpi.component.scss'
})

export class KpiComponent implements OnInit {
  kpiData: ProjectKpiData | null = null;
  selectedStatus: string | null = null;
  isLoading = false;
  statusChartData: any = null;
  priorityChartData: any = null;
  isDirector = false; 
  departmentChartData: any = null;
  
chartOptions = {
  plugins: {
    legend: {
      labels: {
        usePointStyle: true,
        color: '#495057'
      }
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      cornerRadius: 4,
      displayColors: true,
      titleFont: {
        size: 14,
        weight: 'bold'
      },
      bodyFont: {
        size: 12
      }
    }
  },
  responsive: true,
  maintainAspectRatio: false,
  aspectRatio: 0.8,
  interaction: {
    intersect: false,
    mode: 'index'
  }
};
  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadKpiData();
  }

  loadKpiData(): void {
  this.isLoading = true;

  this.projectService.getKpisForUser()
    .pipe(finalize(() => this.isLoading = false))
    .subscribe({
      next: (res) => {
        if (!res.successful) return;

        this.kpiData = res.data;

        // si directeur
        this.isDirector = !!this.kpiData.projectsByDepartment;
        this.statusChartData = {
          labels: ['Etude', 'En cours', 'Terminé', 'Annulé', 'Suspendu'],
          datasets: [
            {
              label: 'Projets par statut',
              backgroundColor: ['#FFA726', '#42A5F5', '#66BB6A', '#EF5350', '#AB47BC'],
              data: [
                this.kpiData.projectByStatus.PLANNED || 0,
                this.kpiData.projectByStatus.IN_PROGRESS || 0,
                this.kpiData.projectByStatus.COMPLETED || 0,
                this.kpiData.projectByStatus.CANCELED || 0,
                this.kpiData.projectByStatus.SUSPENDED || 0
              ]
            }
          ]
        };

        this.priorityChartData = {
          labels: ['Basse', 'Moyenne', 'Haute'],
          datasets: [
            {
              label: 'Projets par priorité',
              backgroundColor: ['#4CAF50', '#FF9800', '#F44336'],
              data: [
                this.kpiData.projectByPriority.LOW || 0,
                this.kpiData.projectByPriority.MEDIUM || 0,
                this.kpiData.projectByPriority.HIGH || 0
              ]
            }
          ]
        };

        if (this.isDirector && this.kpiData.projectsByDepartment) {
          const labels = Object.keys(this.kpiData.projectsByDepartment);
          const data = Object.values(this.kpiData.projectsByDepartment);

          this.departmentChartData = {
            labels,
            datasets: [
              {
                label: 'Projets par département',
                backgroundColor: '#42A5F5',
                data
              }
            ]
          };
        }
      }
    });
}

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  }

  changeDisplayedStatus(status: string): void {
    this.selectedStatus = status;
    console.log('projet/status :', status);
  }
}
