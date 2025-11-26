// src/app/pages/mes-assignations/mes-assignations.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';

import { AssignationService, AssignationResponse } from '../../@core/service/assignation.service';
import { EquipementService, Equipement, StatutEquipement } from '../../@core/service/equipement.service';
import { AuthService, LoginResponse } from '../../@core/service/auth.service';

@Component({
  selector: 'app-mes-assignations',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    DropdownModule,
    FormsModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './mes-assignations.html'
})
export class MesAssignationsComponent implements OnInit, OnDestroy {
  mesAssignations: AssignationResponse[] = [];
  mesAssignationsFiltrees: AssignationResponse[] = [];
  
  // Modales
  displaySelectionModal = false;
  displayConfirmationModal = false;
  
  // Données pour les modales
  assignationEnCours: AssignationResponse | null = null;
  equipementsDisponibles: Equipement[] = [];
  equipementSelectionne: number | null = null;

  // Filtres
  statutFiltre: string = 'TOUS';
  loading = false;

  utilisateurConnecte: LoginResponse | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private assignationService: AssignationService,
    private equipementService: EquipementService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.initializeUser();
    this.loadMesAssignations();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeUser() {
    this.utilisateurConnecte = this.authService.getCurrentUser();
  }

  loadMesAssignations() {
    if (!this.utilisateurConnecte?.id) return;
    
    this.loading = true;
    this.assignationService.getMesAssignations(this.utilisateurConnecte.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.mesAssignations = data;
          this.mesAssignationsFiltrees = [...data];
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Erreur chargement assignations:', error);
          this.loading = false;
          this.handleError('Erreur lors du chargement des assignations', error);
        }
      });
  }

  // Ouvrir modal pour choisir équipement
  openSelectionModal(assignation: AssignationResponse) {
    this.assignationEnCours = assignation;
    this.equipementSelectionne = null;
    
    // Charger les équipements disponibles pour cette catégorie
    if (assignation.categorieId) {
      this.equipementService.getEquipementsDisponiblesParCategorie(assignation.categorieId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (equipements: Equipement[]) => {
            this.equipementsDisponibles = equipements;
          },
          error: (error: any) => {
            console.error('Erreur chargement équipements:', error);
            this.equipementsDisponibles = [];
          }
        });
    } else {
      this.equipementsDisponibles = [];
    }
    
    this.displaySelectionModal = true;
  }

  // Sélectionner l'équipement seulement
  selectionnerEquipement() {
    if (!this.assignationEnCours || !this.equipementSelectionne) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez sélectionner un équipement'
      });
      return;
    }

    this.assignationService.selectionnerEquipement(this.assignationEnCours.idAssignation, this.equipementSelectionne)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.displaySelectionModal = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Équipement sélectionné avec succès'
          });
          this.loadMesAssignations();
        },
        error: (error: any) => {
          this.handleError('Erreur lors de la sélection de l\'équipement', error);
        }
      });
  }

  // Ouvrir modal de confirmation
  openConfirmationModal(assignation: AssignationResponse) {
    this.assignationEnCours = assignation;
    this.displayConfirmationModal = true;
  }

  // Confirmer l'assignation
  confirmerAssignation() {
    if (!this.assignationEnCours) return;

    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir confirmer cette assignation ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.assignationService.confirmerAssignation(this.assignationEnCours!.idAssignation)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (updated) => {
              this.displayConfirmationModal = false;
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Assignation confirmée avec succès'
              });
              this.loadMesAssignations();
            },
            error: (error: any) => {
              this.handleError('Erreur lors de la confirmation', error);
            }
          });
      }
    });
  }

  // Annuler une assignation
  annulerAssignation(assignation: AssignationResponse) {
    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir annuler cette assignation ?',
      header: 'Confirmation d\'annulation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.assignationService.annulerAssignation(assignation.idAssignation)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (updated) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Assignation annulée avec succès'
              });
              this.loadMesAssignations();
            },
            error: (error: any) => {
              this.handleError('Erreur lors de l\'annulation', error);
            }
          });
      }
    });
  }

  // Filtrer les assignations
  filtrerAssignations() {
    if (this.statutFiltre === 'TOUS') {
      this.mesAssignationsFiltrees = [...this.mesAssignations];
    } else {
      this.mesAssignationsFiltrees = this.mesAssignations.filter(a => a.statut === this.statutFiltre);
    }
  }

  // Méthodes utilitaires
  getStatutBadge(statut: string): "success" | "info" | "warning" | "danger" | "secondary" {
    switch (statut) {
      case 'EN_ATTENTE': return "warning";
      case 'CONFIRMEE': return "success";
      case 'ANNULEE': return "danger";
      default: return "secondary";
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'En attente';
      case 'CONFIRMEE': return 'Confirmée';
      case 'ANNULEE': return 'Annulée';
      default: return statut;
    }
  }

  // Un gestionnaire peut sélectionner un équipement si l'assignation est en attente et qu'il n'y a pas encore d'équipement
  peutSelectionnerEquipement(assignation: AssignationResponse): boolean {
    return assignation.statut === 'EN_ATTENTE' && assignation.equipementId === null;
  }

  // Un gestionnaire peut confirmer si l'assignation est en attente et qu'un équipement est sélectionné
  peutConfirmer(assignation: AssignationResponse): boolean {
    return assignation.statut === 'EN_ATTENTE' && assignation.equipementId !== null;
  }

  private handleError(message: string, error: any) {
    console.error(message, error);
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Une erreur est survenue'
    });
  }

  trackByAssignationId(index: number, assignation: AssignationResponse): number {
    return assignation.idAssignation;
  }
}