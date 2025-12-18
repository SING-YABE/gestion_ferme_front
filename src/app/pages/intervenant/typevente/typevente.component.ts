import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TypeVenteResponseDTO, TypeventeService } from '../../../@core/service/typevente.service';
import { TypeventeFormComponent } from './typevente-form/typevente-form.component';

@Component({
  selector: 'app-typevente',
  standalone: true,
  imports: [
        CommonModule,
        TableModule,
        ConfirmDialogModule,
        TypeventeFormComponent
  ],
    providers: [ConfirmationService],
  templateUrl: './typevente.component.html',
  styleUrl: './typevente.component.scss'
})
export class TypeventeComponent {

typevente : TypeVenteResponseDTO[] = [];
  loading = false;
  pageSize = 5;

  constructor(
    private service: TypeventeService,
    private toastr: ToastrService,
    private cs: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

loadData(): void {
  this.loading = true;
  this.service.getAll().subscribe({
    next: res => {
      this.typevente = res; 
      this.loading = false;
    },
    error: err => {
      console.error(err);
      this.toastr.error("Erreur lors du chargement");
      this.loading = false;
    }
  });
}


  confirmDelete(typevente: TypeVenteResponseDTO) {
    this.cs.confirm({
      header: 'Confirmation',
      message: `Voulez-vous supprimer "${typevente.nom}" ?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteBatiment(typevente.id)
    });
  }

  deleteBatiment(id: number) {
  this.service.deleteById(id).subscribe({
    next: () => {
      this.toastr.success("Type Vente supprimé avec succès");
      this.loadData();
    },
    error: err => {
      console.error(err);
      this.toastr.error("Erreur lors de la suppression");
    }
  });
}

}

