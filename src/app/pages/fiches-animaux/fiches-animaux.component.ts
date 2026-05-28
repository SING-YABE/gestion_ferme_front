import { Component, OnInit, HostListener } from '@angular/core';
import { AnimalService, AnimalResponseDTO } from '../../@core/service/animal.service';
import { TypeAnimalService, TypeAnimalResponseDTO } from '../../@core/service/type-animal.service';
import { BatimentService, BatimentResponseDTO } from '../../@core/service/batiment.service';
import {
  SuiviReproductionService,
  TruieCarriereDTO,
  VerratPerformanceDTO
} from '../../@core/service/suivi-reproduction.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { FichesanimauxFormComponent } from './fichesanimaux-form/fichesanimaux-form.component';
import { AnimalHistoriqueComponent } from './animal-historique/animal-historique.component';
import { DeplacementFormComponent } from './deplacement-form/deplacement-form.component';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// ─────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────

export interface CycleUnifie {
  rang: number;
  partenaireCode: string;
  dateSaillie: string;
  dateMiseBasReelle: string;
  nbNesVivants: number;
  nbMortsNes: number;
  nbSevres: number;
}

export interface CarriereRow {
  code: string;
  type: 'truie' | 'verrat';
  batimentNom: string;
  boxCode: string;
  photoUrl: string | null;
  cycles: CycleUnifie[];
  totalVivants: number;
  totalMorts: number;
  expanded: boolean;
}

@Component({
  selector: 'app-fiches-animaux',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    FichesanimauxFormComponent,
    AnimalHistoriqueComponent,
    DeplacementFormComponent
  ],
  templateUrl: './fiches-animaux.component.html',
  styleUrl: './fiches-animaux.component.scss',
  providers: [MessageService]
})
export class FichesAnimauxComponent implements OnInit {

  // ── Toggle onglets ────────────────────────────
  activeTab: 'animaux' | 'carriere' = 'animaux';

  // ── Section 1 : Animaux ──────────────────────
  animaux: AnimalResponseDTO[] = [];
  animalsFiltres: AnimalResponseDTO[] = [];
  typesAnimaux: TypeAnimalResponseDTO[] = [];
  batiments: BatimentResponseDTO[] = [];

  pageSize = 10;
  rechercheCode = '';
  filtreTypeAnimal: number | null = null;
  filtreBatiment: string | null = null;

  // ── Dropdown actions ─────────────────────────
  /** ID de l'animal dont le menu est ouvert (null = aucun) */
  openMenuId: number | null = null;

  // ── Section 2 : Carrière ─────────────────────
  carriereRows: CarriereRow[] = [];
  carriereRowsFiltered: CarriereRow[] = [];
  carriereRowsPage: CarriereRow[] = [];

  rechercheCarriere = '';
  filtreTypeCarriere: 'tous' | 'truie' | 'verrat' = 'tous';

  carrierePage = 1;
  carrierePageSize = 10;

  // KPIs
  totalTruies = 0;
  totalVerrats = 0;
  totalCycles = 0;
  totalNesVivants = 0;

  constructor(
    private animalService: AnimalService,
    private typeAnimalService: TypeAnimalService,
    private batimentService: BatimentService,
    private reproductionService: SuiviReproductionService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  // ══════════════════════════════════════════════
  // SECTION 1 — Animaux
  // ══════════════════════════════════════════════

  loadData(): void {
    this.animalService.getAll().subscribe(data => {
      this.animaux = data;
      this.appliquerFiltres();
      this.buildCarriereRows();
    });
    this.typeAnimalService.getAll().subscribe(data => this.typesAnimaux = data);
    this.batimentService.getAll().subscribe(data => this.batiments = data);
  }

  appliquerFiltres(): void {
    this.animalsFiltres = this.animaux.filter(animal => {
      const matchCode = !this.rechercheCode ||
        animal.codeAnimal.toLowerCase().includes(this.rechercheCode.toLowerCase());
      const matchType = !this.filtreTypeAnimal || animal.typeAnimalId === this.filtreTypeAnimal;
      const matchBatiment = !this.filtreBatiment || animal.batimentNom === this.filtreBatiment;
      return matchCode && matchType && matchBatiment;
    });
  }

  onRechercheChange(): void { this.appliquerFiltres(); }
  onFiltreChange(): void { this.appliquerFiltres(); }

  resetFiltres(): void {
    this.rechercheCode = '';
    this.filtreTypeAnimal = null;
    this.filtreBatiment = null;
    this.appliquerFiltres();
  }

  deleteAnimal(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet animal ?')) {
      this.animalService.deleteById(id).subscribe(() => {
        this.loadData();
        this.closeMenu();
      });
    }
  }

  // ── Dropdown menu ────────────────────────────

  toggleMenu(id: number): void {
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  closeMenu(): void {
    this.openMenuId = null;
  }

  /**
   * Ferme le menu si l'utilisateur clique en dehors
   * (sur l'hôte du composant ou ailleurs dans le document)
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.action-menu-wrap')) {
      this.openMenuId = null;
    }
  }

  // ══════════════════════════════════════════════
  // SECTION 2 — Carrière & Reproduction
  // ══════════════════════════════════════════════

  buildCarriereRows(): void {
    const truies  = this.animaux.filter(a => a.typeAnimalNom === 'Truie');
    const verrats = this.animaux.filter(a => a.typeAnimalNom === 'Verrat');

    if (truies.length === 0 && verrats.length === 0) {
      this.carriereRows = [];
      this.carriereRowsFiltered = [];
      this.carriereRowsPage = [];
      this.calculerStats();
      return;
    }

    const truieRequests = truies.map(animal =>
      this.reproductionService.getCarriereTruie(animal.codeAnimal).pipe(
        catchError(() => of([] as TruieCarriereDTO[]))
      )
    );

    const verratRequests = verrats.map(animal =>
      this.reproductionService.getPerformancesVerrat(animal.codeAnimal).pipe(
        catchError(() => of([] as VerratPerformanceDTO[]))
      )
    );

    forkJoin([...truieRequests, ...verratRequests]).subscribe(results => {
      const rows: CarriereRow[] = [];

      // Truies
      truies.forEach((animal, i) => {
        const data = results[i] as TruieCarriereDTO[];
        const cycles: CycleUnifie[] = data.map((c: TruieCarriereDTO) => ({
          rang:              c.rang,
          partenaireCode:    c.verratCode,
          dateSaillie:       c.dateSaillie,
          dateMiseBasReelle: c.dateMiseBasReelle ?? '-',
          nbNesVivants:      c.nbNesVivants ?? 0,
          nbMortsNes:        c.nbMortsNes   ?? 0,
          nbSevres:          c.nbSevres     ?? 0
        }));
        rows.push({
          code:        animal.codeAnimal,
          type:        'truie',
          batimentNom: animal.batimentNom,
          boxCode:     animal.boxCode,
          photoUrl:    animal.photoUrl ?? null,
          cycles,
          totalVivants: cycles.reduce((s, c) => s + c.nbNesVivants, 0),
          totalMorts:   cycles.reduce((s, c) => s + c.nbMortsNes,   0),
          expanded:    false
        });
      });

      // Verrats
      verrats.forEach((animal, i) => {
        const data = results[truies.length + i] as VerratPerformanceDTO[];
        const cycles: CycleUnifie[] = data.map((c: VerratPerformanceDTO, idx: number) => ({
          rang:              idx + 1,
          partenaireCode:    c.truieCode,
          dateSaillie:       c.dateSaillie,
          dateMiseBasReelle: c.dateMiseBasReelle ?? '-',
          nbNesVivants:      c.nbNesVivants ?? 0,
          nbMortsNes:        c.nbMortsNes   ?? 0,
          nbSevres:          c.nbSevres     ?? 0
        }));
        rows.push({
          code:        animal.codeAnimal,
          type:        'verrat',
          batimentNom: animal.batimentNom,
          boxCode:     animal.boxCode,
          photoUrl:    animal.photoUrl ?? null,
          cycles,
          totalVivants: cycles.reduce((s, c) => s + c.nbNesVivants, 0),
          totalMorts:   cycles.reduce((s, c) => s + c.nbMortsNes,   0),
          expanded:    false
        });
      });

      rows.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
      this.carriereRows = rows;
      this.calculerStats();
      this.appliquerFiltresCarriere();
    });
  }

  calculerStats(): void {
    this.totalTruies     = this.carriereRows.filter(r => r.type === 'truie').length;
    this.totalVerrats    = this.carriereRows.filter(r => r.type === 'verrat').length;
    this.totalCycles     = this.carriereRows.reduce((s, r) => s + r.cycles.length, 0);
    this.totalNesVivants = this.carriereRows.reduce((s, r) => s + r.totalVivants,  0);
  }

  // ── Filtres + pagination carrière ────────────

  appliquerFiltresCarriere(): void {
    let result = [...this.carriereRows];

    if (this.rechercheCarriere.trim()) {
      const q = this.rechercheCarriere.toLowerCase();
      result = result.filter(r => r.code.toLowerCase().includes(q));
    }

    if (this.filtreTypeCarriere !== 'tous') {
      result = result.filter(r => r.type === this.filtreTypeCarriere);
    }

    this.carriereRowsFiltered = result;
    this.carrierePage = 1;
    this.updateCarriereRowsPage();
  }

  private updateCarriereRowsPage(): void {
    const start = (this.carrierePage - 1) * this.carrierePageSize;
    this.carriereRowsPage = this.carriereRowsFiltered.slice(start, start + this.carrierePageSize);
  }

  onRechercheCarriereChange(): void { this.appliquerFiltresCarriere(); }
  onFiltreCarriereChange(): void    { this.appliquerFiltresCarriere(); }

  resetFiltresCarriere(): void {
    this.rechercheCarriere  = '';
    this.filtreTypeCarriere = 'tous';
    this.appliquerFiltresCarriere();
  }

  // ── Pagination ────────────────────────────────

  get carrierePageCount(): number {
    return Math.max(1, Math.ceil(this.carriereRowsFiltered.length / this.carrierePageSize));
  }

  get carrierePageNumbers(): number[] {
    const total = this.carrierePageCount;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: number[] = [1];
    const current = this.carrierePage;
    if (current > 3) pages.push(-1);
    for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
      pages.push(p);
    }
    if (current < total - 2) pages.push(-1);
    pages.push(total);
    return pages;
  }

  carrierePrevPage(): void {
    if (this.carrierePage > 1) {
      this.carrierePage--;
      this.updateCarriereRowsPage();
    }
  }

  carriereNextPage(): void {
    if (this.carrierePage < this.carrierePageCount) {
      this.carrierePage++;
      this.updateCarriereRowsPage();
    }
  }

  goToCarrierePage(p: number): void {
    if (p < 1 || p > this.carrierePageCount || p === this.carrierePage) return;
    this.carrierePage = p;
    this.updateCarriereRowsPage();
  }

  toggleCarriereRow(row: CarriereRow): void {
    row.expanded = !row.expanded;
  }
}