import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuiviReproductionFormComponent } from './suivi-reproduction-form/suivi-reproduction-form.component';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { SuiviReproduction, SuiviReproductionService } from '../../@core/service/suivi-reproduction.service';
import { AnimalService } from '../../@core/service/animal.service';

@Component({
  selector: 'app-suivi-reproduction',
  standalone: true,
  imports: [CommonModule, SuiviReproductionFormComponent, TableModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './suivi-reproduction.component.html',
  styleUrls: ['./suivi-reproduction.component.scss']
})
export class SuiviReproductionComponent {
  suivis: SuiviReproduction[] = [];
  loading = false;
  selectedSuivi: SuiviReproduction | null = null;
  showFormDialog = false;
  modeForm: 'create' | 'edit' = 'create';

  pageSize = 5;

  constructor(
    private srService: SuiviReproductionService,
    private toastr: ToastrService,
    private cs: ConfirmationService,
        private animalService: AnimalService,    
  ) {}

  ngOnInit(): void {
    
    this.loadData();
  }

  

  loadData(): void {
    this.loading = true;
    this.srService.getAll().subscribe({
      next: (data) => {
        this.suivis = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Erreur lors du chargement des suivis');
        this.loading = false;
      }
    });
  }

  confirmDelete(suivi: SuiviReproduction) {
    this.cs.confirm({
      header: 'Confirmation',
      message: 'Voulez-vous vraiment supprimer ce suivi reproduction ?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => this.deleteSuivi(suivi.id!)
    });
  }

  deleteSuivi(id: number) {
    this.srService.deleteById(id).subscribe({
      next: () => {
        this.toastr.success('Suivi reproduction supprimé');
        this.loadData();
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Erreur lors de la suppression du suivi');
      }
    });
  }
  editSuivi(suivi: SuiviReproduction) {
  this.selectedSuivi = suivi;
  this.modeForm = 'edit';
  this.showFormDialog = true;
}
}


