import { Component, OnInit } from '@angular/core';
import { CategorieRisquesFormComponent } from './categorie-risques-form/categorie-risques-form.component';  // Formulaire pour la catégorie des risques
import { ButtonModule } from 'primeng/button';  // Module pour les boutons
import { FlexLayoutModule } from '@angular/flex-layout';  // Module FlexLayout
import { InputTextModule } from 'primeng/inputtext';  // Module pour le champ de texte
import { TableModule } from 'primeng/table';  // Module pour la table
import { ChipModule } from 'primeng/chip';  // Module pour les puces
import { ToastrService } from 'ngx-toastr';  // Service pour afficher des notifications
import { CategorieRisquesService } from '../../../@core/service/categorie-risques.service';  // Service pour les catégories de risques
import { PageResponse, emptyPage } from '../../../@core/model/page-response.model';  // Modèles pour la pagination
import { FaIconComponent } from '@fortawesome/angular-fontawesome';  // Module pour l'icône FontAwesome
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';  // Icône pour le risque
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-gestion-categorie-risques',
  standalone: true,
  imports: [
    CategorieRisquesFormComponent,  // Formulaire pour les catégories de risques
    ButtonModule,  // Module pour les boutons
    FlexLayoutModule,  // Module FlexLayout
    InputTextModule,  // Module InputText
    TableModule,  // Module Table
    ChipModule,  // Module Chip
    FaIconComponent, 
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './gestion-categorie-risques.component.html',
  styleUrls: ['./gestion-categorie-risques.component.scss']
})
export class GestionCategorieRisquesComponent implements OnInit {
  categorieRisques: any[] = [];  // Assure-toi que 'content' est un tableau vide au départ
  pageSize: number = 10;
  loading = false;
  
  constructor(
    private categorieRisquesService: CategorieRisquesService, 
    private toastr: ToastrService,
        private cs: ConfirmationService,
    
  ) {}

  ngOnInit(): void {
    this.loadData();  // Charger les données au démarrage
  }

  // Fonction pour charger les catégories de risques
  loadData(page = 0, size = 10) {
    this.loading = true;
    this.categorieRisquesService.getAll(page, size).subscribe({
      next: (data: any) => {
        this.categorieRisques = data.data;  // Utilisation des données retournées par le service
        console.log('Type de risque récupérées depuis la base de données:', this.categorieRisques);
        this.loading = false;
      },
      error: err => {
        console.error('Erreur lors de la récupération des types de risque:', err);
        this.toastr.error(err.message, 'Erreur');
        this.loading = false;
      }
    });
  }

  handleNext($event: any) {
    this.pageSize = $event.rows;
    this.loadData($event.first / $event.rows, this.pageSize);
  }

  confirmDelete(id: string) {
    this.cs.confirm({
      header: 'Confirmation',
      message: 'Voulez-vous vraiment supprimer ce type de risque ?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, je confirme',
      rejectLabel: 'Non',
      acceptButtonStyleClass: 'p-button-danger outlined p-button-sm',
      rejectButtonStyleClass: 'p-button-sm mr-2',
      accept: () => this.deleteCategory(id),
      reject: () => {}
    });
  }

  deleteCategory(id: string) {
    this.loading = true;
    this.categorieRisquesService.deleteRiskCategory(id).subscribe({
      next: () => {
        this.toastr.success('Type de risque supprimé avec succès !');
        this.loadData();
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error(error.error?.message ?? error.message, 'Erreur');
        this.loading = false;
      }
    });
  }



  // Fonction pour supprimer une catégorie de risque
  deleteCategory1(id: string) {
    this.cs.confirm({
      header: 'Attention!',
      message: 'Voulez-vous vraiment supprimer ce type de risque ?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, je confirme',
      rejectLabel: 'Non',
      defaultFocus: 'reject',
      acceptButtonStyleClass: 'p-button-danger outlined p-button-sm',
      rejectButtonStyleClass: 'p-button-sm mr-2',
      accept: () => {
        this.loading = true;
        this.categorieRisquesService.deleteRiskCategory(id).subscribe({
          next: () => {
            this.toastr.success('Type de risque supprimé avec succès !');
            this.loadData(); // Recharger les données après suppression
            this.loading = false;
          },
          error: (error) => {
            this.toastr.error(error.error?.message ?? error.message, 'Erreur');
            this.loading = false;
          }
        });
      },
      reject: () => {}
    });
  }
  
  

  // Icône de risque à utiliser dans la table
  protected readonly faExclamationTriangle = faExclamationTriangle;
}
