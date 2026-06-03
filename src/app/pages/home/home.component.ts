import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { FormsModule } from '@angular/forms';
import {
  HomeService, StatsReproductions, AlerteMiseBas,
  PourcentageTypeCharge, AnimalCountByType, SyntheseFinanciere, TacheStats
} from '../../@core/service/home-service.service';
import { AuthService } from '../../@core/service/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ChartModule, TagModule, BadgeModule, RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  venteChartData: any = null;
  anneeSelectionnee: number = new Date().getFullYear();
  anneesDisponibles: number[] = [2023, 2024, 2025, 2026];
  prenom = '';
  today  = new Date();

  // Stats reproduction
  stats: StatsReproductions | null = null;
  alertesMiseBas: AlerteMiseBas[] = [];

  // Animaux
  totalAnimaux = 0;
  animauxParType: AnimalCountByType[] = [];

  // Finance
  synthese: SyntheseFinanciere | null = null;
  chargesData: PourcentageTypeCharge[] = [];

  // Tâches
  tacheStats: TacheStats | null = null;
  tachesAValider: any[] = [];
  tachesJour: any[] = [];

  // Charts
  chargesPieData: any   = null;
  chargesOptions: any   = null;

  // Alertes IA
  advisorAlerts: any[]  = [];
  advisorError: string | null = null;

  loading = true;

  constructor(
    private homeService: HomeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.prenom = this.authService.getProfile()?.prenom ?? '';
    this.loadAll();
  }

    get advisorSummary() {
    if (!this.advisorAlerts.length) return null;
    return {
      by_level: {
        critical: this.advisorAlerts.filter(a => a.level === 'critical').length,
        warning:  this.advisorAlerts.filter(a => a.level === 'warning').length,
      }
    };
  }

  loadEvolutionVentes(): void {
  }

  loadAll(): void {
    this.loading = true;

    // Chargement en parallèle
    forkJoin({
      stats:          this.homeService.getStatsReproductions(),
      alertes:        this.homeService.getAlertes(),
      total:          this.homeService.getTotalAnimaux(),
      parType:        this.homeService.getAnimauxParType(),
      synthese:       this.homeService.getSynthese(),
      charges:        this.homeService.getPourcentageParType(),
      tacheStats:     this.homeService.getTacheStats(),
      tachesValider:  this.homeService.getTachesAValider(),
      tachesJour:     this.homeService.getTachesJour(),
    }).subscribe({
      next: (res) => {
        this.stats         = res.stats;
        this.alertesMiseBas= res.alertes;
        this.totalAnimaux  = res.total;
        this.animauxParType= res.parType;
        this.synthese      = res.synthese;
        this.chargesData   = res.charges;
        this.tacheStats    = res.tacheStats;
        this.tachesAValider= res.tachesValider;
        this.tachesJour    = res.tachesJour;
        this.buildChartesPie();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

    // Alertes IA (backend Python séparé)
    this.homeService.getAdvisorAlerts().subscribe({
      next: r => { this.advisorAlerts = r.alerts?.slice(0, 4) ?? []; },
      error: () => {}
    });
  }

  buildChartesPie(): void {
    if (!this.chargesData.length) return;
    const COLORS = ['#16a34a','#2563eb','#d97706','#7c3aed','#0891b2','#dc2626','#78716c','#ca8a04'];
    this.chargesPieData = {
      labels: this.chargesData.map(c => c.typeDepense),
      datasets: [{
        data: this.chargesData.map(c => c.montant),
        backgroundColor: COLORS.slice(0, this.chargesData.length),
        borderWidth: 2, borderColor: '#fff'
      }]
    };
    this.chargesOptions = {
      plugins: {
        legend: { position: 'right', labels: { font: { size: 12 }, boxWidth: 14 } },
        tooltip: {
          callbacks: {
            label: (ctx: any) => {
              const c = this.chargesData[ctx.dataIndex];
              return ` ${c.typeDepense} : ${c.montant.toLocaleString('fr-FR')} FCFA (${c.pourcentage?.toFixed(1) ?? '?'}%)`;
            }
          }
        }
      },
      cutout: '55%',
    };
  }

  formatMontant(v: number | undefined): string {
    if (!v) return '—';
    return v.toLocaleString('fr-FR') + ' FCFA';
  }

  get joursRestantsBadge(): string {
    if (!this.alertesMiseBas.length) return '';
    const proche = this.alertesMiseBas.find(a => a.joursRestants <= 3);
    return proche ? `⚠️ ${proche.joursRestants}j` : '';
  }

  statutTacheLabel(s: string): string {
    return { A_FAIRE:'À faire', EN_COURS:'En cours', EN_ATTENTE_VALIDATION:'À valider',
      VALIDEE:'Validée', INVALIDEE:'Invalidée', EXPIREE:'Expirée' }[s] ?? s;
  }

  statutTacheSeverity(s: string): string {
    return { A_FAIRE:'secondary', EN_COURS:'info', EN_ATTENTE_VALIDATION:'warning',
      VALIDEE:'success', INVALIDEE:'danger', EXPIREE:'danger' }[s] ?? 'secondary';
  }
}
