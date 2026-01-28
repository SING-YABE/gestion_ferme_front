import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ChargesdiversesFormComponent } from './chargesdiverses-form/chargesdiverses-form.component';
import { ChargesDiversesDTO, ChargesDiversesService } from '../../@core/service/charges-diverses-service.service';

@Component({
  selector: 'app-chargesdiverses',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ConfirmDialogModule,
    ToastModule,
    ChargesdiversesFormComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './chargesdiverses.component.html',
})
export class ChargesdiversesComponent implements OnInit {

  loading = false;
  data: ChargesDiversesDTO[] = [];
  pageSize = 10;

  constructor(
    private service: ChargesDiversesService,
    private confirm: ConfirmationService,
    private message: MessageService
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
      error: (err) => {
        console.error('Erreur chargement données:', err);
        this.loading = false;
        this.message.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les dépenses'
        });
      }
    });
  }

  confirmDelete(item: ChargesDiversesDTO) {
    this.confirm.confirm({
      message: `Supprimer la dépense "${item.description}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(item.id!).subscribe({
          next: () => {
            this.message.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Dépense supprimée'
            });
            this.loadData();
          },
          error: (err) => {
            console.error('Erreur suppression:', err);
            this.message.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Impossible de supprimer la dépense'
            });
          }
        });
      }
    });
  }
}