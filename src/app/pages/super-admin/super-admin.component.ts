import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../@core/service/auth.service';
import {
  SuperAdminService,
  PlatformStats,
  FermeAdminDTO,
  PlanConfig,
  PlanConfigForm,
  TransactionDTO,
} from '../../@core/service/super-admin.service';

type Tab = 'overview' | 'fermes' | 'plans' | 'transactions';

/** Formulaire réactif simplifié pour créer / modifier un PlanConfig. */
const defaultForm = (): PlanConfigForm => ({
  nom: '', description: null,
  prixFcfa: 0, dureeDays: 30, trialDays: 0,
  maxAnimaux: 20, maxUtilisateurs: 3, maxBatiments: 5,
  hasAssistantIA: false, hasAlertesSms: false,
  hasSyntheseComplete: false, hasExportPdf: false, hasPrevisionPrix: false,
  actif: true, ordre: 10,
});

@Component({
  selector: 'app-super-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './super-admin.component.html',
  styleUrl: './super-admin.component.scss',
})
export class SuperAdminComponent implements OnInit {

  // ── State général ─────────────────────────────────────────────────────────
  activeTab: Tab = 'overview';
  loading = true;

  // ── Données ───────────────────────────────────────────────────────────────
  stats: PlatformStats | null = null;
  fermes: FermeAdminDTO[] = [];
  plans:  PlanConfig[] = [];
  transactions: TransactionDTO[] = [];

  // ── Recherche ─────────────────────────────────────────────────────────────
  searchFerme = '';
  searchTx    = '';

  // ── Actions en cours ──────────────────────────────────────────────────────
  togglingFerme: string | null = null;
  togglingPlan:  number | null = null;
  deletingPlan:  number | null = null;
  savingPlan = false;
  assigningFerme: string | null = null;
  suspendingFerme: string | null = null;

  // ── Modal plan (créer / modifier) ─────────────────────────────────────────
  showPlanModal = false;
  editingPlan:   PlanConfig | null = null;
  planForm: PlanConfigForm = defaultForm();

  // ── Modal assigner plan à une ferme ──────────────────────────────────────
  showAssignModal = false;
  assignFerme: FermeAdminDTO | null = null;
  assignPlanId = 0;
  assignDuree  = 30;
  assignNotes  = '';

  constructor(
    private superAdminService: SuperAdminService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
  ) {}

  get profile() { return this.authService.getProfile(); }

  get initiales(): string {
    const p = this.profile;
    if (!p) return 'SA';
    return `${p.prenom?.charAt(0) ?? ''}${p.nom?.charAt(0) ?? ''}`.toUpperCase();
  }

  get tauxActivite(): number {
    if (!this.stats || this.stats.totalFermes === 0) return 0;
    return Math.round((this.stats.fermesActives / this.stats.totalFermes) * 100);
  }

  get filteredFermes(): FermeAdminDTO[] {
    if (!this.searchFerme.trim()) return this.fermes;
    const q = this.searchFerme.toLowerCase();
    return this.fermes.filter(f =>
      f.nomFerme.toLowerCase().includes(q) ||
      f.fermeCode.toLowerCase().includes(q)
    );
  }

  get filteredTx(): TransactionDTO[] {
    if (!this.searchTx.trim()) return this.transactions;
    const q = this.searchTx.toLowerCase();
    return this.transactions.filter(t =>
      t.nomFerme.toLowerCase().includes(q) ||
      t.planNom?.toLowerCase().includes(q) ||
      t.statut.toLowerCase().includes(q)
    );
  }

  get txRevenuTotal(): number {
    return this.transactions
      .filter(t => t.statut === 'SUCCESS')
      .reduce((s, t) => s + (t.montantAttendu ?? 0), 0);
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadOverview();
  }

  loadOverview(): void {
    this.loading = true;
    this.superAdminService.getStats().subscribe({
      next:  s => { this.stats = s; },
      error: () => this.toastr.error('Impossible de charger les statistiques'),
    });
    this.superAdminService.getFermes().subscribe({
      next:  f => { this.fermes = f; this.loading = false; },
      error: () => { this.loading = false; this.toastr.error('Impossible de charger les fermes'); }
    });
  }

  switchTab(tab: Tab): void {
    this.activeTab = tab;
    if (tab === 'plans' && !this.plans.length)        this.loadPlans();
    if (tab === 'transactions' && !this.transactions.length) this.loadTransactions();
  }

  loadPlans(): void {
    this.superAdminService.getPlans().subscribe({
      next:  p => { this.plans = p; },
      error: () => this.toastr.error('Impossible de charger les plans'),
    });
  }

  loadTransactions(): void {
    this.loading = true;
    this.superAdminService.getTransactions().subscribe({
      next:  t => { this.transactions = t; this.loading = false; },
      error: () => { this.loading = false; this.toastr.error('Impossible de charger les transactions'); }
    });
  }

  // ── Fermes ────────────────────────────────────────────────────────────────

  toggleFerme(ferme: FermeAdminDTO): void {
    this.togglingFerme = ferme.fermeCode;
    this.superAdminService.toggleFerme(ferme.fermeCode).subscribe({
      next: res => {
        ferme.active = res.active;
        this.togglingFerme = null;
        if (this.stats) {
          this.stats.fermesActives = this.fermes.filter(f => f.active).length;
        }
        this.toastr.success(res.message);
      },
      error: () => { this.togglingFerme = null; this.toastr.error('Erreur lors du changement de statut'); }
    });
  }

  openAssignModal(ferme: FermeAdminDTO): void {
    if (!this.plans.length) this.loadPlans();
    this.assignFerme  = ferme;
    this.assignPlanId = this.plans[0]?.id ?? 0;
    this.assignDuree  = 30;
    this.assignNotes  = '';
    this.showAssignModal = true;
  }

  submitAssign(): void {
    if (!this.assignFerme) return;
    this.assigningFerme = this.assignFerme.fermeCode;
    this.superAdminService.assignPlan(this.assignFerme.fermeCode, {
      planId:    this.assignPlanId,
      dureeDays: this.assignDuree,
      notes:     this.assignNotes || undefined,
    }).subscribe({
      next: res => {
        this.toastr.success(res.message, 'Plan attribué');
        this.assigningFerme = null;
        this.showAssignModal = false;
        this.loadOverview();
      },
      error: err => {
        this.assigningFerme = null;
        this.toastr.error(err.error?.error || "Erreur lors de l'attribution");
      }
    });
  }

  toggleSuspendSub(ferme: FermeAdminDTO): void {
    if (!confirm(`Confirmer ${ferme.subscriptionStatut === 'SUSPENDED' ? 'la levée de suspension' : 'la suspension'} de ${ferme.nomFerme} ?`)) return;
    this.suspendingFerme = ferme.fermeCode;
    this.superAdminService.toggleSuspendSubscription(ferme.fermeCode).subscribe({
      next: res => {
        ferme.subscriptionStatut = res.statut;
        this.suspendingFerme = null;
        this.toastr.success(res.message);
      },
      error: err => {
        this.suspendingFerme = null;
        this.toastr.error(err.error?.error || 'Erreur');
      }
    });
  }

  // ── Plans CRUD ────────────────────────────────────────────────────────────

  openCreatePlan(): void {
    this.editingPlan  = null;
    this.planForm     = defaultForm();
    this.showPlanModal = true;
  }

  openEditPlan(plan: PlanConfig): void {
    this.editingPlan = plan;
    this.planForm = {
      nom: plan.nom, description: plan.description,
      prixFcfa: plan.prixFcfa, dureeDays: plan.dureeDays, trialDays: plan.trialDays,
      maxAnimaux: plan.maxAnimaux, maxUtilisateurs: plan.maxUtilisateurs, maxBatiments: plan.maxBatiments,
      hasAssistantIA: plan.hasAssistantIA, hasAlertesSms: plan.hasAlertesSms,
      hasSyntheseComplete: plan.hasSyntheseComplete, hasExportPdf: plan.hasExportPdf,
      hasPrevisionPrix: plan.hasPrevisionPrix,
      actif: plan.actif, ordre: plan.ordre,
    };
    this.showPlanModal = true;
  }

  savePlan(): void {
    this.savingPlan = true;
    const obs = this.editingPlan
      ? this.superAdminService.updatePlan(this.editingPlan.id, this.planForm)
      : this.superAdminService.createPlan(this.planForm);

    obs.subscribe({
      next: plan => {
        this.savingPlan    = false;
        this.showPlanModal = false;
        if (this.editingPlan) {
          const idx = this.plans.findIndex(p => p.id === plan.id);
          if (idx >= 0) this.plans[idx] = plan;
        } else {
          this.plans = [...this.plans, plan].sort((a, b) => a.ordre - b.ordre);
        }
        this.toastr.success(`Plan "${plan.nom}" ${this.editingPlan ? 'mis à jour' : 'créé'}.`);
      },
      error: err => {
        this.savingPlan = false;
        this.toastr.error(err.error?.error || 'Erreur lors de la sauvegarde');
      }
    });
  }

  togglePlanActif(plan: PlanConfig): void {
    this.togglingPlan = plan.id;
    this.superAdminService.togglePlanActif(plan.id).subscribe({
      next: res => {
        plan.actif = res.actif;
        this.togglingPlan = null;
        this.toastr.success(res.message);
      },
      error: () => { this.togglingPlan = null; this.toastr.error('Erreur'); }
    });
  }

  deletePlan(plan: PlanConfig): void {
    if (!confirm(`Supprimer le plan "${plan.nom}" ? Cette action est irréversible.`)) return;
    this.deletingPlan = plan.id;
    this.superAdminService.deletePlan(plan.id).subscribe({
      next: res => {
        this.plans = this.plans.filter(p => p.id !== plan.id);
        this.deletingPlan = null;
        this.toastr.success(res.message);
      },
      error: err => {
        this.deletingPlan = null;
        this.toastr.error(err.error?.error || 'Impossible de supprimer ce plan');
      }
    });
  }

  // ── Helpers UI ────────────────────────────────────────────────────────────

  farmColor(code: string): string {
    const colors = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#0ea5e9'];
    let hash = 0;
    for (let i = 0; i < code.length; i++) hash = code.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  subBadgeClass(statut: string | null): string {
    const map: Record<string, string> = {
      TRIAL: 'trial', ACTIVE: 'active', GRACE: 'grace',
      EXPIRED: 'expired', SUSPENDED: 'suspended', CANCELLED: 'cancelled',
    };
    return statut ? (map[statut] ?? 'muted') : 'muted';
  }

  txBadgeClass(statut: string): string {
    if (statut === 'SUCCESS') return 'active';
    if (statut === 'FAILED' || statut === 'INVALID_OTP') return 'expired';
    return 'muted';
  }

  formatPrix(n: number): string {
    return n === 0 ? 'Gratuit' : `${n.toLocaleString('fr-FR')} FCFA`;
  }

  formatLimit(n: number): string {
    return n === -1 ? '∞' : String(n);
  }

  formatDuree(days: number): string {
    if (days >= 360) return '1 an';
    if (days >= 85)  return `${Math.round(days / 30)} mois`;
    return `${days}j`;
  }

  logout(): void { this.authService.logout(); }
}
