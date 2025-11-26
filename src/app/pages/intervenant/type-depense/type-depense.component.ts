import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TypeDepenseFormComponent } from './type-depense-form/type-depense-form.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TypeDepenseService } from '../../../@core/service/type-depense.service';

interface TypeDepenseDTO {
  id?: number;
  nom: string;
}

@Component({
  selector: 'app-type-depense',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, ConfirmDialogModule, TypeDepenseFormComponent, ReactiveFormsModule],
  templateUrl: './type-depense.component.html',
  styleUrls: ['./type-depense.component.scss'],
  providers: [ConfirmationService]
})
export class TypeDepenseComponent implements OnInit {

  typeDepenses: TypeDepenseDTO[] = [];
  loading = false;
  pageSize = 10;
  showForm = false;
  mode: 'create' | 'edit' = 'create';
  selectedTypeDepense?: TypeDepenseDTO;

  constructor(
    private service: TypeDepenseService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.service.getAll().subscribe({
      next: data => {
        this.typeDepenses = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  handleShow(mode: 'create' | 'edit', target?: TypeDepenseDTO) {
    this.mode = mode;
    this.selectedTypeDepense = target;
    this.showForm = true;
  }

  confirmDelete(item: TypeDepenseDTO) {
    this.confirmationService.confirm({
      message: `Voulez-vous supprimer ${item.nom} ?`,
      accept: () => this.service.delete(item.id!).subscribe(() => this.loadData())
    });
  }
}
