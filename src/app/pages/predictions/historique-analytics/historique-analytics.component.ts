import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';

// Service
import { PredictionService } from '../../../@core/service/prediction.service';

@Component({
  selector: 'app-historique-analytics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TabViewModule,
    TableModule,
    DropdownModule,
    InputNumberModule,
    ChartModule,
    TagModule,
    ProgressSpinnerModule,
    MessageModule
  ],
  templateUrl: './historique-analytics.component.html',
  styleUrl: './historique-analytics.component.scss'
})
export class HistoriqueAnalyticsComponent implements OnInit {

  // Sous-onglet actif
  activeSubTab = 0;

  // ===== HISTORIQUE EXTRACTIONS =====
  extractions: any[] = [];
  loadingExtractions = false;
  animalTypes = [
    { label: 'Tous', value: null },
    { label: 'Porcelet', value: 'porcelet' },
    { label: 'Porc', value: 'porc' },
    { label: 'Truie', value: 'truie' },
    { label: 'Verrat', value: 'verrat' }
  ];
  selectedAnimalFilter: string | null = null;

  // ===== ALIMENTS RÉCENTS =====
  alimentsRecents: any[] = [];
  loadingAliments = false;
  alimentCategories = [
    { label: 'Toutes', value: null },
    { label: 'Énergétique', value: 'ÉNERGÉTIQUE' },
    { label: 'Protéine', value: 'PROTÉINE' },
    { label: 'Minéraux', value: 'MINÉRAUX' },
    { label: 'Vitamines', value: 'VITAMINES' }
  ];
  selectedCategorieFilter: string | null = null;
  alimentDays = 7;

  // ===== TENDANCES =====
  tendances: any = null;
  loadingTendances = false;
  tendanceAnimal = 'porcelet';
  tendanceDays = 30;
  tendanceChartData: any = null;
  tendanceChartOptions: any = null;

  // ===== ÉVOLUTION =====
  evolution: any = null;
  loadingEvolution = false;
  evolutionAnimal = 'porcelet';
  evolutionPeriod = 'week';
  evolutionPeriods = [
    { label: 'Jour', value: 'day' },
    { label: 'Semaine', value: 'week' },
    { label: 'Mois', value: 'month' }
  ];
  evolutionChartData: any = null;
  evolutionChartOptions: any = null;

  // ===== ACCURACY =====
  accuracy: any = null;
  loadingAccuracy = false;
  accuracyDays = 30;

  constructor(private predictionService: PredictionService) {
    this.initChartOptions();
  }

  ngOnInit(): void {
    // Charger historique par défaut
    this.loadExtractions();
  }

  // ========== HISTORIQUE EXTRACTIONS ==========

  /**
   * Charge les extractions
   */
  loadExtractions(): void {
    this.loadingExtractions = true;

    const skip = 0;
    const limit = 100;

    if (this.selectedAnimalFilter) {
      this.predictionService.getExtractionsByAnimal(this.selectedAnimalFilter, limit).subscribe({
        next: (data) => {
          this.extractions = data;
          this.loadingExtractions = false;
        },
        error: () => {
          this.loadingExtractions = false;
        }
      });
    } else {
      this.predictionService.getAllExtractions(skip, limit).subscribe({
        next: (data) => {
          this.extractions = data;
          this.loadingExtractions = false;
        },
        error: () => {
          this.loadingExtractions = false;
        }
      });
    }
  }

  /**
   * Filtre par animal
   */
  filterByAnimal(): void {
    this.loadExtractions();
  }

  // ========== ALIMENTS RÉCENTS ==========

  /**
   * Charge les aliments récents
   */
  loadAlimentsRecents(): void {
    this.loadingAliments = true;

    this.predictionService.getRecentAliments(this.alimentDays, this.selectedCategorieFilter || undefined).subscribe({
      next: (data) => {
        this.alimentsRecents = data;
        this.loadingAliments = false;
      },
      error: () => {
        this.loadingAliments = false;
      }
    });
  }

  /**
   * Filtre aliments
   */
  filterAliments(): void {
    this.loadAlimentsRecents();
  }

  // ========== TENDANCES ==========

  /**
   * Charge les tendances
   */
  loadTendances(): void {
    this.loadingTendances = true;

    this.predictionService.getTrends(this.tendanceAnimal, this.tendanceDays).subscribe({
      next: (data) => {
        this.tendances = data;
        this.generateTendanceChart(data);
        this.loadingTendances = false;
      },
      error: () => {
        this.loadingTendances = false;
      }
    });
  }

  /**
   * Génère le graphique de tendance
   */
  generateTendanceChart(data: any): void {
    if (!data || !data.historique) return;

    const labels = data.historique.map((item: any) => item.date);
    const prices = data.historique.map((item: any) => item.avg_price);

    this.tendanceChartData = {
      labels: labels,
      datasets: [
        {
          label: `Prix ${this.tendanceAnimal}`,
          data: prices,
          borderColor: this.getTendanceChartColor(data.tendance),
          backgroundColor: this.getTendanceChartColor(data.tendance) + '20',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
  }

  /**
   * Retourne la couleur du graphe selon tendance
   */
  getTendanceChartColor(tendance: string): string {
    if (!tendance) return '#1976D2';
    if (tendance.toLowerCase().includes('hausse')) return '#2E7D32';
    if (tendance.toLowerCase().includes('baisse')) return '#D32F2F';
    return '#1976D2';
  }

  // ========== ÉVOLUTION ==========

  /**
   * Charge l'évolution
   */
  loadEvolution(): void {
    this.loadingEvolution = true;

    this.predictionService.getPriceEvolution(this.evolutionAnimal, this.evolutionPeriod).subscribe({
      next: (data) => {
        this.evolution = data;
        this.generateEvolutionChart(data);
        this.loadingEvolution = false;
      },
      error: () => {
        this.loadingEvolution = false;
      }
    });
  }

  /**
   * Génère le graphique d'évolution
   */
  generateEvolutionChart(data: any): void {
    if (!data || !data.evolution) return;

    const labels = data.evolution.map((item: any) => item.date || item.period);
    const avgPrices = data.evolution.map((item: any) => item.avg_price);
    const minPrices = data.evolution.map((item: any) => item.min_price);
    const maxPrices = data.evolution.map((item: any) => item.max_price);

    this.evolutionChartData = {
      labels: labels,
      datasets: [
        {
          label: 'Prix moyen',
          data: avgPrices,
          borderColor: '#2E7D32',
          backgroundColor: 'rgba(46, 125, 50, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 5
        },
        {
          label: 'Prix minimum',
          data: minPrices,
          borderColor: '#FFA726',
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
          pointRadius: 3
        },
        {
          label: 'Prix maximum',
          data: maxPrices,
          borderColor: '#66BB6A',
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
          pointRadius: 3
        }
      ]
    };
  }

  // ========== ACCURACY ==========

  /**
   * Charge l'accuracy
   */
  loadAccuracy(): void {
    this.loadingAccuracy = true;

    this.predictionService.getModelAccuracy(this.accuracyDays).subscribe({
      next: (data) => {
        this.accuracy = data;
        this.loadingAccuracy = false;
      },
      error: () => {
        this.loadingAccuracy = false;
      }
    });
  }

  // ========== CHART OPTIONS ==========

  /**
   * Initialise les options des graphiques
   */
  initChartOptions(): void {
    this.tendanceChartOptions = {
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

    this.evolutionChartOptions = { ...this.tendanceChartOptions };
  }

  // ========== UTILS ==========

  /**
   * Change de sous-onglet
   */
  onSubTabChange(event: any): void {
    this.activeSubTab = event.index;

    // Charger les données selon l'onglet
    switch (this.activeSubTab) {
      case 0:
        if (this.extractions.length === 0) this.loadExtractions();
        break;
      case 1:
        if (!this.tendances) this.loadTendances();
        break;
      case 2:
        if (!this.evolution) this.loadEvolution();
        break;
      case 3:
        if (!this.accuracy) this.loadAccuracy();
        break;
    }
  }

  /**
   * Formate un nombre
   */
  formatNumber(value: number): string {
    if (!value) return '0';
    return new Intl.NumberFormat('fr-FR').format(Math.round(value));
  }

  /**
   * Formate une date
   */
  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Capitalise
   */
  capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Retourne la sévérité du tag action
   */
  getActionSeverity(action: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined  {
    if (action === 'vente') return 'success';
    if (action === 'achat') return 'info';
    return 'secondary';
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
   * Retourne la sévérité de catégorie
   */
  getCategorieSeverity(categorie: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined  {
    const severities: any = {
      'ÉNERGÉTIQUE': 'warning',
      'PROTÉINE': 'success',
      'MINÉRAUX': 'info',
      'VITAMINES': 'danger'
    };
    return severities[categorie] || 'secondary';
  }
}