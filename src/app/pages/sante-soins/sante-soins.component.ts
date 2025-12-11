import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { SantesoinsFormComponent } from './santesoins-form/santesoins-form.component';
import { SoinAnimalDTO,SanteSoinsService } from '../../@core/service/santesoins.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
@Component({
  selector: 'app-sante-soins',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ConfirmDialogModule,
    SantesoinsFormComponent,
    FormsModule,
    RadioButtonModule,
DropdownModule,
    CheckboxModule,
    MultiSelectModule,
    CalendarModule
  ],
  
  providers: [ConfirmationService],
  templateUrl: './sante-soins.component.html',
})
export class SanteSoinsComponent implements OnInit {

  loading = false;
  data: SoinAnimalDTO[] = [];
  pageSize = 10;

  constructor(
    private service: SanteSoinsService,
    private confirm: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;

    this.service.getAll().subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  confirmDelete(item: SoinAnimalDTO) {
    this.confirm.confirm({
      message: 'Supprimer ce soin ?',
      accept: () => {
        this.service.delete(item.id!).subscribe(() => {
          this.loadData();
        });
      }
    });
  }
}