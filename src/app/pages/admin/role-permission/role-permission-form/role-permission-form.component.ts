import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { DirectionService } from '../../../../@core/service/direction.service';
import { ToastrService } from 'ngx-toastr';
import { RoleService } from '../../../../@core/service/role.service';
import { CommonModule } from '@angular/common';
import { FlexModule } from '@angular/flex-layout';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { PrimeTemplate } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-role-permission-form',
  standalone: true,
  imports: [
    CommonModule,
    FlexModule,
    InputTextModule,
    TableModule,
    DialogModule,
    PrimeTemplate,
    ButtonDirective,
    FormsModule,
    MultiSelectModule
  ],
  templateUrl: './role-permission-form.component.html',
  styleUrl: './role-permission-form.component.scss'
})
export class RolePermissionFormComponent implements OnInit {

  // Affichage du formulaire
  showForm = false;
  permissionsList: any[] = [];

  processing = false; // Indicateur de chargement pour désactiver le bouton lors du traitement
  @Output()
  onUpdate: EventEmitter<any> = new EventEmitter();

  // Données
  directions: any[] = [];
  permissions: any[] = []; // Liste des permissions disponibles
  roles: any[] = []; // Liste des rôles

  // Rôle à créer
  newRole: { name: string; code: string; permissionsId: string[] } = {
    name: '',
    code: '',
    permissionsId: []
  };

  constructor(
    private ds: DirectionService,
    private toastr: ToastrService,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.getRoles();
    this.getPermissions();
  }

  /** Afficher le formulaire d'ajout de rôle */
  handleShowForm(): void {
    this.showForm = true;
    this.loadDirections();
  }

  /** Charger les directions */
  private loadDirections(): void {
    this.ds.getAll(1, 1000).subscribe({
      next: (response: any) => {
        if (response.successful) {
          this.directions = response.data.content;
        }
      },
      error: (err) => console.error('Erreur lors du chargement des directions:', err)
    });
  }

  /** Récupérer la liste des rôles */
  // getRoles(): void {
  //   this.roleService.getAllRoles().subscribe({
  //     next: (data) => {
  //       this.roles = Array.isArray(data) ? data : [];
  //     },
  //     error: (err) => console.error('Erreur lors de la récupération des rôles:', err)
  //   });
  // }
  getRoles(): void {
    this.roleService.getAllRoles().subscribe(
      (data) => {
        console.log('Liste des rôles récupérée:', data);

        if (Array.isArray(data)) {
          this.roles = data;
        } else {
          this.roles = [];
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération des rôles:', error);
      }
    );
  }

  /** Récupérer la liste des permissions */
  getPermissions(): void {
    this.roleService.getAllPermissions().subscribe({
      next: (data) => {
        this.permissions = Array.isArray(data) ? data : [];
      },
      error: (err) => console.error('Erreur lors de la récupération des permissions:', err)
    });
  }

  /** Créer un rôle */
  createRole(): void {
    this.roleService.createRole(this.newRole).subscribe({
      next: (response) => {
        this.toastr.success('Rôle ajouté avec succès', 'Succès');
        this.getRoles(); // Rafraîchir la liste des rôles après ajout
        this.resetForm();
      },
      error: (err) => {
        console.error('Erreur lors de l’ajout du rôle', err);
        this.toastr.error('Erreur lors de l’ajout du rôle', 'Erreur');
      }
    });
  }

  /** Réinitialiser le formulaire après création */
  private resetForm(): void {
    this.newRole = { name: '', code: '', permissionsId: [] };
    this.showForm = false;
  }

  handleAddRole(): void {
    if (!this.newRole.name || !this.newRole.code || this.newRole.permissionsId.length === 0) {
      this.toastr.error('Veuillez remplir tous les champs avant de soumettre.', 'Erreur');
      return;
    }

    console.log("Données envoyées à l'API :", JSON.stringify(this.newRole));

    this.processing = true; // Démarrer l'indicateur de chargement

    this.roleService.createRole(this.newRole).subscribe({
      next: () => {
        this.toastr.success('Rôle ajouté avec succès', 'Succès');
         // Rafraîchir la liste des rôles après ajout
        this.resetForm();
        this.getRoles();
        this.onUpdate.emit(this.newRole);
        //window.location.reload();
      },
      error: (err) => {
        console.error('Erreur lors de l’ajout du rôle', err);
        this.toastr.error('Erreur lors de l’ajout du rôle', 'Erreur');
      },
      complete: () => {
        this.processing = false; // Arrêter le chargement après la requête
      }
    });
  }

}
