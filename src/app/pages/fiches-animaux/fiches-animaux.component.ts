import { Component, OnInit } from '@angular/core';
import { AnimalService,AnimalResponseDTO } from '../../@core/service/animal.service';
import { TypeAnimalService,TypeAnimalResponseDTO } from '../../@core/service/type-animal.service';
import { BatimentService,BatimentResponseDTO } from '../../@core/service/batiment.service';
import { EtatSanteService,EtatSanteResponseDTO } from '../../@core/service/etat-sante.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { FichesanimauxFormComponent } from './fichesanimaux-form/fichesanimaux-form.component';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-fiches-animaux',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, FichesanimauxFormComponent, ButtonModule],
  templateUrl: './fiches-animaux.component.html',
  styleUrl: './fiches-animaux.component.scss',
  providers:[MessageService]
})
export class FichesAnimauxComponent implements OnInit {
  animaux: AnimalResponseDTO[] = [];
  animalsFiltres: AnimalResponseDTO[] = [];
  typesAnimaux: TypeAnimalResponseDTO[] = [];
  etatsSante: EtatSanteResponseDTO[] = [];
  batiments: BatimentResponseDTO[] = [];
  
  pageSize = 5;

  rechercheCode: string = '';
  filtreTypeAnimal: number | null = null;
  filtreBatiment: number | null = null;

  constructor(
    private animalService: AnimalService,
    private typeAnimalService: TypeAnimalService,
    private etatSanteService: EtatSanteService,
    private batimentService: BatimentService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.animalService.getAll().subscribe(data => {
      this.animaux = data;
      this.appliquerFiltres();
    });

    this.typeAnimalService.getAll().subscribe(data => this.typesAnimaux = data);
    this.etatSanteService.getAll().subscribe(resp => this.etatsSante = resp);
    this.batimentService.getAll().subscribe(data => this.batiments = data);
  }
  appliquerFiltres(): void {
    this.animalsFiltres = this.animaux.filter(animal => {
      const matchCode = !this.rechercheCode || animal.codeAnimal.toLowerCase().includes(this.rechercheCode.toLowerCase());
      const matchType = !this.filtreTypeAnimal || animal.typeAnimal.id === this.filtreTypeAnimal;
      const matchBatiment = !this.filtreBatiment || animal.batiment.id === this.filtreBatiment;
      return matchCode && matchType && matchBatiment;
    });
  }

  onRechercheChange(): void { this.appliquerFiltres(); }
  onFiltreChange(): void { this.appliquerFiltres(); }
  resetFiltres(): void { this.rechercheCode=''; this.filtreTypeAnimal=null; this.filtreBatiment=null; this.appliquerFiltres(); }

  deleteAnimal(id: number): void {
    if(confirm("Êtes-vous sûr de vouloir supprimer cet animal ?")) {
      this.animalService.deleteById(id).subscribe(() => this.loadData());
    }
  }
}
