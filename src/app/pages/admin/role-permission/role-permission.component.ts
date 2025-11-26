import { CommonModule, DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { ConfirmationService, PrimeIcons, PrimeTemplate } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { PageResponse, emptyPage } from '../../../@core/model/page-response.model';
import { RoleService } from '../../../@core/service/role.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonDirective } from 'primeng/button';
import { RolePermissionFormComponent } from './role-permission-form/role-permission-form.component';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../../@core/service/app.service';
import { TemplateService } from '../../../@core/service/template.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-role-permission',
  standalone: true,
  imports: [
    CommonModule, // Assure-toi d'importer CommonModule
    FlexModule,
    InputTextModule,
    TableModule,
    DialogModule,
    FlexModule,
    InputTextModule,
    PrimeTemplate,
    TableModule,
    ButtonDirective,
    RolePermissionFormComponent,
    ConfirmDialogModule,
    MultiSelectModule,
    FormsModule,

  ],
  templateUrl: './role-permission.component.html',
  styleUrl: './role-permission.component.scss',
  providers: [
    ConfirmationService
  ]
})
export class RolePermissionComponent implements OnInit {



  rolesPage: PageResponse = emptyPage();
  roles: any[] = [];
  loading = false;
  displayModal = false; // Contrôle l'affichage du modal
  selectedRole: any;
  currentPageInfo: any;
  pageSize = 10;
  processing = false;
  editedRole: {id: any, name: string; code: string; permissionsId: any[] } = {
    id: '',
    name: '',
    code: '',
    permissionsId: []
  };

  editModal = false; // Nouvelle variable pour ouvrir le modal de modification
  permissionsList: any[] = [];
  permissions: any[] = []; // Liste des permissions disponibles

  newRole: { name: string; code: string; permissionsId: string[] } = {
    name: '',
    code: '',
    permissionsId: []
  };




  constructor(
    private roleService: RoleService,
    private toastr: ToastrService,
    private as: AppService,
    private templateService: TemplateService,
    private cs: ConfirmationService,
    private confirmationService: ConfirmationService // Injection du service

  ) {
  }

  ngOnInit(): void {
    this.getRoles();
    this.getPermissions();



  }

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


  showPermissions(role: any): void {
    this.selectedRole = role; // Sélectionner le rôle pour afficher ses permissions
    this.displayModal = true; // Afficher le modal
  }

  paginate($event: any) {
    this.currentPageInfo = $event;
    this.pageSize = $event.rows;
    this.loadData($event.first / $event.rows, this.pageSize);
  }

  loadData(page = 0, size = 10): void {
    this.loading = true; // Active le chargement
    this.roleService.getAllRoles().subscribe(
      (data) => {
        console.log('Liste des rôles récupérée dans loadData:', data);

        if (Array.isArray(data)) {
          this.roles = data; // Assigne directement la liste des rôles
        } else if (data.content) {
          this.roles = data.content; // Si la réponse était paginée
        } else {
          this.roles = [];
        }

        this.loading = false; // Désactive le chargement
      },
      (error) => {
        console.error('Erreur lors de la récupération des rôles:', error);
        this.loading = false;
      }
    );
  }

  showRoleDetails(role: any): void {
    this.selectedRole = role;  // Stocke le rôle sélectionné
    this.displayModal = true;  // Ouvre la fenêtre modale
  }

  //gestion new role
  handleUpdate() {
    this.paginate(this.currentPageInfo);
  }

  deleteRole(roleId: string): void {
    if (!roleId) {
      console.error("Erreur: L'ID du rôle est indéfini");
      return;
    }

    if (confirm("Voulez-vous vraiment supprimer ce rôle ?")) {
      this.roleService.deleteRole(roleId).subscribe({
        next: () => {
          console.log("Rôle supprimé avec succès");
          this.getRoles(); // Rafraîchir la liste après suppression
        },
        error: (err) => {
          console.error("Erreur lors de la suppression du rôle :", err);
        }
      });
    }
  }

  handleDelete(role: any): void {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: `Voulez-vous vraiment supprimer le rôle "${role.name}" ?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      acceptButtonStyleClass: 'p-button-danger outlined p-button-sm',
      rejectButtonStyleClass: 'p-button-sm mr-2',
      accept: () => {
        this.roleService.deleteRole(role.id).subscribe({
          next: () => {
            console.log(`Rôle supprimé avec succès : ${role.name}`);
            this.getRoles(); // Rafraîchir la liste après suppression
          },
          error: (error) => {
            console.error('Erreur lors de la suppression du rôle:', error);
          }
        });
      }
    });
  }


  editRole(role: any): void {
    this.editedRole = { ...role, permissionsId: role.permissions.map((p: any) => p?.code) };
    console.log(this.editedRole);
    setTimeout(() => {
      this.editModal = true;
    }, 100);
  }

  /** Envoyer la mise à jour du rôle */
  updateRole(): void {
    // if (!this.editedRole.name || !this.editedRole.code || this.editedRole.permissionsId.length === 0) {
    //   this.toastr.error('Veuillez remplir tous les champs avant de soumettre.', 'Erreur');
    //   return;
    // }

    this.processing = true;

    this.roleService.updateRole(this.editedRole.id, this.editedRole).subscribe({
      next: () => {
        this.toastr.success('Rôle mis à jour avec succès', 'Succès');
        this.getRoles();
        this.editModal = false;
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du rôle', err);
        this.toastr.error('Erreur lors de la mise à jour du rôle', 'Erreur');
      },
      complete: () => this.processing = false
    });
  }
  /** Récupérer la liste des permissions */
  getPermissions(): void {
    this.roleService.getAllPermissions().subscribe({
      next: (data) => {
        this.permissionsList = Array.isArray(data) ? data : [];
      },
      error: (err) => console.error('Erreur lors de la récupération des permissions:', err)
    });
  }


  /** Rafraîchir après mise à jour */



}
