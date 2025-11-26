import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';

import { DemandeService, Demande, DemandeDTO, StatutDemande, StatutValidation } from '../../@core/service/demande.service';
import { CategorieService, Categorie } from '../../@core/service/categorie.service';
import { UtilisateurService, Utilisateur } from '../../@core/service/utilisateur.service';
import { AuthService, LoginResponse } from '../../@core/service/auth.service';

@Component({
  selector: 'app-mes-demandes',
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
    TooltipModule,
    ProgressBarModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './mes-demandes.component.html'
})
export class MesDemandesComponent implements OnInit, OnDestroy {
  demandes: Demande[] = [];
  demandesFiltres: Demande[] = [];
  categories: Categorie[] = [];
  utilisateurs: Utilisateur[] = [];
  
  displayModal = false;
  displayDetailModal = false;
  
  demandeForm: DemandeDTO = { 
    categorieId: 0,
    beneficiaireId: null
  };

  demandeDetail: Demande | null = null;

  termeRecherche: string = '';
  statutFiltre: StatutDemande | 'TOUS' = 'TOUS';

  utilisateurConnecte: LoginResponse | null = null;
  loading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private demandeService: DemandeService,
    private categorieService: CategorieService,
    private utilisateurService: UtilisateurService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.initializeUser();
    this.loadData();
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

  loadData() {
    if (!this.utilisateurConnecte?.id) {
      console.error('Aucun utilisateur connecté');
      return;
    }

    this.loading = true;
    
    this.demandeService.getMesDemandes(this.utilisateurConnecte.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.demandes = data;
          this.demandesFiltres = [...this.demandes];
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur chargement demandes:', error);
          this.loading = false;
          this.handleError('Erreur lors du chargement des demandes', error);
        }
      });

    this.categorieService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.categories = data;
        },
        error: (error) => {
          console.error('Erreur chargement catégories:', error);
          this.handleError('Erreur lors du chargement des catégories', error);
        }
      });

    this.utilisateurService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.utilisateurs = data;
        },
        error: (error) => {
          console.error('Erreur chargement utilisateurs:', error);
          this.handleError('Erreur lors du chargement des utilisateurs', error);
        }
      });
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

  filtrerDemandes() {
    let filtered = this.demandes;

    if (this.statutFiltre !== 'TOUS') {
      filtered = filtered.filter(d => d.statut === this.statutFiltre);
    }

    if (this.termeRecherche) {
      const terme = this.termeRecherche.toLowerCase();
      filtered = filtered.filter(demande => 
        demande.categorieNom.toLowerCase().includes(terme) ||
        demande.idDemande.toString().includes(terme) ||
        (demande.beneficiaireNom && demande.beneficiaireNom.toLowerCase().includes(terme))
      );
    }

    this.demandesFiltres = filtered;
  }

  reinitialiserFiltres() {
    this.termeRecherche = '';
    this.statutFiltre = 'TOUS';
    this.demandesFiltres = [...this.demandes];
  }

  openNouvelleDemandeModal() {
    if (!this.utilisateurConnecte?.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Utilisateur non connecté'
      });
      return;
    }

    this.demandeForm = { 
      categorieId: 0,
      beneficiaireId: this.utilisateurConnecte.id
    };
    this.displayModal = true;
  }

  openDetailModal(demande: Demande) {
    this.demandeDetail = demande;
    this.displayDetailModal = true;
  }

  submitForm() {
    if (!this.utilisateurConnecte?.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Utilisateur non connecté'
      });
      return;
    }

    this.demandeService.create(this.demandeForm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newDemande) => {
          this.demandes.push(newDemande);
          this.filtrerDemandes();
          this.displayModal = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Demande créée avec succès'
          });
        },
        error: (error) => {
          console.error('Erreur création demande:', error);
          this.handleError('Erreur lors de la création de la demande', error);
        }
      });
  }

  soumettreDemande(demande: Demande) {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir soumettre la demande #${demande.idDemande} pour validation ? Cette action générera 3 étapes de validation.`,
      header: 'Confirmation de soumission',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.demandeService.soumettre(demande.idDemande)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (updated) => {
              const index = this.demandes.findIndex(d => d.idDemande === updated.idDemande);
              if (index !== -1) {
                this.demandes[index] = updated;
              }
              this.filtrerDemandes();
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Demande soumise pour validation. 3 étapes de validation ont été créées.'
              });
            },
            error: (error) => {
              console.error('Erreur soumission:', error);
              this.handleError('Erreur lors de la soumission', error);
            }
          });
      }
    });
  }

  confirmDelete(demande: Demande) {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer la demande #${demande.idDemande} ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteDemande(demande);
      }
    });
  }

  deleteDemande(demande: Demande) {
    this.demandeService.delete(demande.idDemande)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.demandes = this.demandes.filter(d => d.idDemande !== demande.idDemande);
          this.filtrerDemandes();
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Demande supprimée avec succès'
          });
        },
        error: (error) => {
          console.error('Erreur suppression:', error);
          this.handleError('Erreur lors de la suppression', error);
        }
      });
  }

  getEtapesValideesCount(demande: Demande): number {
    return demande.etapesValidation.filter(e => e.statut === StatutValidation.VALIDE).length;
  }

  getUtilisateurById(id: number | null): Utilisateur | undefined {
    if (id === null) return undefined;
    return this.utilisateurs.find(u => u.idUtilisateur === id);
  }

  getNomCompletUtilisateur(id: number | null): string {
    if (id === null) return '';
    const utilisateur = this.getUtilisateurById(id);
    if (!utilisateur) return '';
    return `${utilisateur.prenom} ${utilisateur.nom}`;
  }

  estUtilisateurConnecte(id: number | null): boolean {
    if (id === null) return false;
    return id === this.utilisateurConnecte?.id;
  }

  getStatutBadge(statut: StatutDemande): "success" | "info" | "warning" | "danger" | "secondary" {
    switch (statut) {
      case StatutDemande.NON_SOUMISE:
        return "secondary";
      case StatutDemande.EN_ATTENTE:
        return "warning";
      case StatutDemande.VALIDE:
        return "success";
      case StatutDemande.REJETEE:
        return "danger";
      default:
        return "secondary";
    }
  }

  getStatutLabel(statut: StatutDemande): string {
    switch (statut) {
      case StatutDemande.NON_SOUMISE:
        return 'Non soumise';
      case StatutDemande.EN_ATTENTE:
        return 'En attente';
      case StatutDemande.VALIDE:
        return 'Validée';
      case StatutDemande.REJETEE:
        return 'Rejetée';
      default:
        return statut;
    }
  }

  getEtapeIcon(statut: StatutValidation): string {
    switch (statut) {
      case StatutValidation.VALIDE:
        return 'pi pi-check-circle';
      case StatutValidation.REJETEE:
        return 'pi pi-times-circle';
      case StatutValidation.EN_ATTENTE:
        return 'pi pi-clock';
      default:
        return 'pi pi-circle';
    }
  }

  getEtapeColor(statut: StatutValidation): string {
    switch (statut) {
      case StatutValidation.VALIDE:
        return 'color: var(--green-500)';
      case StatutValidation.REJETEE:
        return 'color: var(--red-500)';
      case StatutValidation.EN_ATTENTE:
        return 'color: var(--orange-500)';
      default:
        return 'color: var(--gray-500)';
    }
  }

  getStatutValidationLabel(statut: StatutValidation): string {
    switch (statut) {
      case StatutValidation.EN_ATTENTE:
        return 'En attente';
      case StatutValidation.VALIDE:
        return 'Validée';
      case StatutValidation.REJETEE:
        return 'Rejetée';
      default:
        return statut;
    }
  }

  peutSoumettre(demande: Demande): boolean {
    return demande.statut === StatutDemande.NON_SOUMISE;
  }

  peutSupprimer(demande: Demande): boolean {
    return demande.statut === StatutDemande.NON_SOUMISE;
  }

  peutModifier(demande: Demande): boolean {
    return demande.statut === StatutDemande.NON_SOUMISE;
  }

  get statutOptions(): { label: string, value: StatutDemande | 'TOUS' }[] {
    return [
      { label: 'Tous les statuts', value: 'TOUS' },
      { label: 'Non soumises', value: StatutDemande.NON_SOUMISE },
      { label: 'En attente', value: StatutDemande.EN_ATTENTE },
      { label: 'Validées', value: StatutDemande.VALIDE },
      { label: 'Rejetées', value: StatutDemande.REJETEE }
    ];
  }

  getProgression(demande: Demande): number {
    if (demande.statut === StatutDemande.NON_SOUMISE) return 0;
    if (demande.statut === StatutDemande.REJETEE) return 0;
    
    const etapesValidees = this.getEtapesValideesCount(demande);
    return (etapesValidees / 3) * 100;
  }

  trackByDemandeId(index: number, demande: Demande): number {
    return demande.idDemande;
  }
}