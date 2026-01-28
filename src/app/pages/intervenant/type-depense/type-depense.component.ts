import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TypeDepenseService } from '../../../@core/service/type-depense.service';
import { TypeDepenseFormComponent } from './type-depense-form/type-depense-form.component';

interface TypeDepenseDTO {
  id?: number;
  nom: string;
}

@Component({
  selector: 'app-type-depense',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ConfirmDialogModule,
    TypeDepenseFormComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './type-depense.component.html',
})
export class TypeDepenseComponent implements OnInit {

  loading = false;
  typeDepenses: TypeDepenseDTO[] = [];
  pageSize = 10;
  
  showForm = false;
  mode: 'create' | 'edit' = 'create';
  selectedTypeDepense?: TypeDepenseDTO;

  constructor(
    private service: TypeDepenseService,
    private confirm: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;

    this.service.getAll().subscribe({
      next: (res) => {
        this.typeDepenses = res;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  handleShow(mode: 'create' | 'edit', typeDepense?: TypeDepenseDTO) {
    this.mode = mode;
    this.selectedTypeDepense = typeDepense;
    this.showForm = true;
  }

  confirmDelete(item: TypeDepenseDTO) {
    this.confirm.confirm({
      message: 'Les types de dépenses sont en lecture seule et ne peuvent pas être supprimés.',
      header: 'Information',
      icon: 'pi pi-info-circle',
      rejectVisible: false,
      acceptLabel: 'OK'
    });
  }
}