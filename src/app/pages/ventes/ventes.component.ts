import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { Vente, VenteService } from '../../@core/service/vente.service';
import { VentesFormComponent } from './ventes-form/ventes-form.component';

@Component({
  selector: 'app-ventes',
  standalone: true,
  imports: [CommonModule, TableModule, ConfirmDialogModule, VentesFormComponent],
  providers: [ConfirmationService],
  templateUrl: './ventes.component.html',
  styleUrls: ['./ventes.component.scss']
})
export class VentesComponent {

  ventes: Vente[] = [];
  loading = false;
  pageSize = 5;

  constructor(
    private venteService: VenteService,
    private toastr: ToastrService,
    private cs: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.venteService.getAll().subscribe({
      next: (data) => {
        this.ventes = data;
        this.loading = false;
      },
      error: () => {
        this.toastr.error("Erreur chargement");
        this.loading = false;
      }
    });
  }

  confirmDelete(vente: Vente) {
    this.cs.confirm({
      header: 'Confirmation',
      message: 'Voulez-vous vraiment supprimer cette vente ?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => this.deleteVente(vente.id!)
    });
  }

  deleteVente(id: number) {
    this.venteService.delete(id).subscribe({
      next: () => {
        this.toastr.success('Vente supprimée');
        this.loadData();
      },
      error: () => {
        this.toastr.error('Échec lors de la suppression');
      }
    });
  }
}
