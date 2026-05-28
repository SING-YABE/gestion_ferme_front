

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { BoxService, BoxResponseDTO } from '../../../@core/service/box.service';
import { BatimentService, BatimentResponseDTO } from '../../../@core/service/batiment.service';
import { BoxFormComponent } from './box-form/box-form.component';

@Component({
  selector: 'app-box',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule,
    DropdownModule, ButtonModule,
    ConfirmDialogModule, BoxFormComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './box.component.html',
  styleUrls: ['./box.component.scss']
})
export class BoxComponent implements OnInit {
  boxes: BoxResponseDTO[] = [];
  boxesFiltrees: BoxResponseDTO[] = [];
  batiments: BatimentResponseDTO[] = [];
  loading = false;
  pageSize = 5;
  filtreBatimentId: number | null = null;

  constructor(
    private boxService: BoxService,
    private batimentService: BatimentService,
    private toastr: ToastrService,
    private cs: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadBatiments();
    this.loadData();
  }

  loadBatiments(): void {
    this.batimentService.getAll().subscribe({
      next: data => this.batiments = data,
      error: () => this.toastr.error('Erreur chargement bâtiments')
    });
  }

  loadData(): void {
    this.loading = true;
    this.boxService.getAll().subscribe({
      next: data => {
        this.boxes = data;
        this.appliquerFiltre();
        this.loading = false;
      },
      error: () => { this.toastr.error('Erreur chargement boxes'); this.loading = false; }
    });
  }

  onFiltreBatiment(): void { this.appliquerFiltre(); }

  appliquerFiltre(): void {
    this.boxesFiltrees = this.filtreBatimentId
      ? this.boxes.filter(b => b.batimentId === this.filtreBatimentId)
      : [...this.boxes];
  }

  confirmDelete(box: BoxResponseDTO): void {
    this.cs.confirm({
      header: 'Confirmation',
      message: `Supprimer la box "${box.code}" ?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => this.deleteBox(box.id)
    });
  }

  deleteBox(id: number): void {
    this.boxService.deleteById(id).subscribe({
      next: () => { this.toastr.success('Box supprimée'); this.loadData(); },
      error: () => this.toastr.error('Erreur suppression')
    });
  }
}
