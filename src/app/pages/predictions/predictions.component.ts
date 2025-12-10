import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Components enfants
import { DashboardComponent } from './dashboard/dashboard.component';
import { AnimalPredictionsComponent } from './animal-predictions/animal-predictions.component';
import { AlimentPredictionsComponent } from './aliment-predictions/aliment-predictions.component';
import { OpportunitiesComponent } from './opportunities/opportunities.component';

import { PredictionService } from '../../@core/service/prediction.service';

@Component({
  selector: 'app-predictions',
  standalone: true,
  imports: [
    CommonModule,
    TabViewModule,
    ToastModule,
    DashboardComponent,
    AnimalPredictionsComponent,
    AlimentPredictionsComponent,
    OpportunitiesComponent
  ],
  providers: [MessageService],
  templateUrl: './predictions.component.html',
  styleUrl: './predictions.component.scss'
})
export class PredictionsComponent implements OnInit {

  // État des modèles
  animalModelTrained = false;
  alimentModelTrained = false;
  
  // Index onglet actif
  activeTabIndex = 0;

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
        // Si on a des stats, le modèle existe
        this.animalModelTrained = data.total > 0;
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

  /**
   * Callback quand le dashboard est rafraîchi
   */
  onDashboardRefreshed(): void {
    this.checkModelsStatus();
  }
}