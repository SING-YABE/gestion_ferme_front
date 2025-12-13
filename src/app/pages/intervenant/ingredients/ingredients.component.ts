import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { IngredientService,IngredientResponseDTO } from '../../../@core/service/ingredient.service';
import { IngredientsFormComponent } from './ingredients-form/ingredients-form.component';

@Component({
  selector: 'app-ingredients',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ConfirmDialogModule,
    IngredientsFormComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './ingredients.component.html',
  styleUrls: ['./ingredients.component.scss']
})
export class IngredientsComponent implements OnInit {
  ingredients: IngredientResponseDTO[] = [];
  loading = false;
  pageSize = 5;

  constructor(
    private service: IngredientService,
    private toastr: ToastrService,
    private cs: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.service.getAll().subscribe({
      next: res => {
        this.ingredients = res;
        this.loading = false;
      },
      error: () => {
        this.toastr.error("Erreur lors du chargement");
        this.loading = false;
      }
    });
  }

  confirmDelete(item: IngredientResponseDTO) {
    this.cs.confirm({
      header: 'Confirmation',
      message: `Voulez-vous supprimer "${item.nom}" ?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.delete(item.id)
    });
  }

  delete(id: number) {
    this.service.deleteById(id).subscribe({
      next: () => {
        this.toastr.success("Supprimé avec succès");
        this.loadData();
      },
      error: () => {
        this.toastr.error("Erreur lors de la suppression");
      }
    });
  }
}
