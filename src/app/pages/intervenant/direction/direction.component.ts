import {Component, NgModule, OnInit} from '@angular/core';
import {ButtonDirective} from "primeng/button";
import {FlexModule} from "@angular/flex-layout";
import {InputTextModule} from "primeng/inputtext";
import {PrimeTemplate} from "primeng/api";
import {TableModule} from "primeng/table";
import {UserEditorComponent} from "../users-management/user-editor/user-editor.component";
import {DirectionFormComponent} from "./direction-form/direction-form.component";
import {ToastrService} from "ngx-toastr";
import {DirectionService} from "../../../@core/service/direction.service";
import {emptyPage, PageResponse} from "../../../@core/model/page-response.model";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faBuilding} from "@fortawesome/free-solid-svg-icons";
import { UserService } from '../../../@core/service/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
@Component({
  selector: 'app-direction',
  standalone: true,
  imports: [
    FormsModule,
    ConfirmDialogModule,
    CommonModule,
    ButtonDirective,
    FlexModule,
    InputTextModule,
    PrimeTemplate,
    TableModule,
    UserEditorComponent,
    DirectionFormComponent,
    FaIconComponent
  ],
  providers: [ConfirmationService], 
  templateUrl: './direction.component.html',
  styleUrl: './direction.component.scss'
})
export class DirectionComponent implements OnInit {

  directions: PageResponse = emptyPage();
  pageSize: number = 10;
  searchQuery: string = '';
  searchTimeout: any;
  loading = false;

  constructor(
    private ds: DirectionService, 
    private toastr: ToastrService,
     private usersService: UserService,     
     private confirmationService: ConfirmationService,
  ) {
  }

  ngOnInit(): void {
    this.loadData(0, this.pageSize);
  }

  loadData(page = 0, size = 10) {
    this.loading = true;
    this.ds.getAll(page, size).subscribe({
      next: (data: any) => {
        this.directions = data.data;
        
        // Récupérer les noms des directeurs
        if (this.directions.content && this.directions.content.length > 0) {
          this.directions.content.forEach((dir: any) => {
            if (dir.directorCuid) {
              this.recupNomDirecteur(dir);
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

  // Méthode pour la recherche
  onSearch(event: any): void {
    clearTimeout(this.searchTimeout);
    
    this.searchTimeout = setTimeout(() => {
      if (this.searchQuery && this.searchQuery.trim() !== '') {
        this.searchDirections();
      } else {
        this.loadData(0, this.pageSize);
      }
    }, 300);
  }

  confirmDelete(direction: any) {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer la direction ${direction.name} ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-outlined p-button-sm mr-3',
      accept: () => {
        this.ds.delete(direction.id).subscribe({
          next: () => {
            this.toastr.success('Direction supprimé avec succès');
            this.loadData();
          },
          error: (err:any) => {
            this.toastr.error(err.message || 'Erreur lors de la suppression');
          }
        });
      }
    });
  }

  searchDirections(): void {
    this.loading = true;
    this.ds.searchDirectionsByName(this.searchQuery, 0, this.pageSize).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.directions = response.data;
          
          // Récupérer les noms des directeurs
          if (this.directions.content && this.directions.content.length > 0) {
            this.directions.content.forEach((dir: any) => {
              if (dir.directorCuid) {
                this.recupNomDirecteur(dir);
              }
            });
          }
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.toastr.error(err.message || 'Erreur lors de la recherche de directions');
        this.loading = false;
      }
    });
  }

  // pagination avec recherche
  handleNext($event: any) {
    this.pageSize = $event.rows;
    const page = $event.first / $event.rows;
    
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      this.ds.searchDirectionsByName(this.searchQuery, page, this.pageSize).subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.directions = response.data;
            
            if (this.directions.content && this.directions.content.length > 0) {
              this.directions.content.forEach((dir: any) => {
                if (dir.directorCuid) {
                  this.recupNomDirecteur(dir);
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
      // Si pas de recherche active
      this.loadData(page, this.pageSize);
    }
  }

  recupNomDirecteur(direction: any) {
    this.usersService.searchUserFromLdap(direction.directorCuid).subscribe({
      next: (users: any) => {
        if (users && users.length > 0) {
          const user = users.find((u: any) => u.cuid === direction.directorCuid);
          if (user) {
            direction.directorName = user.displayname || user.displayName;
          }
        }
      },
      error: err => {
        console.error('Erreur récupération nom du directeur', err);
      }
    });
  }

  protected readonly faBuilding = faBuilding;
}
