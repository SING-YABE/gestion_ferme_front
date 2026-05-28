import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { NgIf } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { DeplacementService, DeplacementDTO } from '../../../@core/service/deplacement.service';
import { AnimalService, AnimalResponseDTO } from '../../../@core/service/animal.service';
import { BoxService, BoxResponseDTO } from '../../../@core/service/box.service';
import { BatimentService, BatimentResponseDTO } from '../../../@core/service/batiment.service';
@Component({
  selector: 'app-deplacement-form',
  standalone: true,
  imports: [
    CommonModule, NgIf, ReactiveFormsModule,
    DialogModule, DropdownModule,
    ButtonModule, InputTextModule, FormsModule
  ],
  templateUrl: './deplacement-form.component.html',
  styleUrls: ['./deplacement-form.component.scss']
})
export class DeplacementFormComponent implements OnInit {

  @Output() onUpdate = new EventEmitter<void>();

  showForm = false;
  processing = false;

  form: FormGroup;
  animaux: AnimalResponseDTO[] = [];
  toutesLesBoxes: BoxResponseDTO[] = [];
  boxesCibles: BoxResponseDTO[] = [];
  boxActuelle: BoxResponseDTO | null = null;
  // Ajouter dans les propriétés
  batiments: BatimentResponseDTO[] = [];
  filtreBatimentId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private deplacementService: DeplacementService,
    private animalService: AnimalService,
    private boxService: BoxService,
    private toastr: ToastrService,
    private batimentService: BatimentService, 
  ) {
    this.form = this.fb.group({
      animalId:      [null, Validators.required],
      nouvelleBoxId: [null, Validators.required],
      motif:         [null]
    });
  }

  ngOnInit(): void {
    this.loadAnimaux();
    this.loadBoxes();
    // Ajouter dans ngOnInit
    this.loadBatiments();
  }

  loadAnimaux(): void {
    this.animalService.getAll().subscribe({
      next: data => {
        // Uniquement les animaux non vendus
        this.animaux = data.filter(a => !a.vendu);
      },
      error: () => this.toastr.error('Erreur chargement animaux')
    });
  }

  loadBoxes(): void {
    this.boxService.getAll().subscribe({
      next: data => this.toutesLesBoxes = data,
      error: () => this.toastr.error('Erreur chargement boxes')
    });
  }

  // Ajouter la méthode
loadBatiments(): void {
  this.batimentService.getAll().subscribe({
    next: data => this.batiments = data,
    error: () => this.toastr.error('Erreur chargement bâtiments')
  });
}

// Ajouter la méthode filtre bâtiment
onBatimentCibleChange(batimentId: number | null): void {
  this.form.patchValue({ nouvelleBoxId: null });

  if (!batimentId) {
    // Pas de filtre → toutes les boxes dispo sauf box actuelle
    const animal = this.animaux.find(a => a.id === this.form.value.animalId);
    this.boxesCibles = this.toutesLesBoxes.filter(b =>
      b.id !== animal?.boxId &&
      b.occupationActuelle < b.capaciteMax
    );
    return;
  }

  // Filtrer par bâtiment choisi + exclure box actuelle + exclure pleines
  const animal = this.animaux.find(a => a.id === this.form.value.animalId);
  this.boxesCibles = this.toutesLesBoxes.filter(b =>
    b.batimentId === batimentId &&
    b.id !== animal?.boxId &&
    b.occupationActuelle < b.capaciteMax
  );
}
  // ✅ Quand un animal est sélectionné
  onAnimalChange(animalId: number): void {
    this.form.patchValue({ nouvelleBoxId: null });
    this.boxActuelle = null;
    this.boxesCibles = [];

    const animal = this.animaux.find(a => a.id === animalId);
    if (!animal) return;

    // Trouver la box actuelle de l'animal
    this.boxActuelle = this.toutesLesBoxes.find(b => b.id === animal.boxId) ?? null;

    // Boxes cibles = toutes les boxes SAUF la box actuelle ET les boxes pleines
    this.boxesCibles = this.toutesLesBoxes.filter(b =>
      b.id !== animal.boxId &&
      b.occupationActuelle < b.capaciteMax
    );
  }

  handleShow(): void {
    this.showForm = true;
    this.form.reset();
    this.boxActuelle = null;
    this.boxesCibles = [];
    this.filtreBatimentId = null;
    // Rafraîchir les données à l'ouverture
    this.loadAnimaux();
    this.loadBoxes();
  }

  handleSubmit(): void {
    if (this.form.invalid) {
      this.toastr.warning('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.processing = true;

    const dto: DeplacementDTO = {
      animalId:      this.form.value.animalId,
      nouvelleBoxId: this.form.value.nouvelleBoxId,
      motif:         this.form.value.motif || null
    };

    this.deplacementService.deplacerAnimal(dto).subscribe({
      next: (res) => {
        this.toastr.success(
          `${res.codeAnimal} déplacé : ${res.ancienneBoxCode ?? '—'} → ${res.nouvelleBoxCode}`
        );
        this.onUpdate.emit();
        this.showForm = false;
        this.form.reset();
        this.boxActuelle = null;
        this.boxesCibles = [];
        this.processing = false;
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Erreur lors du déplacement');
        this.processing = false;
      }
    });
  }
}

