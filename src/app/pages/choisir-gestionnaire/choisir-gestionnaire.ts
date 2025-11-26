// src/app/pages/choisir-gestionnaire/choisir-gestionnaire.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';

import { AssignationService, AssignationResponse } from '../../@core/service/assignation.service';
import { UtilisateurService, Utilisateur } from '../../@core/service/utilisateur.service';
import { AuthService, LoginResponse } from '../../@core/service/auth.service';

@Component({
  selector: 'app-choisir-gestionnaire',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    DropdownModule,
    FormsModule,
    TagModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './choisir-gestionnaire.html'
})
export class ChoisirGestionnaireComponent implements OnInit, OnDestroy {
  assignationsSansGestionnaire: AssignationResponse[] = [];
  displayModal = false;
  assignationEnCours: AssignationResponse | null = null;
  gestionnaires: Utilisateur[] = [];
  gestionnaireSelectionne: number | null = null;
  loading = false;
  utilisateurConnecte: LoginResponse | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private assignationService: AssignationService,
    private utilisateurService: UtilisateurService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.initializeUser();
    this.loadAssignationsSansGestionnaire();
    this.loadGestionnaires();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeUser() {
    this.utilisateurConnecte = this.authService.getCurrentUser();
  }

  loadAssignationsSansGestionnaire() {
    this.loading = true;
    this.assignationService.getAssignationsSansGestionnaire()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.assignationsSansGestionnaire = data;
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Erreur chargement assignations:', error);
          this.loading = false;
          this.handleError('Erreur lors du chargement des assignations', error);
        }
      });
  }

  loadGestionnaires() {
    this.utilisateurService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.gestionnaires = data.filter(user => 
            user.role?.nom?.toUpperCase() === 'GESTIONNAIRE'
          );
        },
        error: (error: any) => {
          console.error('Erreur chargement gestionnaires:', error);
        }
      });
  }

  openModal(assignation: AssignationResponse) {
    this.assignationEnCours = assignation;
    this.gestionnaireSelectionne = null;
    this.displayModal = true;
  }

  choisirGestionnaire() {
    if (!this.assignationEnCours || !this.gestionnaireSelectionne) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez sélectionner un gestionnaire'
      });
      return;
    }

    this.assignationService.choisirGestionnaire(this.assignationEnCours.idAssignation, this.gestionnaireSelectionne)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.displayModal = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Gestionnaire assigné avec succès'
          });
          this.loadAssignationsSansGestionnaire();
        },
        error: (error: any) => {
          this.handleError('Erreur lors de l\'assignation du gestionnaire', error);
        }
      });
  }

  private handleError(message: string, error: any) {
    console.error(message, error);
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Une erreur est survenue'
    });
  }
}