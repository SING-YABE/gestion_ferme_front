import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { MessageService, ConfirmationService } from 'primeng/api';
import {
  TacheService, TacheResponse, TacheCreateDTO, TypeTache,
  TypeTacheCreateDTO, AssignationTache, UtilisateurLight, TacheStats
} from '../../@core/service/tache.service';

type TagSeverity = 'success'|'info'|'warning'|'danger'|'secondary';

@Component({
  selector: 'app-taches',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DatePipe,
    TabViewModule, TableModule, ButtonModule, DialogModule,
    InputTextModule, InputTextareaModule, DropdownModule,
    CalendarModule, TagModule, BadgeModule, ChipModule,
    ToastModule, ConfirmDialogModule, MultiSelectModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './taches.component.html',
  styleUrl: './taches.component.scss'
})
export class TachesComponent implements OnInit {

  // ── Données ────────────────────────────────────────────────────────────────
  tachesJour: TacheResponse[]    = [];
  tachesAVenir: TacheResponse[]  = [];
  tachesPassees: TacheResponse[] = [];
  tachesAValider: TacheResponse[]= [];
  typesTaches: TypeTache[]       = [];
  utilisateurs: UtilisateurLight[]= [];
  stats: TacheStats | null        = null;

  // ── Modales ────────────────────────────────────────────────────────────────
  showFormTache      = false;
  showDetailTache    = false;
  showFormType       = false;
  showValiderModal   = false;
  showInvaliderModal = false;
  isEditMode         = false;

  selectedTache: TacheResponse | null      = null;
  selectedAssignation: AssignationTache | null = null;

  // ── Formulaire tâche ───────────────────────────────────────────────────────
  formTache: TacheCreateDTO = this.emptyTacheForm();
  formDate: Date | null = null;

  // ── Formulaire type ────────────────────────────────────────────────────────
  formType: TypeTacheCreateDTO = { nom: '', description: '', couleur: '#2d8a4e', icone: 'pi pi-check' };
  editTypeId: number | null = null;

  // ── Validation ─────────────────────────────────────────────────────────────
  commentaireValidation = '';

  // ── Options dropdowns ──────────────────────────────────────────────────────
  prioriteOptions = [
    { label: '🔴 Haute',   value: 'HAUTE' },
    { label: '🟡 Normale', value: 'NORMALE' },
    { label: '🟢 Basse',   value: 'BASSE' },
  ];
  recurrenceOptions = [
    { label: 'Unique',        value: 'UNIQUE' },
    { label: 'Quotidienne',   value: 'QUOTIDIENNE' },
    { label: 'Hebdomadaire',  value: 'HEBDOMADAIRE' },
    { label: 'Mensuelle',     value: 'MENSUELLE' },
  ];
  iconeOptions = [
    'pi pi-check','pi pi-heart','pi pi-refresh','pi pi-chart-bar',
    'pi pi-heart-fill','pi pi-arrow-right-arrow-left','pi pi-wrench','pi pi-box',
    'pi pi-sun','pi pi-shield','pi pi-star','pi pi-bolt'
  ];

  constructor(
    private tacheService: TacheService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() { this.chargerTout(); }

  chargerTout() {
    this.tacheService.tachesJourAdmin().subscribe({ next: d => this.tachesJour = d, error: () => {} });
    this.tacheService.tachesAVenirAdmin().subscribe({ next: d => this.tachesAVenir = d, error: () => {} });
    this.tacheService.tachesPasseesAdmin().subscribe({ next: d => this.tachesPassees = d, error: () => {} });
    this.tacheService.tachesAValider().subscribe({ next: d => this.tachesAValider = d, error: () => {} });
    this.tacheService.getTypesTaches().subscribe({ next: d => this.typesTaches = d, error: () => {} });
    this.tacheService.getAssignables().subscribe({ next: d => this.utilisateurs = d, error: () => {} });
    this.tacheService.stats().subscribe({ next: d => this.stats = d, error: () => {} });
  }
  ouvrirPreuve(url: string): void {
  window.open(url, '_blank');
}

  // ── CRUD Tâches ────────────────────────────────────────────────────────────

  ouvrirCreation() {
    this.isEditMode = false;
    this.formTache = this.emptyTacheForm();
    this.formDate = null;
    this.showFormTache = true;
  }

  ouvrirEdition(t: TacheResponse) {
    this.isEditMode = true;
    this.selectedTache = t;
    this.formDate = new Date(t.dateEcheance);
    this.formTache = {
      titre: t.titre, description: t.description,
      typeTacheId: t.typeTache?.id ?? null,
      priorite: t.priorite, dateEcheance: t.dateEcheance,
      recurrence: t.recurrence, joursRecurrence: t.joursRecurrence,
      batiment: t.batiment, box: t.box, notes: t.notes,
      assigneeIds: t.assignations.map(a => a.assignee.id)
    };
    this.showFormTache = true;
  }

  soumettreTache() {
    if (!this.formDate) return;
    this.formTache.dateEcheance = this.formDate.toISOString();

    const obs = this.isEditMode && this.selectedTache
      ? this.tacheService.modifierTache(this.selectedTache.id, this.formTache)
      : this.tacheService.creerTache(this.formTache);

    obs.subscribe({
      next: () => { this.showFormTache = false; this.chargerTout(); this.toast('success', 'Tâche enregistrée'); },
      error: () => this.toast('error', 'Erreur lors de l\'enregistrement')
    });
  }

  confirmerSuppression(t: TacheResponse) {
    this.confirmationService.confirm({
      message: `Supprimer la tâche "${t.titre}" ?`,
      header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer', acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.tacheService.supprimerTache(t.id).subscribe({
          next: () => { this.chargerTout(); this.toast('success', 'Tâche supprimée'); },
          error: () => this.toast('error', 'Erreur lors de la suppression')
        });
      }
    });
  }

  ouvrirDetail(t: TacheResponse) { this.selectedTache = t; this.showDetailTache = true; }

  // ── Validation ─────────────────────────────────────────────────────────────

  ouvrirValider(a: AssignationTache) {
    this.selectedAssignation = a;
    this.commentaireValidation = '';
    this.showValiderModal = true;
  }

  ouvrirInvalider(a: AssignationTache) {
    this.selectedAssignation = a;
    this.commentaireValidation = '';
    this.showInvaliderModal = true;
  }

  confirmerValidation() {
    if (!this.selectedAssignation) return;
    this.tacheService.valider(this.selectedAssignation.id, this.commentaireValidation).subscribe({
      next: () => { this.showValiderModal = false; this.chargerTout(); this.toast('success', 'Tâche validée ✓'); },
      error: () => this.toast('error', 'Erreur lors de la validation')
    });
  }

  confirmerInvalidation() {
    if (!this.selectedAssignation || !this.commentaireValidation.trim()) {
      this.toast('warn', 'Le commentaire est obligatoire pour invalider');
      return;
    }
    this.tacheService.invalider(this.selectedAssignation.id, this.commentaireValidation).subscribe({
      next: () => { this.showInvaliderModal = false; this.chargerTout(); this.toast('success', 'Tâche invalidée'); },
      error: () => this.toast('error', 'Erreur lors de l\'invalidation')
    });
  }

  // ── Types de tâches ────────────────────────────────────────────────────────

  ouvrirCreationType() { this.editTypeId = null; this.formType = { nom:'', description:'', couleur:'#2d8a4e', icone:'pi pi-check' }; this.showFormType = true; }

  ouvrirEditionType(t: TypeTache) {
    this.editTypeId = t.id;
    this.formType = { nom: t.nom, description: t.description, couleur: t.couleur, icone: t.icone };
    this.showFormType = true;
  }

  soumettreType() {
    const obs = this.editTypeId
      ? this.tacheService.modifierTypeTache(this.editTypeId, this.formType)
      : this.tacheService.creerTypeTache(this.formType);
    obs.subscribe({
      next: () => { this.showFormType = false; this.tacheService.getTypesTaches().subscribe(d => this.typesTaches = d); this.toast('success', 'Type enregistré'); },
      error: () => this.toast('error', 'Erreur')
    });
  }

  supprimerType(t: TypeTache) {
    this.confirmationService.confirm({
      message: `Supprimer le type "${t.nom}" ?`, header: 'Confirmation',
      acceptLabel: 'Supprimer', acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.tacheService.supprimerTypeTache(t.id).subscribe({
        next: () => { this.tacheService.getTypesTaches().subscribe(d => this.typesTaches = d); this.toast('success', 'Type supprimé'); }
      })
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  statutSeverity(statut: string): TagSeverity {
    const m: Record<string,TagSeverity> = {
      A_FAIRE:'secondary', EN_COURS:'info', EN_ATTENTE_VALIDATION:'warning',
      VALIDEE:'success', INVALIDEE:'danger', EXPIREE:'danger'
    };
    return m[statut] ?? 'secondary';
  }

  statutLabel(statut: string): string {
    const m: Record<string,string> = {
      A_FAIRE:'À faire', EN_COURS:'En cours', EN_ATTENTE_VALIDATION:'À valider',
      VALIDEE:'Validée', INVALIDEE:'Invalidée', EXPIREE:'Expirée'
    };
    return m[statut] ?? statut;
  }

  prioriteLabel(p: string): string { return { HAUTE:'🔴 Haute', NORMALE:'🟡 Normale', BASSE:'🟢 Basse' }[p] ?? p; }
  prioriteSeverity(p: string): TagSeverity { return { HAUTE:'danger', NORMALE:'warning', BASSE:'success' }[p] as TagSeverity ?? 'secondary'; }

  typeTacheOptions() { return this.typesTaches.map(t => ({ label: t.nom, value: t.id })); }
  utilisateursOptions() { return this.utilisateurs.map(u => ({ label: `${u.prenom} ${u.nom}`, value: u.id })); }

  estEnAttenteValidation(t: TacheResponse) { return t.assignations.some(a => a.statut === 'EN_ATTENTE_VALIDATION'); }

  private emptyTacheForm(): TacheCreateDTO {
    return { titre:'', description:'', typeTacheId:null, priorite:'NORMALE',
      dateEcheance:'', recurrence:'UNIQUE', joursRecurrence:null,
      batiment:null, box:null, notes:null, assigneeIds:[] };
  }

  private toast(severity: string, detail: string) {
    this.messageService.add({ severity, summary: severity === 'success' ? 'Succès' : severity === 'warn' ? 'Attention' : 'Erreur', detail, life: 4000 });
  }
}
