import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';

// Service
import { PredictionService } from '../../../@core/service/prediction.service';

@Component({
  selector: 'app-opportunities',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    InputNumberModule,
    MessageModule,
    ProgressSpinnerModule,
    DividerModule,
    TooltipModule
  ],
  templateUrl: './opportunities.component.html',
  styleUrl: './opportunities.component.scss'
})
export class OpportunitiesComponent implements OnInit {

  @Input() modelTrained = false;

  // Données
  opportunities: any[] = [];
  loading = false;
  minScore = 80;

  // Statistiques
  totalOpportunities = 0;
  avgEconomie = 0;
  bestDeal: any = null;

  constructor(private predictionService: PredictionService) {}

  ngOnInit(): void {
    if (this.modelTrained) {
      this.loadOpportunities();
    }
  }

  /**
   * Charge les opportunités
   */
  loadOpportunities(): void {
    if (!this.modelTrained) {
      alert('⚠️ Le modèle doit être entraîné pour détecter les opportunités');
      return;
    }

    this.loading = true;

    this.predictionService.getOpportunities(this.minScore).subscribe({
      next: (data) => {
        this.opportunities = data;
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        alert('❌ ' + (err.error?.detail || 'Erreur chargement opportunités'));
      }
    });
  }

  /**
   * Calcule les statistiques
   */
  calculateStats(): void {
    this.totalOpportunities = this.opportunities.length;

    if (this.totalOpportunities > 0) {
      // Moyenne économie
      const totalEconomie = this.opportunities.reduce((sum, opp) => sum + opp.economie, 0);
      this.avgEconomie = totalEconomie / this.totalOpportunities;

      // Meilleure affaire
      this.bestDeal = this.opportunities.reduce((best, opp) => 
        opp.score > best.score ? opp : best
      );
    } else {
      this.avgEconomie = 0;
      this.bestDeal = null;
    }
  }

  /**
   * Retourne la sévérité du score
   */
  getScoreSeverity(score: number): 
    'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined {

    if (score >= 90) return 'success';
    if (score >= 80) return 'info';
    if (score >= 70) return 'warning';
    return 'danger';
  }

  /**
   * Retourne la couleur de l'évaluation
   */
  getEvaluationColor(evaluation: string): string {
    if (evaluation.includes('🔥')) return '#2E7D32';
    if (evaluation.includes('⭐')) return '#1976D2';
    if (evaluation.includes('✅')) return '#43A047';
    return '#666';
  }

  /**
   * Retourne l'icône de l'animal
   */
  getAnimalIcon(animal: string): string {
    const icons: any = {
      'porcelet': 'pi-star',
      'porc': 'pi-circle',
      'truie': 'pi-heart',
      'verrat': 'pi-shield'
    };
    return icons[animal] || 'pi-tag';
  }

  /**
   * Formate un nombre
   */
  formatNumber(value: number): string {
    if (!value) return '0';
    return new Intl.NumberFormat('fr-FR').format(Math.round(value));
  }

  /**
   * Formate un pourcentage
   */
  formatPercent(value: number): string {
    return value.toFixed(1) + '%';
  }

  /**
   * Réinitialise les filtres
   */
  reset(): void {
    this.minScore = 80;
    this.loadOpportunities();
  }

  /**
   * Exporte en CSV (optionnel)
   */
  exportCSV(): void {
    if (this.opportunities.length === 0) {
      alert('⚠️ Aucune donnée à exporter');
      return;
    }

    // Créer CSV
    const headers = ['ID', 'Animal', 'Prix', 'Score', 'Évaluation', 'Économie', 'Économie %'];
    const rows = this.opportunities.map(opp => [
      opp.price_id,
      opp.animal_type,
      opp.prix,
      opp.score,
      opp.evaluation,
      opp.economie,
      opp.economie_pct
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Télécharger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `opportunites_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  get totalEconomy(): number {
    if (!this.opportunities || this.opportunities.length === 0) return 0;
    return this.opportunities.reduce((sum, o) => sum + o.economie, 0);
  }
}