import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {ChipModule} from "primeng/chip";
import {TagModule} from "primeng/tag";
import {BadgeModule} from "primeng/badge";
import {AppService} from "../../../@core/service/app.service";
import {ProjectService} from "../../../@core/service/project.service";
import {ToastrService} from "ngx-toastr";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {CommonModule, DatePipe, DecimalPipe, NgIf} from "@angular/common";
import { ButtonDirective } from 'primeng/button';
import { ProjectUpdateComponent } from "./project-update/project-update.component";
import {HasPermissionDirective} from "../../../@core/security/directives/has-permission.directive";
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { UserService } from '../../../@core/service/user.service';
import {ConfirmationService} from "primeng/api";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import { DialogService } from 'primeng/dynamicdialog';
import { Router } from '@angular/router';
import { ProjectSuspensionDialogComponent } from '../project-suspension-dialog/project-suspension-dialog.component';
@Component({
  selector: 'app-project-details-layout',
  standalone: true,
  imports: [
    RouterLink,
    ChipModule,
    TagModule,
    BadgeModule,
    RouterOutlet,
    RouterLinkActive,
    ProgressSpinnerModule,
    BreadcrumbModule,
    DatePipe,
    ButtonDirective,
    ProjectUpdateComponent,
    HasPermissionDirective,
    DecimalPipe,
    NgIf,
    CommonModule,
    ConfirmDialogModule
  ],
  providers: [
    ConfirmationService
  ],
  templateUrl: './project-details-layout.component.html',
  styleUrl: './project-details-layout.component.scss'
})
export class ProjectDetailsLayoutComponent implements OnInit, OnDestroy{

  @Input("projectId")
  projectId: string = "";
  projectDetails: any;
  loading = false;
  @Input() height: number = 200; // Hauteur de la jauge en pixels
  @Input() color: string = '#4CAF50'; // Couleur de la jauge
  progress = 0; // Valeur de progression (en pourcentage)
  memberPermissions: string[] = [];
  users: any[] = [];
  chefProjet: any = null;
  responsableEtude: any = null;
  constructor(
    private as: AppService,
    private ps: ProjectService,
    private toastr: ToastrService,
    private usersService: UserService, 
    private cs: ConfirmationService,
    private dialogService: DialogService,
    private router: Router

  ) {
  }

  ngOnDestroy(): void {
    this.as.setHideHeader(false)
  }

  ngOnInit(): void {
    this.as.setHideHeader(true)
    this.ps.currentProjectId$.next(this.projectId);
    this.loadShamsyUsers();

    // données du projet
    this.loadData();
    this.loadProjectMemberPermissions();
  }

  private loadShamsyUsers() {
    this.usersService.getUsers().subscribe({
      next: (response: any) => {
        this.users = response.content
          .filter((shamsyUser: any) => shamsyUser.user)
          .map((shamsyUser: any) => ({
            cuid: shamsyUser.user.cuid,
            displayName: shamsyUser.user.displayName || `${shamsyUser.user.firstname} ${shamsyUser.user.lastname}`,
            firstname: shamsyUser.user.firstname,
            lastname: shamsyUser.user.lastname,
            email: shamsyUser.user.email
          }));
  
        if (this.projectDetails?.cuidChefProjet) {
          this.findChefProjet();
        }
        
        if (this.projectDetails?.cuidResponsableEtude) {
          this.findResponsableEtude();
        }
      },
      error: (err) => {
        console.error('Erreur chargement utilisateurs Shamsy', err);
      }
    });
  }
  
  findChefProjet() {
    this.chefProjet = this.users.find(user => user.cuid === this.projectDetails.cuidChefProjet);
    console.log('Chef de projet trouvé:', this.chefProjet);
  }

  findResponsableEtude() {
    this.responsableEtude = this.users.find(user => user.cuid === this.projectDetails.cuidResponsableEtude);
    console.log('Responsable étude trouvé:', this.responsableEtude);
  }

  updateProgress(newProgress: number) {
    this.progress = Math.min(100, Math.max(0, newProgress)); // Limite entre 0 et 100
  }

  getProgressBackground() {
    if (this.projectDetails?.projectPercentage === null){
      this.progress = (this.getNombrePhaseTermine() / this.projectDetails.phases.length) * 100
    } else {
      this.progress = this.projectDetails.projectPercentage;
    }
    // alert(this.progress)
    return this.progress;
  }

  roundToTwoDecimals(value: number): string {
    const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
    return rounded.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }



  getNombrePhaseTermine(): number{
    let count = 0;
    for (let i = 0; i < this.projectDetails.phases.length; i++) {
      if (this.projectDetails.phases[i].phaseStatusLabel === "Validé") {
        count++;
      }
    }
    return count;
  }

  loadData() {
    this.loading = true;
    this.ps.getProjectById(this.projectId).subscribe({
      next: (data: any) => {
        this.projectDetails = data.data;
        this.ps.currentProjectDetails$.next(this.projectDetails);
  
        // Si users chargés, trouve CHEF P ET RES ETUDE
        if (this.users.length > 0) {
          if (this.projectDetails?.cuidChefProjet) {
            this.findChefProjet();
          }
          if (this.projectDetails?.cuidResponsableEtude) {
            this.findResponsableEtude();
          }
        }
  
        this.loading = false;
      },
      error: error => {
        this.toastr.error(error.error.message??error.message);
        this.loading = false;
      }
    });
  }

  requestCodeBudget(){
    this.cs.confirm({
      icon: "pi pi-exclamation-triangle",
      message: "Voulez-vous vraiment soumettre une demande de code budgetaire ?",
      header: 'Confirmation',
      defaultFocus: 'reject',
      acceptLabel: 'Oui, supprimer',
      rejectLabel: 'Non',
      acceptButtonStyleClass: 'p-button-danger outlined p-button-sm',
      rejectButtonStyleClass: 'p-button-sm mr-2',
      accept: () => {
        this.loading = true; // 🔹 Active le loader pendant la suppression
        this.ps.requestCodeBudget(this.projectDetails?.id).subscribe({
          next: (response: any) => {
            this.toastr.success("Demande de code budgetaire soumis avec succès !")
            this.loading = false;
          },
          error: (error) => {
            this.toastr.error(error.error.message??error.message);
            console.error('Erreur lors de la demande de code budgetaire', error);
          }
        });
      }
    });


  }

  loadProjectMemberPermissions() {
    if (!this.projectId) {
      this.toastr.warning('ID du projet non disponible');
      return;
    }

    this.ps.getProjectMemberPermissions(this.projectId).subscribe({
      next: (response: any) => {
        this.memberPermissions = response.data || [];
        console.log("Permission de l'utilisateur en fonction du projet",this.memberPermissions)
        },
      error: (error) => {
        this.toastr.error('Impossible de récupérer les permissions', 'Erreur');
        console.error('Erreur lors de la récupération des permissions', error);
      }
    });
  }


  ////////////

  openSuspensionDialog(projectId: number, isSuspended: boolean): void {
  const ref = this.dialogService.open(ProjectSuspensionDialogComponent, {
    header: isSuspended ? 'Réactivation du projet' : 'Suspension du projet',
    width: '450px',
    data: {
      projectId,
      isSuspended
    }
  });
  
  ref.onClose.subscribe((result) => {
    if (result) {
      this.loadData();
    }
  });
}

handleDelete(projet: any) {
  this.cs.confirm({
    header: 'Attention!',
    message: `Voulez vous vraiment supprimer le projet "${projet.name}" ?`,
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Oui je confirme',
    rejectLabel: 'Non',
    defaultFocus: 'reject',
    acceptButtonStyleClass: 'p-button-danger p-button-sm',
    rejectButtonStyleClass: 'p-button-outlined p-button-sm mr-3',
    accept: () => {
      this.ps.delete(projet.id).subscribe({
        next: () => {
          this.toastr.success("Projet supprimé avec succès !");
          this.router.navigate(['/projects']); 
        },
        error: error => {
          console.error('Erreur de suppression:', error);
          this.toastr.error("Erreur lors de la suppression du projet.Contrainte.");
        }
      });
    },
    reject: () => {}
  });
}

startProject(projectId: string): void {
  this.cs.confirm({
    header: 'Démarrage du projet',
    message: 'Voulez-vous démarrer ce projet ?',
    icon: 'pi pi-question-circle',
    acceptLabel: 'Oui, démarrer',
    rejectLabel: 'Annuler',
    acceptButtonStyleClass: 'p-button-success p-button-sm',
    rejectButtonStyleClass: 'p-button-outlined p-button-sm mr-3',
    accept: () => {
      this.ps.startProject(projectId).subscribe({
        next: (response: any) => {
          this.toastr.success('Projet démarré avec succès');
          this.loadData(); 
        },
        error: (error: any) => {
          const errorMessage = error.error?.message || 'Erreur lors du démarrage';
          this.toastr.error(errorMessage);
        }
      });
    }
  });
}
}






















