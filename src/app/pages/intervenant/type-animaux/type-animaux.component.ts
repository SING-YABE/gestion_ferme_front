import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TypeAnimalFormComponent } from './type-animaux-form/type-animaux-form.component';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from "primeng/table";
import { TypeAnimalService } from '../../../@core/service/type-animal.service';
import { HttpErrorResponse } from '@angular/common/http';

interface TypeAnimal {
  id: number;
  nom: string;
  description?: string;
}

interface ApiResponse {
  successful: boolean;
  message: string;
  technicalMessage: string | null;
  data: TypeAnimal[];
  code: number;
}

@Component({
  selector: 'app-type-animal',
  standalone: true,
  imports: [
    CommonModule,
    TypeAnimalFormComponent,
    ConfirmDialogModule,
    TableModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './type-animaux.component.html',
  styleUrl: './type-animaux.component.scss'
})
export class TypeAnimalComponent {
  pageSize = 5;
  loading = false;
  typeAnimaux: TypeAnimal[] = [];

  constructor(
    private toastr: ToastrService,
    private typeAnimalService: TypeAnimalService,
    private cs: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.loadData();  
  }

loadData(): void {
  this.loading = true;
  this.typeAnimalService.getAll().subscribe({
    next: (data: TypeAnimal[]) => {
      this.typeAnimaux = data;
      this.loading = false;
    },
    error: (err: HttpErrorResponse) => {
      console.error(err);
      this.toastr.error("Erreur lors du chargement des types d'animaux");
      this.loading = false;
    }
  });
}

    
  confirmDelete(typeAnimal: TypeAnimal) {
    this.cs.confirm({
      header: 'Confirmation',
      message: 'Voulez-vous vraiment supprimer ce type d\'animal ?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, je confirme',
      rejectLabel: 'Non',
      acceptButtonStyleClass: 'p-button-danger outlined p-button-sm',
      rejectButtonStyleClass: 'p-button-sm mr-2',
      accept: () => this.deleteTypeAnimal(typeAnimal.id)
    });
  }

  deleteTypeAnimal(id: number): void {
    this.typeAnimalService.deleteById(id).subscribe({
      next: (response: any) => {
        if (response.successful) {
          this.toastr.success(response.message || "Type d'animal supprimé avec succès");
          this.loadData();
        } else {
          this.toastr.warning(response.message || "La suppression n'a pas pu être effectuée");
        }
      },
      error: (err: HttpErrorResponse) => {
        this.handleError(err, "Erreur lors de la suppression du type d'animal");
      }
    });
  }

  private handleError(error: HttpErrorResponse, defaultMessage: string): void {
    console.error(error);
    const errorMessage = error.error?.message || error.message || defaultMessage;
    this.toastr.error(errorMessage, "Erreur");
  }
}


