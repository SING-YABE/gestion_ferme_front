import { Component, OnInit } from '@angular/core';
import { EtatSanteService, EtatSanteResponseDTO } from '../../../@core/service/etat-sante.service';
import { TableModule } from 'primeng/table';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { EtatSanteFormComponent } from './etat-sante-form/etat-sante-form.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-etat-sante',
  standalone: true,
  imports: [
    TableModule,
    ConfirmDialogModule,
    EtatSanteFormComponent,
    ButtonModule
  ],
  providers: [ConfirmationService],
  templateUrl: './etat-sante.component.html',
  styleUrl: './etat-sante.component.scss'
})
export class EtatSanteComponent implements OnInit {
  etatsSante: EtatSanteResponseDTO[] = [];
  loading = false;
  pageSize = 5;

  constructor(
    private service: EtatSanteService,
    private toastr: ToastrService,
    private cs: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  // loadData(): void {
  //   this.loading = true;
  //   this.service.getAll().subscribe({
  //     next: res => {
  //       if (res.successful) this.etatsSante = res.data;
  //       else this.toastr.warning(res.message || "Aucune donnée reçue");
  //       this.loading = false;
  //     },
  //     error: err => {
  //       console.error(err);
  //       this.toastr.error("Erreur lors du chargement");
  //       this.loading = false;
  //     }
  //   });
  // }
  loadData(): void {
  this.loading = true;
  this.service.getAll().subscribe({
    next: res => {
      // ableau
      this.etatsSante = res as unknown as EtatSanteResponseDTO[];
      this.loading = false;
    },
    error: err => {
      console.error(err);
      this.toastr.error("Erreur lors du chargement");
      this.loading = false;
    }
  });
}


  confirmDelete(etat: EtatSanteResponseDTO) {
    this.cs.confirm({
      header: 'Confirmation',
      message: `Voulez-vous supprimer "${etat.description}" ?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteEtat(etat.id)
    });
  }

  deleteEtat(id: number) {
    this.service.deleteById(id).subscribe({
      next: res => {
        if (res.successful) {
          this.toastr.success(res.message || "Supprimé avec succès");
          this.loadData();
        } else this.toastr.warning(res.message || "Erreur lors de la suppression");
      },
      error: err => {
        console.error(err);
        this.toastr.error("Erreur ");
      }
    });
  }
}
