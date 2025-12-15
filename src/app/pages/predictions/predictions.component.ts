import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Components enfants
import { DashboardGlobalComponent } from './dashboard-global/dashboard-global.component';
import { AnimalPredictionsComponent } from './animal-predictions/animal-predictions.component';
import { AlimentPredictionsComponent } from './aliment-predictions/aliment-predictions.component';
import { OpportunitiesComponent } from './opportunities/opportunities.component';
import { ExtractionComponent } from './extraction/extraction.component';
import { HistoriqueAnalyticsComponent } from './historique-analytics/historique-analytics.component';

// Service
import { PredictionService } from '../../@core/service/prediction.service';

@Component({
  selector: 'app-predictions',
  standalone: true,
  imports: [
    CommonModule,
    TabViewModule,
    ToastModule,
    DashboardGlobalComponent,
    AnimalPredictionsComponent,
    AlimentPredictionsComponent,
    OpportunitiesComponent,
    ExtractionComponent,
    HistoriqueAnalyticsComponent
  ],
  providers: [MessageService],
  templateUrl: './predictions.component.html',
  styleUrl: './predictions.component.scss'
})
export class PredictionsComponent implements OnInit {

  // Onglet actif
  activeTabIndex = 0;

  // État des modèles
  animalModelTrained = false;
  alimentModelTrained = false;

  constructor(
    private predictionService: PredictionService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.checkModelsStatus();
  }

  /**
   * Vérifie si les modèles ML sont entraînés
   */
  checkModelsStatus(): void {
    // Check modèle animaux
    this.predictionService.getStats().subscribe({
      next: (data) => {
        // Si on a des stats, le modèle existe probablement
        this.animalModelTrained = data.total_prices > 0;
      },
      error: () => {
        this.animalModelTrained = false;
      }
    });

    // Check modèle aliments
    this.predictionService.getAlimentModelStats().subscribe({
      next: (data) => {
        this.alimentModelTrained = data.is_trained;
      },
      error: () => {
        this.alimentModelTrained = false;
      }
    });
  }

  /**
   * Callback quand un modèle est entraîné
   */
  onModelTrained(type: 'animal' | 'aliment'): void {
    if (type === 'animal') {
      this.animalModelTrained = true;
      this.showSuccess('Modèle animaux entraîné avec succès');
    } else {
      this.alimentModelTrained = true;
      this.showSuccess('Modèle aliments entraîné avec succès');
    }
  }

  /**
   * Callback quand une extraction est effectuée
   */
  onDataExtracted(): void {
    this.showSuccess('Données extraites avec succès');
    this.checkModelsStatus();
  }

  /**
   * Callback quand le dashboard est rafraîchi
   */
  onDashboardRefreshed(): void {
    this.checkModelsStatus();
  }

  /**
   * Change d'onglet
   */
  onTabChange(event: any): void {
    this.activeTabIndex = event.index;
  }

  /**
   * Affiche un message de succès
   */
  showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Succès',
      detail: message,
      life: 3000
    });
  }

  /**
   * Affiche un message d'erreur
   */
  showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: message,
      life: 5000
    });
  }
}