import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { TabViewModule } from 'primeng/tabview';

// Service
import { PredictionService } from '../../../@core/service/prediction.service';

@Component({
  selector: 'app-aliment-predictions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    CalendarModule,
    InputNumberModule,
    InputTextModule,
    TableModule,
    ChartModule,
    MessageModule,
    ProgressSpinnerModule,
    DividerModule,
    TagModule,
    TabViewModule
  ],
  templateUrl: './aliment-predictions.component.html',
  styleUrl: './aliment-predictions.component.scss'
})
export class AlimentPredictionsComponent implements OnInit {
  minDate: Date = new Date();

  @Input() modelTrained = false;
  @Output() modelTrainedEvent = new EventEmitter<void>();

  // Catégories
  categories = [
    { label: 'Énergétique', value: 'ÉNERGÉTIQUE', icon: 'pi pi-bolt' },
    { label: 'Protéine', value: 'PROTÉINE', icon: 'pi pi-box' },
    { label: 'Minéraux', value: 'MINÉRAUX', icon: 'pi pi-shield' },
    { label: 'Vitamines', value: 'VITAMINES', icon: 'pi pi-heart' }
  ];

  // Aliments communs
  alimentsCommuns = [
    { label: 'Maïs', value: 'maïs', categorie: 'ÉNERGÉTIQUE' },
    { label: 'Mil', value: 'mil', categorie: 'ÉNERGÉTIQUE' },
    { label: 'Sorgho', value: 'sorgho', categorie: 'ÉNERGÉTIQUE' },
    { label: 'Son de blé', value: 'son de blé', categorie: 'ÉNERGÉTIQUE' },
    { label: 'Soja', value: 'soja', categorie: 'PROTÉINE' },
    { label: 'Tourteau de soja', value: 'tourteau soja', categorie: 'PROTÉINE' },
    { label: 'Tourteau de coton', value: 'tourteau coton', categorie: 'PROTÉINE' },
    { label: 'Concentré', value: 'concentré', categorie: 'VITAMINES' },
    { label: 'Prémix', value: 'prémix', categorie: 'VITAMINES' },
    { label: 'CMV', value: 'cmv', categorie: 'MINÉRAUX' }
  ];

  // Prédiction unique
  selectedAliment = 'maïs';
  predictionDate: Date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  singlePrediction: any = null;
  loadingSinglePrediction = false;

  // Prédictions par catégorie
  selectedCategory = 'ÉNERGÉTIQUE';
  categoryPredictionDate: Date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  categoryPredictions: any = null;
  loadingCategoryPredictions = false;

  // Prédictions futures
  futureMonths = 3;
  futurePredictions: any[] = [];
  loadingFuturePredictions = false;

  // Graphique
  chartData: any = null;
  chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${this.formatNumber(context.parsed.y)} FCFA`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value: any) => {
            return this.formatNumber(value) + ' F';
          }
        }
      }
    }
  };

  // Training
  trainingModel = false;

  // Tab actif
  activeTabIndex = 0;

  constructor(private predictionService: PredictionService) {}

  ngOnInit(): void {
    if (this.modelTrained) {
      this.predictFuture();
    }
  }

  /**
   * Entraîner le modèle aliments
   */
  trainModel(): void {
    this.trainingModel = true;

    this.predictionService.trainAlimentModel().subscribe({
      next: (response) => {
        this.trainingModel = false;
        this.modelTrained = true;
        this.modelTrainedEvent.emit();
        alert(`✅ Modèle aliments entraîné avec succès !\n\nMAE: ${response.mae.toFixed(0)} FCFA\nR²: ${response.r2.toFixed(3)}`);
      },
      error: (err) => {
        this.trainingModel = false;
        const message = err.error?.detail || 'Erreur lors de l\'entraînement';
        alert(`❌ ${message}`);
      }
    });
  }

  /**
   * Prédire un aliment unique
   */
  predictSingle(): void {
    if (!this.modelTrained) {
      alert('⚠️ Le modèle doit être entraîné avant de faire des prédictions');
      return;
    }

    this.loadingSinglePrediction = true;
    const dateStr = this.formatDateToAPI(this.predictionDate);

    this.predictionService.predictAlimentPrice(this.selectedAliment, dateStr).subscribe({
      next: (data) => {
        this.singlePrediction = data;
        this.loadingSinglePrediction = false;
      },
      error: (err) => {
        this.loadingSinglePrediction = false;
        alert('❌ ' + (err.error?.detail || 'Erreur de prédiction'));
      }
    });
  }

  /**
   * Prédire par catégorie
   */
  predictByCategory(): void {
    if (!this.modelTrained) {
      alert('⚠️ Le modèle doit être entraîné avant de faire des prédictions');
      return;
    }

    this.loadingCategoryPredictions = true;
    const dateStr = this.formatDateToAPI(this.categoryPredictionDate);

    this.predictionService.predictAlimentByCategory(this.selectedCategory, dateStr).subscribe({
      next: (data) => {
        this.categoryPredictions = data;
        this.loadingCategoryPredictions = false;
      },
      error: (err) => {
        this.loadingCategoryPredictions = false;
        alert('❌ ' + (err.error?.detail || 'Erreur de prédiction'));
      }
    });
  }

  /**
   * Prédire sur plusieurs mois
   */
  predictFuture(): void {
    if (!this.modelTrained) {
      alert('⚠️ Le modèle doit être entraîné avant de faire des prédictions');
      return;
    }

    this.loadingFuturePredictions = true;

    this.predictionService.predictAlimentFuture(this.selectedAliment, this.futureMonths).subscribe({
      next: (response) => {
        this.futurePredictions = response.predictions;
        this.generateChart(response.predictions);
        this.loadingFuturePredictions = false;
      },
      error: (err) => {
        this.loadingFuturePredictions = false;
        alert('❌ ' + (err.error?.detail || 'Erreur de prédiction'));
      }
    });
  }

  /**
   * Génère le graphique
   */
  generateChart(predictions: any[]): void {
    const labels = predictions.map(p => this.formatDateFromAPI(p.date));
    const data = predictions.map(p => p.prix_predit);
    const min = predictions.map(p => p.intervalle_min);
    const max = predictions.map(p => p.intervalle_max);

    this.chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Prix prédit',
          data: data,
          borderColor: '#1976D2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#1976D2',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        },
        {
          label: 'Intervalle min',
          data: min,
          borderColor: '#FFA726',
          borderDash: [5, 5],
          fill: false,
          pointRadius: 3,
          tension: 0.4
        },
        {
          label: 'Intervalle max',
          data: max,
          borderColor: '#66BB6A',
          borderDash: [5, 5],
          fill: false,
          pointRadius: 3,
          tension: 0.4
        }
      ]
    };
  }

  /**
   * Retourne les aliments d'une catégorie
   */
  getAlimentsByCategory(category: string): any[] {
    return this.alimentsCommuns.filter(a => a.categorie === category);
  }

  /**
   * Formate une date pour l'API
   */
  formatDateToAPI(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Formate une date de l'API
   */
  formatDateFromAPI(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  /**
   * Formate un nombre
   */
  formatNumber(value: number): string {
    if (!value) return '0';
    return new Intl.NumberFormat('fr-FR').format(Math.round(value));
  }

  /**
   * Retourne la sévérité du badge catégorie
   */
  getCategorySeverity(categorie: string):
    'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined {

    const severities: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast'> = {
      'ÉNERGÉTIQUE': 'warning',
      'PROTÉINE': 'success',
      'MINÉRAUX': 'info',
      'VITAMINES': 'danger'
    };

    return severities[categorie] || 'secondary';
  }

  /**
   * Réinitialise les résultats
   */
  reset(): void {
    this.singlePrediction = null;
    this.categoryPredictions = null;
    this.futurePredictions = [];
    this.chartData = null;
  }

  /**
   * Retourne les clés d'un objet
   */
  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
}