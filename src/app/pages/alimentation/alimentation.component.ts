import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { AlimentationFormComponent } from './alimentation-form/alimentation-form.component';
import { AlimentationResponseDTO, AlimentationService } from '../../@core/service/alimentation.service';

@Component({
  selector: 'app-alimentation',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ConfirmDialogModule,
    AlimentationFormComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './alimentation.component.html',
})
export class AlimentationComponent implements OnInit {

  loading = false;
  data: AlimentationResponseDTO[] = [];
  pageSize = 10;

  constructor(
    private service: AlimentationService,
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

  confirmDelete(item: AlimentationResponseDTO) {
    this.confirm.confirm({
      message: 'Supprimer cette alimentation ?',
      accept: () => {
        this.service.delete(item.id).subscribe(() => {
          this.loadData();
        });
      }
    });
  }
}