// src/app/pages/equipements/equipements.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EquipementService, Equipement, EquipementDTO, StatutEquipement } from '../../@core/service/equipement.service';
import { CategorieService, Categorie } from '../../@core/service/categorie.service';
import { EmplacementService, Emplacement } from '../../@core/service/emplacement.service';
import { FournisseurService, Fournisseur } from '../../@core/service/fournisseur.service';

@Component({
  selector: 'app-equipements',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    FormsModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './equipements.component.html'
})
export class EquipementsComponent implements OnInit {
  equipements: Equipement[] = [];
  equipementsFiltres: Equipement[] = [];
  categories: Categorie[] = [];
  emplacements: Emplacement[] = [];
  fournisseurs: Fournisseur[] = [];
  selectedEquipement: Equipement | null = null;
  
  // Modales
  displayModal = false;
  
  // Formulaire
  equipementForm: EquipementDTO = { 
    nom: '',
    categorieId: 0,
    emplacementId: 0,
    fournisseurId: 0,
    statut: StatutEquipement.DISPONIBLE
  };
  isEditMode = false;

  // Recherche
  termeRecherche: string = '';

  // Options pour les dropdowns
  statutOptions = [
    { label: 'Disponible', value: StatutEquipement.DISPONIBLE },
    { label: 'Assigné', value: StatutEquipement.ASSIGNE },
    { label: 'En panne', value: StatutEquipement.EN_PANNE }
  ];

  constructor(
    private equipementService: EquipementService,
    private categorieService: CategorieService,
    private emplacementService: EmplacementService,
    private fournisseurService: FournisseurService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadEquipements();
    this.loadCategories();
    this.loadEmplacements();
    this.loadFournisseurs();
  }

  loadEquipements() {
    this.equipementService.getAll().subscribe({
      next: (data) => {
        this.equipements = data;
        this.equipementsFiltres = [...this.equipements];
      },
      error: (error) => {
        console.error('Erreur chargement équipements:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des équipements'
        });
      }
    });
  }

  loadCategories() {
    this.categorieService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        console.error('Erreur chargement catégories:', error);
      }
    });
  }

  loadEmplacements() {
    this.emplacementService.getAll().subscribe({
      next: (data) => {
        this.emplacements = data;
      },
      error: (error) => {
        console.error('Erreur chargement emplacements:', error);
      }
    });
  }

  loadFournisseurs() {
    this.fournisseurService.getAll().subscribe({
      next: (data) => {
        this.fournisseurs = data;
      },
      error: (error) => {
        console.error('Erreur chargement fournisseurs:', error);
      }
    });
  }

  // Recherche
  filtrerEquipements() {
    if (!this.termeRecherche) {
      this.equipementsFiltres = [...this.equipements];
      return;
    }

    const terme = this.termeRecherche.toLowerCase();
    this.equipementsFiltres = this.equipements.filter(equipement => 
      equipement.nom.toLowerCase().includes(terme) ||
      equipement.idEquipement.toString().includes(terme) ||
      (equipement.categorieNom && equipement.categorieNom.toLowerCase().includes(terme)) ||
      (equipement.emplacementNom && equipement.emplacementNom.toLowerCase().includes(terme)) ||
      (equipement.fournisseurNom && equipement.fournisseurNom.toLowerCase().includes(terme)) ||
      this.getStatutLabel(equipement.statut).toLowerCase().includes(terme)
    );
  }

  // Réinitialiser la recherche
  reinitialiserRecherche() {
    this.termeRecherche = '';
    this.equipementsFiltres = [...this.equipements];
  }

  // Ouvrir modal d'ajout
  openAddModal() {
    this.isEditMode = false;
    this.equipementForm = { 
      nom: '',
      categorieId: 0,
      emplacementId: 0,
      fournisseurId: 0,
      statut: StatutEquipement.DISPONIBLE
    };
    this.displayModal = true;
  }

  // Ouvrir modal d'édition - VERSION CORRIGÉE
  openEditModal(equipement: Equipement) {
    this.isEditMode = true;
    this.selectedEquipement = equipement;
    
    // Solution frontend : trouver les IDs via les noms dans les listes chargées
    const categorie = this.categories.find(c => c.nom === equipement.categorieNom);
    const emplacement = this.emplacements.find(e => e.nom === equipement.emplacementNom);
    const fournisseur = this.fournisseurs.find(f => f.nom === equipement.fournisseurNom);

    this.equipementForm = {
      nom: equipement.nom,
      categorieId: categorie?.idCategorieEquipement || 0,
      emplacementId: emplacement?.idEmplacement || 0,
      fournisseurId: fournisseur?.idFournisseur || 0,
      statut: equipement.statut
    };
    
    this.displayModal = true;
  }

  // Soumettre le formulaire
  submitForm() {
    if (this.isEditMode && this.selectedEquipement) {
      // Modification
      this.equipementService.update(this.selectedEquipement.idEquipement, this.equipementForm)
        .subscribe({
          next: (updated) => {
            const index = this.equipements.findIndex(e => e.idEquipement === updated.idEquipement);
            if (index !== -1) {
              this.equipements[index] = updated;
            }
            this.filtrerEquipements(); // Mettre à jour la liste filtrée
            this.displayModal = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Équipement modifié avec succès'
            });
          },
          error: (error) => {
            console.error('Erreur modification:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de la modification'
            });
          }
        });
    } else {
      // Ajout
      this.equipementService.create(this.equipementForm)
        .subscribe({
          next: (newEquipement) => {
            this.equipements.push(newEquipement);
            this.filtrerEquipements(); // Mettre à jour la liste filtrée
            this.displayModal = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Équipement ajouté avec succès'
            });
          },
          error: (error) => {
            console.error('Erreur ajout:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de l\'ajout'
            });
          }
        });
    }
  }

  getModalTitle(): string {
    return this.isEditMode ? 'Modifier l\'équipement' : 'Nouvel Équipement';
  }

  getStatutBadge(statut: StatutEquipement): "success" | "warning" | "danger" | "secondary" {
    switch (statut) {
      case StatutEquipement.DISPONIBLE:
        return "success";
      case StatutEquipement.ASSIGNE:
        return "warning";
      case StatutEquipement.EN_PANNE:
        return "danger";
      default:
        return "secondary";
    }
  }

  getStatutLabel(statut: StatutEquipement): string {
    switch (statut) {
      case StatutEquipement.DISPONIBLE:
        return 'Disponible';
      case StatutEquipement.ASSIGNE:
        return 'Assigné';
      case StatutEquipement.EN_PANNE:
        return 'En panne';
      default:
        return statut;
    }
  }

  // Confirmation de suppression
  confirmDelete(equipement: Equipement) {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer l'équipement "${equipement.nom}" ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteEquipement(equipement);
      }
    });
  }

  // Suppression
  deleteEquipement(equipement: Equipement) {
    this.equipementService.delete(equipement.idEquipement).subscribe({
      next: () => {
        this.equipements = this.equipements.filter(e => e.idEquipement !== equipement.idEquipement);
        this.filtrerEquipements(); // Mettre à jour la liste filtrée
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Équipement supprimé avec succès'
        });
      },
      error: (error) => {
        console.error('Erreur suppression:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la suppression'
        });
      }
    });
  }
}