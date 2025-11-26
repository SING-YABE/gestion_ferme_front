import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { StrategicCriterionService } from '../../../@core/service/strategic-criterion.service';
import { HttpErrorResponse } from '@angular/common/http';
import { StrategicCriterionFormComponent } from './strategic-criterion-form/strategic-criterion-form.component';


interface StrategicCriterion {
  id: string;
  name: string;
  description: string;
}

interface ApiResponse {
  successful: boolean;
  message: string;
  technicalMessage: string | null;
  data: StrategicCriterion[];
  code: number;
}


@Component({
  selector: 'app-strategic-criterion',
  standalone: true,
  imports: [
    ConfirmDialogModule,
    TableModule,
    StrategicCriterionFormComponent
  ],
    providers: [ConfirmationService],
  
  templateUrl: './strategic-criterion.component.html',
  styleUrl: './strategic-criterion.component.scss'
})
export class StrategicCriterionComponent {

  pageSize = 5;
  loading = false;
  strategicCriterions: StrategicCriterion[] = [];

  constructor(
      private toastr: ToastrService,
      private strategicCriterionService: StrategicCriterionService,
      private confirmationService: ConfirmationService,
      private cs: ConfirmationService,
    ) {}
   ngOnInit(): void {
      this.loadData();  
    }
  
    loadData(): void {
      this.loading = true;
      
      this.strategicCriterionService.getAll().subscribe({
        next: (response: ApiResponse) => {
          if (response.successful && response.data) {
            this.strategicCriterions = response.data;
          } else {
            this.toastr.warning(response.message || "Aucune donnée reçue", "Avertissement");
          }
          this.loading = false;
        },
        error: (err: HttpErrorResponse) => {
          this.handleError(err, "Erreur lors du chargement des criteres strategiques");
          this.loading = false;
        }
      });
    }
  
  
    confirmDelete(strategicCriterion: StrategicCriterion) {
      this.cs.confirm({
        header: 'Confirmation',
        message: 'Voulez-vous vraiment supprimer cette critère strategique ?',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Oui, je confirme',
        rejectLabel: 'Non',
        acceptButtonStyleClass: 'p-button-danger outlined p-button-sm',
        rejectButtonStyleClass: 'p-button-sm mr-2',
        accept: () => this.deleteProjectType(strategicCriterion.id),
        reject: () => {}
      });
    }
  
    deleteProjectType(id: string): void {
      this.strategicCriterionService.deleteById(id).subscribe({
        next: (response: any) => {
          if (response.successful) {
            this.toastr.success(response.message || "Type de projet supprimé avec succès");
            this.loadData();
          } else {
            this.toastr.warning(response.message || "La suppression n'a pas pu être effectuée");
          }
        },
        error: (err: HttpErrorResponse) => {
          this.handleError(err, "Erreur lors de la suppression du type de projet");
        }
      });
    }
  
    private handleError(error: HttpErrorResponse, defaultMessage: string): void {
      console.error(error);
      const errorMessage = error.error?.message || error.message || defaultMessage;
      this.toastr.error(errorMessage, "Erreur");
    }

}
