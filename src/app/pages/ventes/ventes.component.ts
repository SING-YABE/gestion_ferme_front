import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { VenteService, VenteDetailResponseDTO } from '../../@core/service/vente.service';
import { VentesFormComponent } from './ventes-form/ventes-form.component';

@Component({
  selector: 'app-ventes',
  standalone: true,
  imports: [
    CommonModule, 
    TableModule, 
    ButtonModule,
    ConfirmDialogModule, 
    VentesFormComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './ventes.component.html',
  styleUrls: ['./ventes.component.scss']
})
export class VentesComponent implements OnInit {

  ventes: VenteDetailResponseDTO[] = [];
  loading = false;
  pageSize = 5;
  expandedRows: any = {};

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

  // 🆕 Méthode pour imprimer la facture
  imprimerFacture(venteId: number): void {
    this.venteService.getFacturePdf(venteId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        // Alternative: Télécharger directement
        // const link = document.createElement('a');
        // link.href = url;
        // link.download = `facture_${venteId}.pdf`;
        // link.click();
        // window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.toastr.error('Erreur génération facture')
      }
    });
  }

  confirmDelete(vente: VenteDetailResponseDTO): void {
    this.cs.confirm({
      header: 'Confirmation',
      message: `Supprimer la vente du ${vente.dateVente} (${vente.animaux.length} animaux) ?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => this.deleteVente(vente.id)
    });
  }

  deleteVente(id: number): void {
    this.venteService.delete(id).subscribe({
      next: () => {
        this.toastr.success('Vente supprimée (animaux remis en vente)');
        this.loadData();
      },
      error: () => {
        this.toastr.error('Échec lors de la suppression');
      }
    });
  }
}