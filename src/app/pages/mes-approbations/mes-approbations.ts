// src/app/pages/mes-approbations/mes-approbations.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';

import { DemandeService, Demande, StatutDemande } from '../../@core/service/demande.service';
import { ApprobationService, EtapeValidationResponse } from '../../@core/service/approbation.service';
import { AuthService, LoginResponse } from '../../@core/service/auth.service';

@Component({
  selector: 'app-mes-approbations',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextareaModule,
    RadioButtonModule,
    FormsModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    ProgressBarModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './mes-approbations.html'
})
export class MesApprobationsComponent implements OnInit, OnDestroy {
  etapesEnAttente: EtapeValidationResponse[] = [];
  demandesAvecEtapes: Demande[] = [];
  
  displayValidationModal = false;
  displayDetailModal = false;
  
  // Validation
  etapeEnCours: EtapeValidationResponse | null = null;
  demandeEnCours: Demande | null = null;
  commentaireValidation: string = '';
  decision: 'VALIDE' | 'REJETEE' = 'VALIDE';

  // Détail
  demandeDetail: Demande | null = null;

  loading = false;
  utilisateurConnecte: LoginResponse | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private approbationService: ApprobationService,
    private demandeService: DemandeService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.initializeUser();
    this.loadEtapesEnAttente();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeUser() {
    this.utilisateurConnecte = this.authService.getCurrentUser();
    
    if (!this.utilisateurConnecte) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Session expirée',
        detail: 'Veuillez vous reconnecter'
      });
      this.authService.logout();
      return;
    }
  }

  loadEtapesEnAttente() {
    if (!this.utilisateurConnecte?.username) return;

    this.loading = true;

    this.approbationService.getEtapesEnAttente(this.utilisateurConnecte.username)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (etapes) => {
          this.etapesEnAttente = etapes;
          this.chargerDemandesAssociees(etapes);
        },
        error: (error) => {
          console.error('Erreur chargement étapes en attente:', error);
          this.loading = false;
          this.handleError('Erreur lors du chargement des approbations', error);
        }
      });
  }

  chargerDemandesAssociees(etapes: EtapeValidationResponse[]) {
    // Récupérer toutes les demandes associées aux étapes
    const demandeIds = [...new Set(etapes.map(etape => etape.demandeId).filter(id => id !== null))] as number[];
    
    if (demandeIds.length === 0) {
      this.loading = false;
      return;
    }

    // Charger chaque demande
    const demandesPromises = demandeIds.map(id => 
      this.demandeService.getById(id).toPromise()
    );

    Promise.all(demandesPromises)
      .then(demandes => {
        this.demandesAvecEtapes = demandes.filter(d => d !== undefined) as Demande[];
        this.loading = false;
      })
      .catch(error => {
        console.error('Erreur chargement demandes:', error);
        this.loading = false;
      });
  }

  // Ouvrir modal de validation
  openValidationModal(etape: EtapeValidationResponse) {
    const demandeAssociee = this.demandesAvecEtapes.find(d => d.idDemande === etape.demandeId);
    
    if (!demandeAssociee) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Demande non trouvée'
      });
      return;
    }

    this.etapeEnCours = etape;
    this.demandeEnCours = demandeAssociee;
    this.commentaireValidation = '';
    this.decision = 'VALIDE';
    this.displayValidationModal = true;
  }

  // Ouvrir modal de détail
  openDetailModal(demande: Demande) {
    this.demandeDetail = demande;
    this.displayDetailModal = true;
  }

  // Soumettre la décision
  soumettreDecision() {
    if (!this.etapeEnCours || !this.utilisateurConnecte?.username) return;

    const serviceCall = this.decision === 'VALIDE' 
      ? this.approbationService.validerEtape(this.etapeEnCours.idEtapeValidation, this.utilisateurConnecte.username)
      : this.approbationService.rejeterEtape(this.etapeEnCours.idEtapeValidation, this.utilisateurConnecte.username);

    serviceCall
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (etapeMiseAJour) => {
          // Mettre à jour la liste
          this.etapesEnAttente = this.etapesEnAttente.filter(
            e => e.idEtapeValidation !== etapeMiseAJour.idEtapeValidation
          );

          this.displayValidationModal = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: `Étape ${this.decision === 'VALIDE' ? 'validée' : 'rejetée'} avec succès`
          });

          // Recharger les données si nécessaire
          this.loadEtapesEnAttente();
        },
        error: (error) => {
          console.error('Erreur validation:', error);
          this.handleError('Erreur lors de la validation', error);
        }
      });
  }

  // Méthodes utilitaires
  getDemandePourEtape(etape: EtapeValidationResponse): Demande | undefined {
    return this.demandesAvecEtapes.find(d => d.idDemande === etape.demandeId);
  }

  getProgression(demande: Demande): number {
    if (demande.statut === StatutDemande.NON_SOUMISE) return 0;
    if (demande.statut === StatutDemande.REJETEE) return 0;
    
    const etapesValidees = demande.etapesValidation.filter(e => e.statut === 'VALIDE').length;
    return (etapesValidees / 3) * 100;
  }

  getEtapesValideesCount(demande: Demande): number {
    return demande.etapesValidation.filter(e => e.statut === 'VALIDE').length;
  }

  // Méthodes pour les statuts
  getStatutBadge(statut: StatutDemande): "success" | "info" | "warning" | "danger" | "secondary" {
    switch (statut) {
      case StatutDemande.NON_SOUMISE: return "secondary";
      case StatutDemande.EN_ATTENTE: return "warning";
      case StatutDemande.VALIDE: return "success";
      case StatutDemande.REJETEE: return "danger";
      default: return "secondary";
    }
  }

  getStatutLabel(statut: StatutDemande): string {
    switch (statut) {
      case StatutDemande.NON_SOUMISE: return 'Non soumise';
      case StatutDemande.EN_ATTENTE: return 'En attente';
      case StatutDemande.VALIDE: return 'Validée';
      case StatutDemande.REJETEE: return 'Rejetée';
      default: return statut;
    }
  }

  getEtapeIcon(statut: string): string {
    switch (statut) {
      case 'VALIDE': return 'pi pi-check-circle';
      case 'REJETEE': return 'pi pi-times-circle';
      case 'EN_ATTENTE': return 'pi pi-clock';
      default: return 'pi pi-circle';
    }
  }

  getEtapeColor(statut: string): string {
    switch (statut) {
      case 'VALIDE': return 'color: var(--green-500)';
      case 'REJETEE': return 'color: var(--red-500)';
      case 'EN_ATTENTE': return 'color: var(--orange-500)';
      default: return 'color: var(--gray-500)';
    }
  }

  getStatutValidationLabel(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'En attente';
      case 'VALIDE': return 'Validée';
      case 'REJETEE': return 'Rejetée';
      default: return statut;
    }
  }

  private handleError(message: string, error: any) {
    console.error(message, error);
    
    let detail = 'Une erreur est survenue';
    if (error.status === 401) {
      detail = 'Session expirée, veuillez vous reconnecter';
      this.authService.logout();
    } else if (error.status === 403) {
      detail = 'Accès non autorisé';
    } else if (error.status === 0) {
      detail = 'Impossible de contacter le serveur';
    }

    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: detail
    });
  }

  trackByEtapeId(index: number, etape: EtapeValidationResponse): number {
    return etape.idEtapeValidation;
  }

  trackByDemandeId(index: number, demande: Demande): number {
    return demande.idDemande;
  }
}