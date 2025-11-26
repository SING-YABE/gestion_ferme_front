import {Component, OnInit, } from '@angular/core';
import { NgClass } from '@angular/common';
import {AppService} from "../../@core/service/app.service";
import {InputTextModule} from "primeng/inputtext";
import {ButtonDirective} from "primeng/button";
import {ConfirmationService, PrimeTemplate} from "primeng/api";
import {TableModule} from "primeng/table";
import {UserEditorComponent} from "../intervenant/users-management/user-editor/user-editor.component";
import {ProjectFormComponent} from "./project-form/project-form.component";
import {DropdownModule} from "primeng/dropdown";
import {ProjectService} from "../../@core/service/project.service";
import {emptyPage, PageResponse} from "../../@core/model/page-response.model";
import {ChipModule} from "primeng/chip";
import {TagModule} from "primeng/tag";
import {Router, RouterLink} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import {HasPermissionDirective} from "../../@core/security/directives/has-permission.directive";
import { DialogService } from 'primeng/dynamicdialog';
import { ProjectDetailsLayoutComponent } from './project-details-layout/project-details-layout.component';
import { ProjectSuspensionDialogComponent } from './project-suspension-dialog/project-suspension-dialog.component';
import { UserService } from '../../@core/service/user.service';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DialogModule } from 'primeng/dialog';
import { BadgeModule } from 'primeng/badge';
@Component({
  selector: 'app-project',
  standalone: true,
  imports: [
    BadgeModule,
    DialogModule,
    CommonModule,
    TooltipModule,
    FormsModule,
    NgClass,
    InputTextModule,
    PrimeTemplate,
    TableModule,
    UserEditorComponent,
    ProjectFormComponent,
    ProjectDetailsLayoutComponent,
    DropdownModule,
    ChipModule,
    TagModule,
    RouterLink,
    ButtonDirective,
    ConfirmDialogModule,
    HasPermissionDirective
  ],
  providers: [ConfirmationService],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss'
})
export class ProjectComponent implements OnInit {
  statusModalVisible = false;
  selectedProject: any = null;
  newProjectStatus: string = '';
  projectsPage: PageResponse = emptyPage();
  pageSize = 0;
  loading = false;
  userProjects: any = [];
  users: any[] = [];
  filtre: any = false;
  searchTerm: string = '';
  chefProjetSearchTerm: string = ''; 
  selectedStatus: string = '';
  searchSubject: Subject<string> = new Subject<string>();  
   chefProjetSearchSubject: Subject<string> = new Subject<string>(); 
  chefProjetSearchSubscription: Subscription | undefined;
  searchSubscription: Subscription | undefined;            
  statusOptions = [
    { label: 'Tous', value: 'Tous', icon: 'pi pi-filter' },
    { label: 'ETUDE', value: 'ETUDE', icon: 'pi pi-pencil' },
    { label: 'EXECUTION', value: 'EXECUTION', icon: 'pi pi-cog' },
    { label: 'PRODUCTION', value: 'PRODUCTION', icon: 'pi pi-check-circle' },
    { label: 'Suspendu', value: 'Suspendu', icon: 'pi pi-pause' }
  ];
  
  
  statusDisplayMap: { [key: string]: string } = {
    PLANNED: 'ETUDE',
    IN_PROGRESS: 'EXECUTION',
    COMPLETED: 'PRODUCTION',
    SUSPENDED: 'Suspendu',
    CANCELED: 'Annulé',
  };
  
getStatusClass(status: string): string {
    if (!status) return '';
    
    const statusMap: {[key: string]: string} = {
        'PLANNED': 'status-planned',
        'ETUDE': 'status-planned',
        'IN_PROGRESS': 'status-in-progress',
        'EXECUTION': 'status-in-progress',
        'COMPLETED': 'status-completed',
        'PRODUCTION': 'status-completed',
        'SUSPENDED': 'status-suspended',
        'CANCELED': 'status-canceled'
    };
    
    return statusMap[status.toUpperCase()] || '';
}
  constructor(
    private appService: AppService,
    private ps: ProjectService,
    private router: Router,
    private cs: ConfirmationService,
    private toastr: ToastrService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private usersService: UserService,
    
  ) { }

 ngOnInit(): void {
    this.appService.setTitle('Projets');
    
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.loadFilteredData(0, this.pageSize);
    });

    this.chefProjetSearchSubscription = this.chefProjetSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.chefProjetSearchTerm = term;
      this.loadFilteredData(0, this.pageSize);
    });
    
    this.getUserProjects();
    this.loadShamsyUsers();
  }
loadData(page = 0, size = 10): void {
    // Si filtre actif
    if (this.hasActiveFilters()) {
      this.loadFilteredData(page, size);
      return;
    }
    
    this.loading = true;
    this.ps.getAll(page, size).subscribe({
      next: (value: any) => {
        this.processProjectStatuses(value);
        this.projectsPage = value;
        this.loading = false;
      },
      error: err => {
        console.error('Erreurchargement:', err);
        this.loading = false;
      }
    });
  }



  refreshTable(event: any) {
    switch (event.value) {
      case "Validé":
        this.filtre = true;
        break;
      case "En attente":
        this.filtre = false;
        break;
    }
    this.loadData();
  }

  getUserProjects(page = 0, size = 10){
    this.loading = true;
    this.ps.getUserProjects().subscribe({
      next: (value: any) => {
        // statuts prjet user
        if (value && value.data) {
          value.data.forEach((project: any) => {
            project.statusDisplayName = this.getStatusDisplayName(project.status);
          });
        }
        this.userProjects = value;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
      }
    });
  }

  private loadShamsyUsers() {
    this.loading = true;
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
        
        // users charges, charge les projets
        this.loadData(0, this.pageSize);
        this.getUserProjects();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement utilisateurs Shamsy', err);
        this.loading = false;

        this.loadData(0, this.pageSize);
        this.getUserProjects();
      }
    });
  }

  getChefProjetDisplayName(cuidChefProjet: string): string {
    if (!cuidChefProjet) return 'Non défini';
    
    const chefProjet = this.users.find(user => user.cuid === cuidChefProjet);
    if (chefProjet) {
      return chefProjet.displayName || `${chefProjet.firstname} ${chefProjet.lastname}`;
    }
    return cuidChefProjet; 
  }

  reload(): void {
    this.loadData(0, this.pageSize);
    this.getUserProjects();
  }
   handleNext($event: any): void {
    this.pageSize = $event.rows;
    const page = $event.first / $event.rows;
    
    if (this.hasActiveFilters()) {
      this.loadFilteredData(page, this.pageSize);
    } else {
      this.loadData(page, this.pageSize);
    }
  }

  showUserDetails(projectId: number): void {
    this.router.navigate(['/projects/details/', projectId,'phases']); 
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
            this.loadData();
            this.getUserProjects();
          },
          error: error => {
            console.error('Erreur de suppression:', error);
            this.toastr.error(
              "Erreur lors de la suppression du projet.Contrainte. " 
            );
          }
        });
      },
      reject: () => {}
    });
  }

  confirmDelete(project: any) {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer le projet ${project.name} ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-outlined p-button-sm mr-3',
      accept: () => {
        this.ps.delete(project.id).subscribe({
          next: () => {
            this.toastr.success('Projet supprimé avec succès');
            this.loadData();
          },
          error: (err:any) => {
            this.toastr.error(err.message || 'Erreur lors de la suppression');
          }
        });
      }
    });
  }

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
        // si ok, donné
        this.reload();
      }
    });
  }

  onSearch(): void {
    this.loadFilteredData(0, this.pageSize);
  }
 loadFilteredData(page = 0, size = 10): void {
    this.loading = true;
    const searchTerm = this.searchTerm?.trim() || '';
    const chefProjetTerm = this.chefProjetSearchTerm?.trim() || '';
    let statusValue = '';
    
    if (this.selectedStatus && this.selectedStatus !== 'Tous') {
      statusValue = this.selectedStatus;
    }    
    this.ps.getAllFiltered(page, size, searchTerm, statusValue, chefProjetTerm).subscribe({
      next: (value: any) => {
        this.processProjectStatuses(value);
        this.projectsPage = value;
        this.loading = false;
      },
      error: err => {
        console.error('Erreur lors du chargement filtré:', err);
        this.loading = false;
      }
    });
  }
  // processProjectStatuses(data: any): void {
  //   if (data && data.content) {
  //     data.content.forEach((project: any) => {
  //       project.statusDisplayName = this.getStatusDisplayName(project.status);
  //     });
  //   }
  // }
  processProjectStatuses(response: any): void {
    if (response?.content) {
        response.content = response.content.map((project: any) => {
            return {
                ...project,
                statusDisplayName: this.getStatusDisplayName(project.status),
                manualStatusDisplayName: this.getStatusDisplayName(project.manualStatus)
            };
        });
    }
}

getStatusDisplayName(status: string): string {
    if (!status) return '';
    
    const displayMap: {[key: string]: string} = {
        'PLANNED': 'ETUDE',
        'IN_PROGRESS': 'EXECUTION',
        'COMPLETED': 'PRODUCTION',
        'SUSPENDED': 'Suspendu',
        'CANCELED': 'Annulé'
    };
    
    return displayMap[status.toUpperCase()] || status;
}


onSearchInput(event: any): void {
    const term = event.target.value || '';
    this.searchSubject.next(term);
  }

  onChefProjetSearchInput(event: any): void {
    const term = event.target.value || '';
    this.chefProjetSearchSubject.next(term);
  }

  onStatusChange(event: any): void {
    this.selectedStatus = event.value || '';
    this.loadFilteredData(0, this.pageSize);
  }

ngOnDestroy(): void {
  if (this.searchSubscription) {
    this.searchSubscription.unsubscribe();
  }
   if (this.chefProjetSearchSubscription) {
      this.chefProjetSearchSubscription.unsubscribe();
    }
}

clearFilters(): void {
    this.searchTerm = '';
    this.chefProjetSearchTerm = '';
    this.selectedStatus = '';
    this.loadData(0, this.pageSize);
  }
  

   private hasActiveFilters(): boolean {
    return !!(this.searchTerm?.trim() || 
             this.chefProjetSearchTerm?.trim() || 
             (this.selectedStatus && this.selectedStatus !== 'Tous'));
  }


//   openStatusModal(project: any): void {
//     this.selectedProject = project;
//     this.newProjectStatus = project.status || '';
//     this.statusModalVisible = true;
// }
openStatusModal(project: any): void {
    this.selectedProject = project;
    this.newProjectStatus = project.manualStatus || '';
    this.statusModalVisible = true;
}

closeStatusModal(): void {
    this.statusModalVisible = false;
    this.selectedProject = null;
    this.newProjectStatus = '';
}

// updateProjectStatus(): void {
//     if (!this.selectedProject || !this.newProjectStatus?.trim()) {
//         return;
//     }
    
//     const statusRequest = {
//         status: this.newProjectStatus.trim()
//     };
    
//     this.ps.updateProjectStatus(this.selectedProject.projectId, statusRequest).subscribe({
//         next: (response) => {
//             // this.toastr.success('Statut maj avec succès');
//             // this.closeStatusModal();
//             // this.reload();
//              // si la réponse indique un succès
//             if (response && response.successful !== false) {
//                 this.toastr.success('Statut mis à jour avec succès');
//                 this.closeStatusModal();
//                 this.reload();
//             } else {
//                 const errorMessage = response?.technicalMessage || response?.message || 'Erreur lors de la mise à jour du statut';
//                 this.toastr.error(errorMessage);
//             }
//         },
//         error: (error) => {
//             this.toastr.error('Erreur lors de la maj du statut');
//             console.error('Erreur:', error);
//         }
//     });
// }

updateProjectStatus(): void {
  if (!this.selectedProject || !this.newProjectStatus?.trim()) {
    return;
  }

  this.ps.updateProjectManualStatus(
    this.selectedProject.projectId,
    this.newProjectStatus.trim()
  ).subscribe({
    next: (response: any) => {
      if (response?.successful !== false) {
        this.toastr.success('Statut manuel mis à jour avec succès');
        this.closeStatusModal();
        this.reload();
      } else {
        const errorMessage = response?.technicalMessage || response?.message || 'Erreur lors de la mise à jour du statut';
        this.toastr.error(errorMessage);
      }
    },
    error: (error: any) => {
      this.toastr.error('Erreur lors de la mise à jour du statut');
      console.error('Erreur:', error);
    }
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
          this.reload();
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
