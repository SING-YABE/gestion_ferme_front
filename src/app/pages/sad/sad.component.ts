/**
 * SAD — Système d'Aide à la Décision
 * ====================================
 * Sources :
 *   - Alertes métier        → Python /api/advisor/alerts
 *   - KPI bruts             → Python /api/kpi/raw
 *   - Analyse/Chat Gemini   → Python /api/kpi/analyse + /kpi/question
 *   - Top soins             → Kotlin /api/soins/top-consommateurs
 *   - Bilan santé animal    → Kotlin /api/animaux/{id}/bilan-sante
 *   - ISSF                  → Kotlin /api/reproductions/issf
 */
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule }             from 'primeng/tag';
import { DividerModule }         from 'primeng/divider';
import { ToastModule }           from 'primeng/toast';
import { DialogModule }          from 'primeng/dialog';
import { MessageService }        from 'primeng/api';

import { HomeService, AdvisorAlert, AdvisorAlertsResponse } from '../../@core/service/home-service.service';
import { KpiService, KpiRaw, KpiAnalyseResponse,
         TopConsommateurDto, BilanSanteAnimalDto, IssfDto } from '../../@core/service/kpi.service';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  loading?: boolean;
}

@Component({
  selector: 'app-sad',
  standalone: true,
  imports: [CommonModule, FormsModule, ProgressSpinnerModule, TagModule,
            DividerModule, ToastModule, DialogModule],
  providers: [MessageService],
  templateUrl: './sad.component.html',
  styleUrls: ['./sad.component.scss']
})
export class SadComponent implements OnInit {

  @ViewChild('chatBottom') chatBottom!: ElementRef;

  // ── Alertes métier ─────────────────────────────────────────────────────────
  advisorAlerts: AdvisorAlert[] = [];
  advisorSummary: AdvisorAlertsResponse['summary'] | null = null;
  advisorLoading = false;
  advisorError: string | null = null;

  // ── KPI bruts Python ──────────────────────────────────────────────────────
  kpiLoading = false;
  kpiRaw: KpiRaw | null = null;
  kpiError: string | null = null;

  // ── ISSF Kotlin ───────────────────────────────────────────────────────────
  issfLoading = false;
  issfData: IssfDto | null = null;

  // ── Top soins Kotlin ──────────────────────────────────────────────────────
  topSoinsLoading = false;
  topSoins: TopConsommateurDto[] = [];

  // ── Bilan santé animal (dialog) ───────────────────────────────────────────
  bilanDialog = false;
  bilanLoading = false;
  bilanData: BilanSanteAnimalDto | null = null;

  // ── Analyse Gemini ────────────────────────────────────────────────────────
  analyseLoading = false;
  analyseTexte: string | null = null;
  analyseErreur: string | null = null;

  // ── Chat ──────────────────────────────────────────────────────────────────
  chatMessages: ChatMessage[] = [];
  questionTexte = '';
  chatLoading = false;

  suggestions = [
    'Pourquoi mon taux de prolificité est-il bas ?',
    'Comment interpréter mon ISSF de ' + '? jours ?',
    'Mon coût d\'alimentation est-il raisonnable ?',
    'Que faire pour améliorer le GMQ en saison sèche ?',
    'Comment réduire la mortalité des porcelets ?',
    'Quel animal dois-je réformer en priorité ?',
  ];

  constructor(
    private homeService: HomeService,
    private kpiService: KpiService,
    private toast: MessageService
  ) {}

  ngOnInit(): void {
    this.loadAdvisorAlerts();
    this.loadKpis();
    this.loadTopSoins();
    this.loadIssf();
    this.chatMessages.push({
      role: 'ai',
      text: 'Bonjour ! Je suis votre assistant élevage. Posez-moi une question sur vos indicateurs, votre alimentation, la reproduction ou la santé de votre troupeau.'
    });
  }

  // ── Loaders ────────────────────────────────────────────────────────────────

  loadAdvisorAlerts(): void {
    this.advisorLoading = true;
    this.homeService.getAdvisorAlerts().subscribe({
      next: res => {
        this.advisorLoading = false;
        if (res.error) { this.advisorError = res.error; return; }
        this.advisorAlerts = res.alerts;
        this.advisorSummary = res.summary;
      },
      error: () => { this.advisorLoading = false; this.advisorError = 'Backend Python indisponible.'; }
    });
  }

  loadKpis(): void {
    this.kpiLoading = true;
    this.kpiService.getKpisRaw().subscribe({
      next: res  => { this.kpiRaw = res; this.kpiLoading = false; },
      error: err => { this.kpiError = err.message; this.kpiLoading = false; }
    });
  }

  loadIssf(): void {
    this.issfLoading = true;
    this.kpiService.getIssf().subscribe({
      next: res  => { this.issfData = res; this.issfLoading = false; },
      error: ()  => this.issfLoading = false
    });
  }

  loadTopSoins(): void {
    this.topSoinsLoading = true;
    this.kpiService.getTopConsommateurs(8, 12).subscribe({
      next: res  => { this.topSoins = res; this.topSoinsLoading = false; },
      error: ()  => this.topSoinsLoading = false
    });
  }

  ouvrirBilanSante(animalId: number): void {
    this.bilanDialog = true;
    this.bilanLoading = true;
    this.bilanData = null;
    this.kpiService.getBilanSante(animalId).subscribe({
      next: res  => { this.bilanData = res; this.bilanLoading = false; },
      error: err => { this.bilanLoading = false; this.toast.add({ severity: 'error', summary: 'Erreur', detail: err.message }); }
    });
  }

  // ── Gemini ─────────────────────────────────────────────────────────────────

  lancerAnalyse(): void {
    this.analyseLoading = true;
    this.analyseTexte   = null;
    this.analyseErreur  = null;
    this.kpiService.getAnalyseLlm().subscribe({
      next: res => { this.analyseTexte = res.analyse; this.analyseErreur = res.erreur; this.analyseLoading = false; },
      error: err => { this.analyseErreur = err.message; this.analyseLoading = false; }
    });
  }

  // ── Chat ───────────────────────────────────────────────────────────────────

  envoyerQuestion(): void {
    const q = this.questionTexte.trim();
    if (!q || this.chatLoading) return;
    this.chatMessages.push({ role: 'user', text: q });
    this.chatMessages.push({ role: 'ai', text: '', loading: true });
    this.questionTexte = '';
    this.chatLoading = true;
    setTimeout(() => this.scrollChat(), 50);
    this.kpiService.poserQuestion(q).subscribe({
      next: res => {
        const last = this.chatMessages[this.chatMessages.length - 1];
        last.loading = false;
        last.text = res.analyse ?? res.erreur ?? 'Aucune réponse.';
        this.chatLoading = false;
        setTimeout(() => this.scrollChat(), 50);
      },
      error: err => {
        const last = this.chatMessages[this.chatMessages.length - 1];
        last.loading = false; last.text = err.message; this.chatLoading = false;
      }
    });
  }

  onEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); this.envoyerQuestion(); }
  }

  useSuggestion(s: string): void { this.questionTexte = s; this.envoyerQuestion(); }

  private scrollChat(): void { this.chatBottom?.nativeElement?.scrollIntoView({ behavior: 'smooth' }); }

  // ── Helpers ────────────────────────────────────────────────────────────────

  formatAnalyse(texte: string | null): string {
    if (!texte) return '';
    return texte
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^#{1,3}\s(.+)/gm, '<span class="llm-h">$1</span>')
      .replace(/\n/g, '<br>');
  }

  kpiSev(val: number | null, min: number, max?: number, inverse = false): 'success'|'warning'|'danger'|'secondary' {
    if (val === null || val === undefined) return 'secondary';
    if (inverse) {
      if (val <= min)        return 'success';
      if (val <= min * 1.3)  return 'warning';
      return 'danger';
    }
    const hi = max ?? Infinity;
    if (val >= min && val <= hi) return 'success';
    if (val >= min * 0.75)       return 'warning';
    return 'danger';
  }

  kpiLabel(sev: string): string {
    return sev === 'success' ? 'Bon' : sev === 'warning' ? 'Moyen' : sev === 'danger' ? 'Faible' : '—';
  }

  get suggestions_contexte(): string[] {
    const issf = this.issfData?.issfMoyenJours;
    return [
      'Pourquoi mon taux de prolificité est-il bas ?',
      issf ? `Mon ISSF est de ${issf} jours, que faire ?` : 'Comment améliorer l\'ISSF de mes truies ?',
      'Mon coût d\'alimentation est-il raisonnable ?',
      'Que faire pour améliorer le GMQ en saison sèche ?',
      'Comment réduire la mortalité des porcelets ?',
    ];
  }
}
