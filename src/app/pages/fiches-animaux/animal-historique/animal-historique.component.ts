import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ToastrService } from 'ngx-toastr';
import {
  SuiviReproductionService,
  VerratPerformanceDTO,
  TruieCarriereDTO
} from '../../../@core/service/suivi-reproduction.service';
import { AnimalResponseDTO } from '../../../@core/service/animal.service';

@Component({
  selector: 'app-animal-historique',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule, TableModule, TooltipModule],
  templateUrl: './animal-historique.component.html'
})
export class AnimalHistoriqueComponent {
  @Input() animal!: AnimalResponseDTO;

  showDialog = false;
  loading = false;

  performancesVerrat: VerratPerformanceDTO[] = [];
  carriereTruie: TruieCarriereDTO[] = [];

  constructor(
    private srService: SuiviReproductionService,
    private toastr: ToastrService
  ) {}

  get isVerrat(): boolean {
    return this.animal?.typeAnimalNom?.toLowerCase() === 'verrat';
  }

  get isTruie(): boolean {
    return this.animal?.typeAnimalNom?.toLowerCase() === 'truie';
  }

  get dialogHeader(): string {
    return this.isVerrat
      ? `🐗 Performances — ${this.animal.codeAnimal}`
      : `🐷 Carrière — ${this.animal.codeAnimal}`;
  }

  get totalNesVivants(): number {
    return this.performancesVerrat.reduce((s, r) => s + (r.nbNesVivants || 0), 0);
  }
  get totalMortsNes(): number {
    return this.performancesVerrat.reduce((s, r) => s + (r.nbMortsNes || 0), 0);
  }
  get totalSevresVerrat(): number {
    return this.performancesVerrat.reduce((s, r) => s + (r.nbSevres || 0), 0);
  }
  get totalNesVivantsTruie(): number {
    return this.carriereTruie.reduce((s, r) => s + (r.nbNesVivants || 0), 0);
  }
  get totalMortsNesTruie(): number {
    return this.carriereTruie.reduce((s, r) => s + (r.nbMortsNes || 0), 0);
  }
  get totalSevresTruie(): number {
    return this.carriereTruie.reduce((s, r) => s + (r.nbSevres || 0), 0);
  }

  ouvrirHistorique(): void {
    this.showDialog = true;
    this.loading = true;

    if (this.isVerrat) {
      this.srService.getPerformancesVerrat(this.animal.codeAnimal).subscribe({
        next: data => { this.performancesVerrat = data; this.loading = false; },
        error: () => { this.toastr.error('Erreur chargement performances'); this.loading = false; }
      });
    } else {
      this.srService.getCarriereTruie(this.animal.codeAnimal).subscribe({
        next: data => { this.carriereTruie = data; this.loading = false; },
        error: () => { this.toastr.error('Erreur chargement carrière'); this.loading = false; }
      });
    }
  }
}