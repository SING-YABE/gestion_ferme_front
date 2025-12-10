import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';

import { PredictionService } from '../../../@core/service/prediction.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    SkeletonModule,
    TagModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  @Input() animalModelTrained = false;
  @Input() alimentModelTrained = false;
  @Output() refreshed = new EventEmitter<void>();

  // Données
  stats: any = null;
  alimentStats: any = null;
  loading = true;

  constructor(private predictionService: PredictionService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  /**
   * Charge les statistiques
   */
  loadStats(): void {
    this.loading = true;

    // Stats animaux
    this.predictionService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.checkLoadingComplete();
      },
      error: (err) => {
        console.error('Erreur chargement stats animaux:', err);
        this.checkLoadingComplete();
      }
    });

    // Stats aliments
    this.predictionService.getAlimentStats().subscribe({
      next: (data) => {
        this.alimentStats = data;
        this.checkLoadingComplete();
      },
      error: (err) => {
        console.error('Erreur chargement stats aliments:', err);
        this.checkLoadingComplete();
      }
    });
  }

  /**
   * Vérifie si le chargement est terminé
   */
  checkLoadingComplete(): void {
    if (this.stats && this.alimentStats) {
      this.loading = false;
    }
  }

  /**
   * Rafraîchit les données
   */
  refresh(): void {
    this.loadStats();
    this.refreshed.emit();
  }

  /**
   * Formate un nombre avec séparateurs
   */
  formatNumber(value: number): string {
    if (!value) return '0';
    return new Intl.NumberFormat('fr-FR').format(value);
  }

  /**
   * Retourne la couleur du statut modèle
   */
  getModelStatusSeverity(status: boolean): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
    return status ? 'success' : 'danger';
  }

  /**
   * Retourne le libellé du statut modèle
   */
  getModelStatusLabel(trained: boolean): string {
    return trained ? 'Entraîné' : 'Non entraîné';
  }

  /**
   * Retourne les clés d'un objet (pour *ngFor)
   */
  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
}