import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DeplacementService, HistoriqueDeplacementResponseDTO } from '../../@core/service/deplacement.service';
import { AnimalService, AnimalResponseDTO } from '../../@core/service/animal.service';
import { ToastrService } from 'ngx-toastr';
import { DeplacementFormComponent } from './deplacement-form/deplacement-form.component';

@Component({
  selector: 'app-deplacement',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TableModule, DropdownModule,
    ButtonModule, InputTextModule,
    DeplacementFormComponent
  ],
  templateUrl: './deplacement.component.html',
  styleUrls: ['./deplacement.component.scss']
})
export class DeplacementComponent implements OnInit {

  historique: HistoriqueDeplacementResponseDTO[] = [];
  historiqueFiltre: HistoriqueDeplacementResponseDTO[] = [];
  animaux: AnimalResponseDTO[] = [];

  loading = false;
  pageSize = 10;
  filtreAnimalId: number | null = null;
  rechercheMotif = '';

  constructor(
    private deplacementService: DeplacementService,
    private animalService: AnimalService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadAnimaux();
  }

  loadData(): void {
    this.loading = true;
    this.deplacementService.getAllHistorique().subscribe({
      next: data => {
        this.historique = data;
        this.appliquerFiltres();
        this.loading = false;
      },
      error: () => {
        this.toastr.error('Erreur chargement historique');
        this.loading = false;
      }
    });
  }

  loadAnimaux(): void {
    this.animalService.getAll().subscribe({
      next: data => this.animaux = data,
      error: () => this.toastr.error('Erreur chargement animaux')
    });
  }

  appliquerFiltres(): void {
    this.historiqueFiltre = this.historique.filter(h => {
      const matchAnimal = !this.filtreAnimalId || h.animalId === this.filtreAnimalId;
      const matchMotif = !this.rechercheMotif ||
        (h.motif?.toLowerCase().includes(this.rechercheMotif.toLowerCase()) ?? false);
      return matchAnimal && matchMotif;
    });
  }

  onFiltreChange(): void { this.appliquerFiltres(); }

  resetFiltres(): void {
    this.filtreAnimalId = null;
    this.rechercheMotif = '';
    this.appliquerFiltres();
  }
}