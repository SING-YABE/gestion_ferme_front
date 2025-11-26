import {Component, OnInit} from '@angular/core';
import {DepartmentFormComponent} from "./department-form/department-form.component";
import {ButtonDirective} from "primeng/button";
import {FlexModule} from "@angular/flex-layout";
import {InputTextModule} from "primeng/inputtext";
import {ConfirmationService, PrimeTemplate} from "primeng/api";
import {TableModule} from "primeng/table";
import {emptyPage, PageResponse} from "../../../@core/model/page-response.model";
import {ToastrService} from "ngx-toastr";
import {DepartmentService} from "../../../@core/service/department.service";
import {ChipModule} from "primeng/chip";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faBuilding} from "@fortawesome/free-solid-svg-icons";
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { UserService } from '../../../@core/service/user.service';
import { AvatarModule } from 'primeng/avatar';
import { PaginatorModule } from 'primeng/paginator'; 
@Component({
  selector: 'app-department',
  standalone: true,
  imports: [
    PaginatorModule,
    AvatarModule,
    DepartmentFormComponent,
    ButtonDirective,
    FlexModule,
    InputTextModule,
    PrimeTemplate,
    TableModule,
    ConfirmDialogModule,
    ChipModule,
    FaIconComponent
  ],
  providers: [
    ConfirmationService
  ],
  templateUrl: './department.component.html',
  styleUrl: './department.component.scss'
})

export class DepartmentComponent implements OnInit {
  departments: PageResponse = emptyPage();
  pageSize: number = 10;
  loading = false;
  searchQuery: string = '';
  searchTimeout: any;
  
  constructor(
    private ds: DepartmentService, 
    private toastr: ToastrService, 
    private confirmationService: ConfirmationService,
    private usersService: UserService
  ) {}

  ngOnInit(): void {
    this.loadData(0, this.pageSize);
  }
 
  loadData(page = 0, size = 10) {
    this.loading = true;
    this.ds.getAll(page, size).subscribe({
      next: (data: any) => {
        this.departments = data.data;
        
        // Récupérer les noms des managers
        if (this.departments.content && this.departments.content.length > 0) {
          this.departments.content.forEach((dept: any) => {
            if (dept.managerCuid) {
              this.recupNomManager(dept);
            }
          });
        }
        
        this.loading = false;
      },
      error: err => {
        this.toastr.error(err.message);
        this.loading = false;
      }
    });
  }

  // Récupérer le nom du manager
  recupNomManager(department: any) {
    this.usersService.searchUserFromLdap(department.managerCuid).subscribe({
      next: (users: any) => {
        if (users && users.length > 0) {
          const user = users.find((u: any) => u.cuid === department.managerCuid);
          if (user) {
            department.managerName = user.displayname || user.displayName;
          }
        }
      },
      error: err => {
        console.error('Erreur récupération nom du manager', err);
      }
    });
  }

  confirmDelete(department: any) {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer le département ${department.name} ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-outlined p-button-sm mr-3',
      accept: () => {
        this.ds.delete(department.id).subscribe({
          next: () => {
            this.toastr.success('Département supprimé avec succès');
            this.loadData();
          },
          error: (err:any) => {
            this.toastr.error(err.message || 'Erreur lors de la suppression');
          }
        });
      }
    });
  }

  // recherche avec debounce
  onSearch(event: any): void {
    clearTimeout(this.searchTimeout);
    
    this.searchTimeout = setTimeout(() => {
      if (this.searchQuery && this.searchQuery.trim() !== '') {
        this.searchDepartments();
      } else {
        this.loadData(0, this.pageSize);
      }
    }, 300);
  }

  //  effectuer la recherche
  searchDepartments(): void {
    this.loading = true;
    this.ds.searchDepartmentsByName(this.searchQuery, 0, this.pageSize).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.departments = response.data;
          
          // Récupérer les noms des managers
          if (this.departments.content && this.departments.content.length > 0) {
            this.departments.content.forEach((dept: any) => {
              if (dept.managerCuid) {
                this.recupNomManager(dept);
              }
            });
          }
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.toastr.error(err.message || 'Erreur lors de la recherche de départements');
        this.loading = false;
      }
    });
  }

  // Méthode de pagination
  handleNext($event: any) {
    this.loading = true; 
    
    this.pageSize = $event.rows;
    const page = $event.first / $event.rows;
    
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      this.ds.searchDepartmentsByName(this.searchQuery, page, this.pageSize).subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.departments = response.data;
            
            if (this.departments.content && this.departments.content.length > 0) {
              this.departments.content.forEach((dept: any) => {
                if (dept.managerCuid) {
                  this.recupNomManager(dept);
                }
              });
            }
          }
          this.loading = false;
        },
        error: (err: any) => {
          this.toastr.error(err.message || 'Erreur lors de la pagination des résultats de recherche');
          this.loading = false;
        }
      });
    } else {
      this.loadData(page, this.pageSize);
    }
  }

  protected readonly faBuilding = faBuilding;
}







