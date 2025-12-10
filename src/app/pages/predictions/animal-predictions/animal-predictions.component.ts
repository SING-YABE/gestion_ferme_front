import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';

// Service
import { PredictionService } from '../../../@core/service/prediction.service';

@Component({
  selector: 'app-animal-predictions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    CalendarModule,
    InputNumberModule,
    TableModule,
    ChartModule,
    MessageModule,
    ProgressSpinnerModule,
    DividerModule,
    TagModule
  ],
  templateUrl: './animal-predictions.component.html',
  styleUrl: './animal-predictions.component.scss',
})
export class AnimalPredictionsComponent implements OnInit {
  minDate: Date = new Date();

  @Input() modelTrained = false;
  @Output() modelTrainedEvent = new EventEmitter<void>();

  // Options
  animalTypes = [
    { label: 'Porcelet', value: 'porcelet', icon: 'pi pi-star' },
    { label: 'Porc', value: 'porc', icon: 'pi pi-circle' },
    { label: 'Truie', value: 'truie', icon: 'pi pi-heart' },
    { label: 'Verrat', value: 'verrat', icon: 'pi pi-shield' }
  ];

  // Prédiction unique
  selectedAnimal = 'porcelet';
  predictionDate: Date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // +30 jours
  singlePrediction: any = null;
  loadingSinglePrediction = false;

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

  constructor(private predictionService: PredictionService) {}

  ngOnInit(): void {
    // Auto-load si modèle entraîné
    if (this.modelTrained) {
      this.predictFuture();
    }
  }

  /**
   * Entraîner le modèle animaux
   */
  trainModel(): void {
    this.trainingModel = true;

    this.predictionService.trainAnimalModel().subscribe({
      next: (response) => {
        this.trainingModel = false;
        this.modelTrained = true;
        this.modelTrainedEvent.emit();
        alert(`✅ Modèle entraîné avec succès !\n\nMAE: ${response.mae.toFixed(0)} FCFA\nR²: ${response.r2.toFixed(3)}`);
      },
      error: (err) => {
        this.trainingModel = false;
        const message = err.error?.detail || 'Erreur lors de l\'entraînement';
        alert(`❌ ${message}`);
      }
    });
  }

  /**
   * Prédire un prix unique
   */
  predictSingle(): void {
    if (!this.modelTrained) {
      alert('⚠️ Le modèle doit être entraîné avant de faire des prédictions');
      return;
    }

    this.loadingSinglePrediction = true;
    const dateStr = this.formatDateToAPI(this.predictionDate);

    this.predictionService.predictAnimalPrice(this.selectedAnimal, dateStr).subscribe({
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
   * Prédire sur plusieurs mois
   */
  predictFuture(): void {
    if (!this.modelTrained) {
      alert('⚠️ Le modèle doit être entraîné avant de faire des prédictions');
      return;
    }

    this.loadingFuturePredictions = true;

    this.predictionService.predictAnimalFuture(this.selectedAnimal, this.futureMonths).subscribe({
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
          borderColor: '#2E7D32',
          backgroundColor: 'rgba(46, 125, 50, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#2E7D32',
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
   * Formate une date pour l'API (YYYY-MM-DD)
   */
  formatDateToAPI(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Formate une date de l'API (YYYY-MM-DD) vers format lisible
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
   * Formate un nombre avec séparateurs
   */
  formatNumber(value: number): string {
    if (!value) return '0';
    return new Intl.NumberFormat('fr-FR').format(Math.round(value));
  }

  /**
   * Retourne la sévérité du tag confiance
   */
  getConfidenceSeverity(confiance: string):
    'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined {

    if (confiance.includes('cascade')) return 'success';
    if (confiance.includes('moyenne')) return 'info';
    return 'warning';
  }


  /**
   * Réinitialise les résultats
   */
  reset(): void {
    this.singlePrediction = null;
    this.futurePredictions = [];
    this.chartData = null;
  }
}