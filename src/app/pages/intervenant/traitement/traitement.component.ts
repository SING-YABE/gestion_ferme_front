import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TraitementFormComponent } from './traitement-form/traitement-form.component';
import { TraitementService, TraitementDTO } from '../../../@core/service/traitement.service';

@Component({
  selector: 'app-traitement',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, ConfirmDialogModule, TraitementFormComponent],
  templateUrl: './traitement.component.html',
  styleUrls: ['./traitement.component.scss'],
  providers: [ConfirmationService]
})
export class TraitementComponent implements OnInit {

  traitements: TraitementDTO[] = [];
  loading = false;
  pageSize = 10;

  showForm = false;
  mode: 'create' | 'edit' = 'create';
  selectedTraitement?: TraitementDTO;

  constructor(private service: TraitementService, private confirmationService: ConfirmationService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.service.getAll().subscribe({
      next: data => {
        this.traitements = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  handleShow(mode: 'create' | 'edit', target?: TraitementDTO) {
    this.mode = mode;
    this.selectedTraitement = target;
    this.showForm = true;
  }

  confirmDelete(item: TraitementDTO) {
    this.confirmationService.confirm({
      message: `Voulez-vous supprimer ${item.nom} ?`,
      accept: () => this.service.delete(item.id!).subscribe(() => this.loadData())
    });
  }
}
