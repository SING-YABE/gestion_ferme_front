// src/app/pages/emplacements/emplacements.component.ts
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
import { EmplacementService, Emplacement, EmplacementDTO } from '../../@core/service/emplacement.service';

@Component({
  selector: 'app-emplacements',
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
  templateUrl: './emplacements.component.html'
})
export class EmplacementsComponent implements OnInit {
  emplacements: Emplacement[] = [];
  selectedEmplacement: Emplacement | null = null;
  
  // Modales
  displayModal = false;
  displayDeleteModal = false;
  
  // Formulaire
  emplacementForm: EmplacementDTO = { nom: '' };
  isEditMode = false;

  constructor(
    private emplacementService: EmplacementService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadEmplacements();
  }

  loadEmplacements() {
    this.emplacementService.getAll().subscribe({
      next: (data) => {
        this.emplacements = data;
      },
      error: (error) => {
        console.error('Erreur chargement emplacements:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des emplacements'
        });
      }
    });
  }

  // Ouvrir modal d'ajout
  openAddModal() {
    this.isEditMode = false;
    this.emplacementForm = { nom: '' };
    this.displayModal = true;
  }

  // Ouvrir modal d'édition
  openEditModal(emplacement: Emplacement) {
    this.isEditMode = true;
    this.selectedEmplacement = emplacement;
    this.emplacementForm = { nom: emplacement.nom };
    this.displayModal = true;
  }

  // Soumettre le formulaire (ajout ou modification)
  submitForm() {
    if (this.isEditMode && this.selectedEmplacement) {
      // Modification
      this.emplacementService.update(this.selectedEmplacement.idEmplacement, this.emplacementForm)
        .subscribe({
          next: (updated) => {
            const index = this.emplacements.findIndex(e => e.idEmplacement === updated.idEmplacement);
            if (index !== -1) {
              this.emplacements[index] = updated;
            }
            this.displayModal = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Emplacement modifié avec succès'
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
      this.emplacementService.create(this.emplacementForm)
        .subscribe({
          next: (newEmplacement) => {
            this.emplacements.push(newEmplacement);
            this.displayModal = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Emplacement ajouté avec succès'
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
 // Dans emplacements.component.ts - Ajouter cette méthode
getModalTitle(): string {
  return this.isEditMode ? 'Modifier l\'emplacement' : 'Nouvel Emplacement';
}
  // Confirmation de suppression
  confirmDelete(emplacement: Emplacement) {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer l'emplacement "${emplacement.nom}" ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteEmplacement(emplacement);
      }
    });
  }

  // Suppression
  deleteEmplacement(emplacement: Emplacement) {
    this.emplacementService.delete(emplacement.idEmplacement).subscribe({
      next: () => {
        this.emplacements = this.emplacements.filter(e => e.idEmplacement !== emplacement.idEmplacement);
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Emplacement supprimé avec succès'
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