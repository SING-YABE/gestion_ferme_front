import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Service
import { PredictionService } from '../../../@core/service/prediction.service';

@Component({
  selector: 'app-dashboard-global',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    SkeletonModule,
    TagModule,
    ChartModule,
    ProgressSpinnerModule
  ],
  templateUrl: './dashboard-global.component.html',
  styleUrl: './dashboard-global.component.scss'
})
export class DashboardGlobalComponent implements OnInit {

  @Output() refreshed = new EventEmitter<void>();

  // Loading states
  loading = true;
  loadingCards = [true, true, true, true, true, true, true, true];

  // Données cards
  statsAnimaux: any = null;
  statsAliments: any = null;
  tendanceGenerale: any = null;
  derniereExtraction: any = null;
  opportunites: any = null;
  accuracy: any = null;
  volumeSemaine: number = 0;
  periodeData: any = null;

  // Graphiques
  evolutionChartData: any = null;
  evolutionChartOptions: any = null;
  repartitionChartData: any = null;
  repartitionChartOptions: any = null;
  loadingCharts = true;

  constructor(private predictionService: PredictionService) {
    this.initChartOptions();
  }

  ngOnInit(): void {
    this.loadAllStats();
  }

  /**
   * Charge toutes les statistiques
   */
  loadAllStats(): void {
    this.loading = true;
    this.loadingCharts = true;

    // Card 1 : Stats animaux
    this.loadStatsAnimaux();

    // Card 2 : Stats aliments
    this.loadStatsAliments();

    // Card 3 : Tendance générale
    this.loadTendanceGenerale();

    // Card 4 : Dernière extraction
    this.loadDerniereExtraction();

    // Card 5 : Opportunités
    this.loadOpportunites();

    // Card 6 : Accuracy
    this.loadAccuracy();

    // Card 7 : Volume semaine (calculé depuis stats animaux)
    // Card 8 : Période (depuis stats animaux)

    // Graphes
    this.loadEvolutionChart();
    this.loadRepartitionChart();
  }

  /**
   * Card 1 : Stats animaux
   */
  loadStatsAnimaux(): void {
    this.predictionService.getStats().subscribe({
      next: (data) => {
        this.statsAnimaux = data;
        this.loadingCards[0] = false;
        
        // Calculer volume semaine (Card 7)
        this.volumeSemaine = data.total || 0;
        this.loadingCards[6] = false;

        // Période données (Card 8)
        this.periodeData = data.date_range;
        this.loadingCards[7] = false;

        this.checkLoadingComplete();
      },
      error: () => {
        this.loadingCards[0] = false;
        this.loadingCards[6] = false;
        this.loadingCards[7] = false;
      }
    });
  }

  /**
   * Card 2 : Stats aliments
   */
  loadStatsAliments(): void {
    this.predictionService.getAlimentStats().subscribe({
      next: (data) => {
        this.statsAliments = data;
        this.loadingCards[1] = false;
        this.checkLoadingComplete();
      },
      error: () => {
        this.loadingCards[1] = false;
      }
    });
  }

  /**
   * Card 3 : Tendance générale
   */
  loadTendanceGenerale(): void {
    this.predictionService.getTrends('porcelet', 7).subscribe({
      next: (data) => {
        this.tendanceGenerale = data;
        this.loadingCards[2] = false;
        this.checkLoadingComplete();
      },
      error: () => {
        this.loadingCards[2] = false;
      }
    });
  }

  /**
   * Card 4 : Dernière extraction
   */
  loadDerniereExtraction(): void {
    this.predictionService.getAllExtractions(0, 1).subscribe({
      next: (data) => {
        this.derniereExtraction = data.length > 0 ? data[0] : null;
        this.loadingCards[3] = false;
        this.checkLoadingComplete();
      },
      error: () => {
        this.loadingCards[3] = false;
      }
    });
  }

  /**
   * Card 5 : Opportunités
   */
  loadOpportunites(): void {
    this.predictionService.getOpportunities(80).subscribe({
      next: (data) => {
        this.opportunites = {
          total: data.length,
          economie_totale: data.reduce((sum: number, opp: any) => sum + opp.economie, 0)
        };
        this.loadingCards[4] = false;
        this.checkLoadingComplete();
      },
      error: () => {
        this.loadingCards[4] = false;
      }
    });
  }

  /**
   * Card 6 : Accuracy
   */
  loadAccuracy(): void {
    this.predictionService.getModelAccuracy(30).subscribe({
      next: (data) => {
        this.accuracy = data;
        this.loadingCards[5] = false;
        this.checkLoadingComplete();
      },
      error: () => {
        this.loadingCards[5] = false;
      }
    });
  }

  /**
   * Graphe 1 : Évolution globale
   */
  loadEvolutionChart(): void {
    this.predictionService.getPriceEvolution('porcelet', 'week').subscribe({
      next: (data) => {
        this.generateEvolutionChart(data);
        this.checkChartsLoading();
      },
      error: () => {
        this.checkChartsLoading();
      }
    });
  }

  /**
   * Graphe 2 : Répartition par type
   */
  loadRepartitionChart(): void {
    if (this.statsAnimaux && this.statsAnimaux.by_animal) {
      this.generateRepartitionChart(this.statsAnimaux.by_animal);
      this.checkChartsLoading();
    } else {
      // Attendre que statsAnimaux soit chargé
      setTimeout(() => {
        if (this.statsAnimaux && this.statsAnimaux.by_animal) {
          this.generateRepartitionChart(this.statsAnimaux.by_animal);
        }
        this.checkChartsLoading();
      }, 1000);
    }
  }

  /**
   * Génère le graphe d'évolution
   */
  generateEvolutionChart(data: any): void {
    if (!data || !data.evolution) return;

    const labels = data.evolution.map((item: any) => item.date);
    const values = data.evolution.map((item: any) => item.avg_price);

    this.evolutionChartData = {
      labels: labels,
      datasets: [
        {
          label: 'Prix moyen (FCFA)',
          data: values,
          borderColor: '#2E7D32',
          backgroundColor: 'rgba(46, 125, 50, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#2E7D32',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }
      ]
    };
  }

  /**
   * Génère le graphe de répartition
   */
  generateRepartitionChart(byAnimal: any): void {
    const labels = Object.keys(byAnimal).map(key => this.capitalize(key));
    const data = Object.values(byAnimal);
    const colors = ['#2E7D32', '#1976D2', '#F57C00', '#7B1FA2'];

    this.repartitionChartData = {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: colors.slice(0, labels.length),
          hoverBackgroundColor: colors.slice(0, labels.length).map(c => c + 'CC')
        }
      ]
    };
  }

  /**
   * Initialise les options des graphiques
   */
  initChartOptions(): void {
    this.evolutionChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: (value: any) => this.formatNumber(value) + ' F'
          }
        }
      }
    };

    this.repartitionChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    };
  }

  /**
   * Vérifie si le chargement est terminé
   */
  checkLoadingComplete(): void {
    if (this.loadingCards.every(load => !load)) {
      this.loading = false;
    }
  }

  /**
   * Vérifie si les graphiques sont chargés
   */
  checkChartsLoading(): void {
    if (this.evolutionChartData && this.repartitionChartData) {
      this.loadingCharts = false;
    }
  }

  /**
   * Rafraîchit toutes les données
   */
  refresh(): void {
    this.loadingCards = [true, true, true, true, true, true, true, true];
    this.loadAllStats();
    this.refreshed.emit();
  }

  /**
   * Formate un nombre
   */
  formatNumber(value: number): string {
    if (!value) return '0';
    return new Intl.NumberFormat('fr-FR').format(Math.round(value));
  }

  /**
   * Capitalise la première lettre
   */
  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Retourne la couleur de la tendance
   */
  getTendanceColor(tendance: string): string {
    if (!tendance) return '#999';
    if (tendance.toLowerCase().includes('hausse')) return '#2E7D32';
    if (tendance.toLowerCase().includes('baisse')) return '#D32F2F';
    return '#1976D2';
  }

  /**
   * Retourne l'icône de la tendance
   */
  getTendanceIcon(tendance: string): string {
    if (!tendance) return 'pi-minus';
    if (tendance.toLowerCase().includes('hausse')) return 'pi-arrow-up';
    if (tendance.toLowerCase().includes('baisse')) return 'pi-arrow-down';
    return 'pi-minus';
  }

  /**
   * Retourne le temps écoulé depuis une date
   */
  getTimeAgo(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `Il y a ${diffDays}j`;
    if (diffHours > 0) return `Il y a ${diffHours}h`;
    return 'Récent';
  }

  /**
   * Retourne les clés d'un objet
   */
  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
}