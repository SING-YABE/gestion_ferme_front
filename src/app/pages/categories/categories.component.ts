// src/app/pages/categories/categories.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CategorieService, Categorie, CategorieDTO } from '../../@core/service/categorie.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    FormsModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './categories.component.html'
})
export class CategoriesComponent implements OnInit {
  categories: Categorie[] = [];
  selectedCategorie: Categorie | null = null;
  
  // Modales
  displayModal = false;
  
  // Formulaire
  categorieForm: CategorieDTO = { nom: '' };
  isEditMode = false;

  constructor(
    private categorieService: CategorieService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categorieService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        console.error('Erreur chargement catégories:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des catégories'
        });
      }
    });
  }

  // Ouvrir modal d'ajout
  openAddModal() {
    this.isEditMode = false;
    this.categorieForm = { nom: '' };
    this.displayModal = true;
  }

  // Ouvrir modal d'édition
  openEditModal(categorie: Categorie) {
    this.isEditMode = true;
    this.selectedCategorie = categorie;
    this.categorieForm = { nom: categorie.nom };
    this.displayModal = true;
  }

  // Soumettre le formulaire
  submitForm() {
    if (this.isEditMode && this.selectedCategorie) {
      // Modification
      this.categorieService.update(this.selectedCategorie.idCategorieEquipement, this.categorieForm)
        .subscribe({
          next: (updated) => {
            const index = this.categories.findIndex(c => c.idCategorieEquipement === updated.idCategorieEquipement);
            if (index !== -1) {
              this.categories[index] = updated;
            }
            this.displayModal = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Catégorie modifiée avec succès'
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
      this.categorieService.create(this.categorieForm)
        .subscribe({
          next: (newCategorie) => {
            this.categories.push(newCategorie);
            this.displayModal = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Catégorie ajoutée avec succès'
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
    return this.isEditMode ? 'Modifier la catégorie' : 'Nouvelle Catégorie';
  }

  // Confirmation de suppression
  confirmDelete(categorie: Categorie) {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer la catégorie "${categorie.nom}" ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteCategorie(categorie);
      }
    });
  }

  // Suppression
  deleteCategorie(categorie: Categorie) {
    this.categorieService.delete(categorie.idCategorieEquipement).subscribe({
      next: () => {
        this.categories = this.categories.filter(c => c.idCategorieEquipement !== categorie.idCategorieEquipement);
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Catégorie supprimée avec succès'
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