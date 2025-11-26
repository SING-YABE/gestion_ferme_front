import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TypeAlimentService, TypeAlimentResponseDTO } from '../../../@core/service/type-aliment.service';
import { TableModule } from 'primeng/table';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { TypeAlimentFormComponent } from './type-aliment-form/type-aliment-form.component';

@Component({
  selector: 'app-type-aliment',
  standalone: true,
  imports: [CommonModule, TableModule, ConfirmDialogModule, ButtonModule, TypeAlimentFormComponent],
  providers: [ConfirmationService],
  templateUrl: './type-aliment.component.html',
  styleUrls: ['./type-aliment.component.scss']
})
export class TypeAlimentComponent implements OnInit {
  typeAliments: TypeAlimentResponseDTO[] = [];
  loading = false;
  pageSize = 5;

  constructor(private service: TypeAlimentService,
              private toastr: ToastrService,
              private cs: ConfirmationService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.service.getAll().subscribe({
      next: res => {
        this.typeAliments = res;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.toastr.error('Erreur lors du chargement');
        this.loading = false;
      }
    });
  }

  confirmDelete(typeAliment: TypeAlimentResponseDTO) {
    this.cs.confirm({
      header: 'Confirmation',
      message: `Voulez-vous supprimer "${typeAliment.libelle}" ?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteTypeAliment(typeAliment.id)
    });
  }

  deleteTypeAliment(id: number) {
    this.service.deleteById(id).subscribe({
      next: () => {
        this.toastr.success('Type d’aliment supprimé avec succès');
        this.loadData();
      },
      error: err => {
        console.error(err);
        this.toastr.error('Erreur lors de la suppression');
      }
    });
  }
}
