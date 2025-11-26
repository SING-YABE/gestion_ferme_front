import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FournisseurService, FournisseurResponseDTO } from '../../../@core/service/fournisseur.service';
import { TableModule } from 'primeng/table';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { FournisseurFormComponent } from './fournisseur-form/fournisseur-form.component';

@Component({
  selector: 'app-fournisseur',
  standalone: true,
  imports: [CommonModule, TableModule, ConfirmDialogModule, ButtonModule, FournisseurFormComponent],
  providers: [ConfirmationService],
  templateUrl: './fournisseur.component.html',
  styleUrls: ['./fournisseur.component.scss']
})
export class FournisseurComponent implements OnInit {
  fournisseurs: FournisseurResponseDTO[] = [];
  loading = false;
  pageSize = 5;

  constructor(private service: FournisseurService,
              private toastr: ToastrService,
              private cs: ConfirmationService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.service.getAll().subscribe({
      next: res => {
        this.fournisseurs = res;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.toastr.error('Impossible de charger');
        this.loading = false;
      }
    });
  }

  confirmDelete(fournisseur: FournisseurResponseDTO) {
    this.cs.confirm({
      header: 'Confirmation',
      message: `Voulez-vous vraiment supprimer "${fournisseur.nom}" ?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteFournisseur(fournisseur.id)
    });
  }

  deleteFournisseur(id: number) {
    this.service.deleteById(id).subscribe({
      next: () => {
        this.toastr.success('Fournisseur supprimé avec succès');
        this.loadData();
      },
      error: err => {
        console.error(err);
        this.toastr.error('Erreur lors de la suppression');
      }
    });
  }
}
