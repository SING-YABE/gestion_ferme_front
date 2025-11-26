import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { KpiResponseT, ProjectService, TtmKpiDTO } from '../../@core/service/project.service';
@Component({
  selector: 'app-ttm-dashboard',
  standalone: true,
  imports: [
    DialogModule,
    TableModule,
    ProgressSpinnerModule,
    TooltipModule,
    CommonModule,
    CardModule,
    ChartModule,
    TableModule,
    TagModule,
    ProgressBarModule,
    ButtonModule,
    TooltipModule,
    SkeletonModule,
    MessageModule,
    InputTextModule
  ],
  templateUrl: './ttm-dashboard.component.html',
  styleUrl: './ttm-dashboard.component.scss'
})
export class TtmDashboardComponent implements OnInit {

  ttmProjects: any[] = [];
  nonTtmProjects: any[] = [];
  displayDetailDialog = false;
detailDialogTitle = '';
projectDetails: any[] = [];
loadingDetails = false;

  kpiData: TtmKpiDTO | null = null;
  loading = false;
  error = false;
  kpiNonTtmData: TtmKpiDTO | null = null;
  loadingNonTtm = false;
  errorNonTtm = false;

// Graphiques hors TTM
statusChartDataNonTtm: any = {};
priorityChartDataNonTtm: any = {};
budgetChartDataNonTtm: any = {};

  // graphiques
  statusChartData: any = {};
  priorityChartData: any = {};
  budgetChartData: any = {};
  
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };
  
  // budget
  budgetChartOptions = {
    ...this.chartOptions,
    plugins: {
      ...this.chartOptions.plugins,
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XOF',
              minimumFractionDigits: 0
            }).format(context.parsed.y);
          }
        }
      }
    },
    scales: {
      ...this.chartOptions.scales,
      y: {
        ...this.chartOptions.scales.y,
        ticks: {
          callback: (value: any) => {
            return new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XOF',
              minimumFractionDigits: 0
            }).format(value);
          }
        }
      }
    }
  };

  constructor(private http: HttpClient, private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadKpiData();
      this.loadNonTtmKpiData(); 

  }

  loadKpiData(): void {
  this.loading = true;
  this.error = false;

  this.projectService.getKpisForTtmResponsable().subscribe({
    next: (response: KpiResponseT) => {
      this.kpiData = response.successful ? response.data : null;
      this.error = !response.successful;
      if (response.successful) this.prepareChartData();
      this.loading = false;
    },
    error: () => {
      this.error = true;
      this.loading = false;
    }
  });
}


loadNonTtmKpiData(): void {
  this.loadingNonTtm = true;
  this.errorNonTtm = false;

  this.projectService.getKpisForNonTtmResponsable().subscribe({
    next: (response:KpiResponseT) => {
      this.kpiNonTtmData = response.successful ? response.data : null;
      this.errorNonTtm = !response.successful;
      if (response.successful) this.prepareNonTtmChartData();
      this.loadingNonTtm = false;
    },
    error: () => {
      this.errorNonTtm = true;
      this.loadingNonTtm = false;
    }
  });
}

  refreshData(): void {
    this.loadKpiData();
  }

  // preprarre dash
  prepareChartData(): void {
    if (!this.kpiData) return;

    // histogrammes
    const statusCounts = this.countByField('status');
    this.statusChartData = {
      labels: Object.keys(statusCounts),
      datasets: [{
        label: 'Projets',
        data: Object.values(statusCounts),
        // backgroundColor: '#FF6600', 
        // borderColor: '#CC5200',
        backgroundColor: ['#FF4D4D', '#FFD633', '#4D94FF'], 
        borderColor: ['#CC0000', '#CC9900', '#0033CC'],

        borderWidth: 1
      }]
    };

    // G priorite 
    const priorityCounts = this.countByField('priority');
    this.priorityChartData = {
      labels: Object.keys(priorityCounts),
      datasets: [{
        label: 'Projets',
        data: Object.values(priorityCounts),
        backgroundColor: ['#FF4D4D', '#FFD633', '#4D94FF'], 
        borderColor: ['#CC0000', '#CC9900', '#0033CC'],

        borderWidth: 1
      }]
    };

    // G budget
    const projectsWithBudget = this.kpiData.ttmProjectDetails.filter(p => p.budgetGlobal !== null);
    this.budgetChartData = {
      labels: projectsWithBudget.map(p => this.truncateText(p.name, 15)),
      datasets: [{
        label: 'Budget Global',
        data: projectsWithBudget.map(p => p.budgetGlobal),
        backgroundColor: '#00CC66', 
        borderColor: '#009950',
        borderWidth: 1
      }]
    };
  }

  // Occurence 
private countByField(field: string): {[key: string]: number} {
  return this.kpiData!.ttmProjectDetails.reduce((acc, project) => {
    const value = project[field as keyof typeof project];
    const stringValue = String(value); 
    acc[stringValue] = (acc[stringValue] || 0) + 1;
    return acc;
  }, {} as {[key: string]: number});
}



  
  private truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  getStatusSeverity(status: string): string {
  const severityMap: { [key: string]: string } = {
    'planned': 'info',
    'in_progress': 'warning', 
    'completed': 'success',
    'cancelled': 'danger',
    'suspended': 'warning'
  };
  return severityMap[status.toLowerCase()] || 'info';
}

  getPrioritySeverity(priority: string): string {
  const severityMap: { [key: string]: string } = {
    'high': 'danger',
    'medium': 'warning',
    'low': 'info'
  };
  return severityMap[priority.toLowerCase()] || 'info';
}

  
  formatDate(dateArray: number[]): string {
    if (!dateArray || dateArray.length < 3) return 'N/A';
    
    const [year, month, day] = dateArray;
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  }

  
prepareNonTtmChartData(): void {
  if (!this.kpiNonTtmData) return;

  // Statuts hors TTM
  const statusCounts = this.countByFieldNonTtm('status');
  this.statusChartDataNonTtm = {
    labels: Object.keys(statusCounts),
    datasets: [{
      label: 'Projets',
      data: Object.values(statusCounts),
      backgroundColor: ['#FF4D4D', '#FFD633', '#4D94FF'], 
      borderColor: ['#CC0000', '#CC9900', '#0033CC'],

      borderWidth: 1
    }]
  };

  // Priorités hors TTM
  const priorityCounts = this.countByFieldNonTtm('priority');
  this.priorityChartDataNonTtm = {
    labels: Object.keys(priorityCounts),
    datasets: [{
      label: 'Projets',
      data: Object.values(priorityCounts),
      backgroundColor: ['#FF4D4D', '#FFD633', '#4D94FF'], 
      borderColor: ['#CC0000', '#CC9900', '#0033CC'],

      borderWidth: 1
    }]
  };

  // Budget hors TTM
  const projectsWithBudget = this.kpiNonTtmData.ttmProjectDetails.filter(p => p.budgetGlobal !== null);
  this.budgetChartDataNonTtm = {
    labels: projectsWithBudget.map(p => this.truncateText(p.name, 15)),
    datasets: [{
      label: 'Budget Global',
      data: projectsWithBudget.map(p => p.budgetGlobal),
      backgroundColor: '#00CC66',
      borderColor: '#009950',
      borderWidth: 1
    }]
  };
}

// Occurrence ttm
private countByFieldNonTtm(field: string): {[key: string]: number} {
  return this.kpiNonTtmData!.ttmProjectDetails.reduce((acc, project) => {
    const value = project[field as keyof typeof project];
    const stringValue = String(value);
    acc[stringValue] = (acc[stringValue] || 0) + 1;
    return acc;
  }, {} as {[key: string]: number});
}



showTtmProjectDetails(type: string, count: number) {
  if (count === 0) return;
  
  this.loadingDetails = true;
  this.displayDetailDialog = true;
  this.projectDetails = [];
  
  if (type === 'all') {
    this.detailDialogTitle = 'Tous les Projets TTM';
    this.projectDetails = this.kpiData?.ttmProjectDetails || [];
    this.loadingDetails = false;
    return;
  }
    let params: any = {};
  
  switch(type) {
    case 'late':
      this.detailDialogTitle = 'Projets TTM en Retard';
      params = { isLate: true };
      break;
    case 'suspended':
      this.detailDialogTitle = 'Projets TTM Suspendus';
      params = { isSuspended: true };
      break;
    case 'cancelled':
      this.detailDialogTitle = 'Projets TTM Annulés';
      params = { status: 'CANCELLED' };
      break;
    default:
      this.detailDialogTitle = 'Tous les Projets TTM';
      params = {};
  }
  
  this.projectService.getTtmProjectDetails(params.status, params.isLate, params.isSuspended)
    .subscribe({
      next: (response) => {
        this.projectDetails = response.data || [];
        this.loadingDetails = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des détails:', error);
        this.loadingDetails = false;
        this.projectDetails = [];
      }
    });
}

showNonTtmProjectDetails(type: string, count: number) {
  if (count === 0) return;
  
  this.loadingDetails = true;
  this.displayDetailDialog = true;
  this.projectDetails = [];
  
  if (type === 'all') {
    this.detailDialogTitle = 'Tous les Projets Hors TTM';
    this.projectDetails = this.kpiNonTtmData?.ttmProjectDetails || [];
    this.loadingDetails = false;
    return;
  }
  
  let params: any = {};
  
  switch(type) {
    case 'late':
      this.detailDialogTitle = 'Projets Hors TTM en retard';
      params = { isLate: true };
      break;
    case 'suspended':
      this.detailDialogTitle = 'Projets Hors TTM Suspendus';
      params = { isSuspended: true };
      break;
    case 'cancelled':
      this.detailDialogTitle = 'Projets Hors TTM Annulés';
      params = { status: 'CANCELLED' };
      break;
    default:
      this.detailDialogTitle = 'Tous les Projets Hors TTM';
      params = {};
  }
  
  this.projectService.getNonTtmProjectDetails(params.status, params.isLate, params.isSuspended)
    .subscribe({
      next: (response) => {
        this.projectDetails = response.data || [];
        this.loadingDetails = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des détails:', error);
        this.loadingDetails = false;
        this.projectDetails = [];
      }
    });
}

closeDetailDialog() {
  this.displayDetailDialog = false;
  this.projectDetails = [];
  this.detailDialogTitle = '';
}

isShowingAllProjects(): boolean {
  return this.detailDialogTitle === 'Tous les Projets TTM' || 
         this.detailDialogTitle === 'Tous les Projets Hors TTM';
}



}

