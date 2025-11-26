// src/app/pages/utilisateurs/utilisateurs.component.ts
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
import { UtilisateurService, Utilisateur, UtilisateurDTO } from '../../@core/service/utilisateur.service';
import { RoleManagementService, RoleManagement } from '../../@core/service/role-management.service';

@Component({
  selector: 'app-utilisateurs',
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
  templateUrl: './utilisateurs.component.html'
})
export class UtilisateursComponent implements OnInit {
  utilisateurs: Utilisateur[] = [];
  utilisateursFiltres: Utilisateur[] = [];
  roles: RoleManagement[] = [];
  selectedUtilisateur: Utilisateur | null = null;
  
  // Modales
  displayModal = false;
  displayRoleModal = false;
  
  // Formulaire
  utilisateurForm: UtilisateurDTO = { 
    poste: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    password: '',
    roleId: null
  };
  isEditMode = false;

  // Assignation de rôle
  selectedRoleId: number | null = null;

  // Recherche
  termeRecherche: string = '';

  constructor(
    private utilisateurService: UtilisateurService,
    private roleManagementService: RoleManagementService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadUtilisateurs();
    this.loadRoles();
  }

  loadUtilisateurs() {
    this.utilisateurService.getAll().subscribe({
      next: (data) => {
        this.utilisateurs = data;
        this.utilisateursFiltres = [...this.utilisateurs];
      },
      error: (error) => {
        console.error('Erreur chargement utilisateurs:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des utilisateurs'
        });
      }
    });
  }

  loadRoles() {
    this.roleManagementService.getAll().subscribe({
      next: (data) => {
        this.roles = data;
      },
      error: (error) => {
        console.error('Erreur chargement rôles:', error);
      }
    });
  }

  // Recherche
  filtrerUtilisateurs() {
    if (!this.termeRecherche) {
      this.utilisateursFiltres = [...this.utilisateurs];
      return;
    }

    const terme = this.termeRecherche.toLowerCase();
    this.utilisateursFiltres = this.utilisateurs.filter(utilisateur => 
      utilisateur.nom.toLowerCase().includes(terme) ||
      utilisateur.prenom.toLowerCase().includes(terme) ||
      utilisateur.email.toLowerCase().includes(terme) ||
      utilisateur.poste.toLowerCase().includes(terme) ||
      utilisateur.telephone.toLowerCase().includes(terme) ||
      utilisateur.idUtilisateur.toString().includes(terme) ||
      (utilisateur.role && utilisateur.role.nom.toLowerCase().includes(terme))
    );
  }

  reinitialiserRecherche() {
    this.termeRecherche = '';
    this.utilisateursFiltres = [...this.utilisateurs];
  }

  // Ouvrir modal d'ajout
  openAddModal() {
    this.isEditMode = false;
    this.utilisateurForm = { 
      poste: '',
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      password: '',
      roleId: null
    };
    this.displayModal = true;
  }

  // Ouvrir modal d'édition
  openEditModal(utilisateur: Utilisateur) {
    this.isEditMode = true;
    this.selectedUtilisateur = utilisateur;
    
    this.utilisateurForm = {
      poste: utilisateur.poste,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      telephone: utilisateur.telephone,
      password: '', // Mot de passe vide pour l'édition
      roleId: utilisateur.role?.idRole || null
    };
    
    this.displayModal = true;
  }

  // Ouvrir modal d'assignation de rôle
  openRoleModal(utilisateur: Utilisateur) {
    this.selectedUtilisateur = utilisateur;
    this.selectedRoleId = utilisateur.role?.idRole || null;
    this.displayRoleModal = true;
  }

  // Soumettre le formulaire
  submitForm() {
    if (this.isEditMode && this.selectedUtilisateur) {
      // Modification
      this.utilisateurService.update(this.selectedUtilisateur.idUtilisateur, this.utilisateurForm)
        .subscribe({
          next: (updated) => {
            const index = this.utilisateurs.findIndex(u => u.idUtilisateur === updated.idUtilisateur);
            if (index !== -1) {
              this.utilisateurs[index] = updated;
            }
            this.filtrerUtilisateurs();
            this.displayModal = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Utilisateur modifié avec succès'
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
      this.utilisateurService.create(this.utilisateurForm)
        .subscribe({
          next: (newUtilisateur) => {
            this.utilisateurs.push(newUtilisateur);
            this.filtrerUtilisateurs();
            this.displayModal = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Utilisateur ajouté avec succès'
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

  // Assigner un rôle
  assignerRole() {
    if (!this.selectedUtilisateur) return;

    this.utilisateurService.assignRole(this.selectedUtilisateur.idUtilisateur, this.selectedRoleId)
      .subscribe({
        next: (updated) => {
          const index = this.utilisateurs.findIndex(u => u.idUtilisateur === updated.idUtilisateur);
          if (index !== -1) {
            this.utilisateurs[index] = updated;
          }
          this.filtrerUtilisateurs();
          this.displayRoleModal = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Rôle assigné avec succès'
          });
        },
        error: (error) => {
          console.error('Erreur assignation rôle:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Erreur lors de l\'assignation du rôle'
          });
        }
      });
  }

  getModalTitle(): string {
    return this.isEditMode ? 'Modifier l\'utilisateur' : 'Nouvel Utilisateur';
  }

  // Dans utilisateurs.component.ts - Corriger la méthode getRoleBadge
getRoleBadge(role: RoleManagement | null): "success" | "info" | "warning" | "danger" | "secondary" {
  if (!role) return "secondary";
  
  switch (role.nom.toLowerCase()) {
    case 'admin': return "danger";
    case 'gestionnaire': return "warning";
    case 'approbateur': return "info";
    case 'demandeur': return "success";
    default: return "secondary";
  }
}

  // Confirmation de suppression
  confirmDelete(utilisateur: Utilisateur) {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer l'utilisateur "${utilisateur.prenom} ${utilisateur.nom}" ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteUtilisateur(utilisateur);
      }
    });
  }

  // Suppression
  deleteUtilisateur(utilisateur: Utilisateur) {
    this.utilisateurService.delete(utilisateur.idUtilisateur).subscribe({
      next: () => {
        this.utilisateurs = this.utilisateurs.filter(u => u.idUtilisateur !== utilisateur.idUtilisateur);
        this.filtrerUtilisateurs();
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Utilisateur supprimé avec succès'
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