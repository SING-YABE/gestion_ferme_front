import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BatimentService, BatimentResponseDTO } from '../../../@core/service/batiment.service';
import { TableModule } from 'primeng/table';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { BatimentFormComponent } from './batiment-form/batiment-form.component';

@Component({
  selector: 'app-batiment',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ConfirmDialogModule,
    BatimentFormComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './batiment.component.html',
  styleUrls: ['./batiment.component.scss']
})
export class BatimentComponent implements OnInit {
  batiments: BatimentResponseDTO[] = [];
  loading = false;
  pageSize = 5;

  constructor(
    private service: BatimentService,
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
      this.batiments = res;  // ⬅️ maintenant res est directement la liste
      this.loading = false;
    },
    error: err => {
      console.error(err);
      this.toastr.error("Erreur lors du chargement");
      this.loading = false;
    }
  });
}


  confirmDelete(batiment: BatimentResponseDTO) {
    this.cs.confirm({
      header: 'Confirmation',
      message: `Voulez-vous supprimer "${batiment.nom}" ?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteBatiment(batiment.id)
    });
  }

  deleteBatiment(id: number) {
  this.service.deleteById(id).subscribe({
    next: () => {
      this.toastr.success("Bâtiment supprimé avec succès");
      this.loadData();
    },
    error: err => {
      console.error(err);
      this.toastr.error("Erreur lors de la suppression");
    }
  });
}

}
