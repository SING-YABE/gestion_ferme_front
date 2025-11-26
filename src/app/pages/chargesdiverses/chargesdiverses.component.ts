import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ChargesdiversesFormComponent } from './chargesdiverses-form/chargesdiverses-form.component';
import { ChargesDiversesDTO } from '../../@core/service/charges-diverses-service.service';
import { ChargesDiversesService } from '../../@core/service/charges-diverses-service.service';
@Component({
  selector: 'app-chargesdiverses',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ConfirmDialogModule,
    ChargesdiversesFormComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './chargesdiverses.component.html',
})
export class ChargesdiversesComponent implements OnInit {

  loading = false;
  data: ChargesDiversesDTO[] = [];
  pageSize = 10;

  constructor(
    private service: ChargesDiversesService,
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

  confirmDelete(item: ChargesDiversesDTO) {
    this.confirm.confirm({
      message: 'Supprimer cette charge ?',
      accept: () => {
        this.service.delete(item.id!).subscribe(() => {
          this.loadData();
        });
      }
    });
  }
}
