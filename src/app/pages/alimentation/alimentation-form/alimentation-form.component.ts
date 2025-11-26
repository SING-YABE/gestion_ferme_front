import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { AlimentationService, AlimentationDTO } from '../../../@core/service/alimentation.service';
import { TypeAlimentService } from '../../../@core/service/type-aliment.service';
import { AnimalService } from '../../../@core/service/animal.service';
import { TypeAnimalService } from '../../../@core/service/type-animal.service';
import { FournisseurService } from '../../../@core/service/fournisseur.service';

@Component({
  selector: 'app-alimentation-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    InputTextareaModule
  ],
  templateUrl: './alimentation-form.component.html'
})
export class AlimentationFormComponent implements OnInit {

  @Input() mode: 'create' = 'create';
  @Input() showForm = false;

  @Output() showFormChange = new EventEmitter<boolean>();
  @Output() onUpdate = new EventEmitter<void>();

  form!: FormGroup;
  processing = false;

  typeAliments: any[] = [];
  animaux: any[] = [];
  typeAnimaux: any[] = [];
  fournisseurs: any[] = [];

  modeAlimentation: 'individuel' | 'lot' = 'individuel';

  constructor(
    private fb: FormBuilder,
    private service: AlimentationService,
    private typeAlimentService: TypeAlimentService,
    private animalService: AnimalService,
    private typeAnimalService: TypeAnimalService,
    private fournisseurService: FournisseurService
  ) {
    this.form = this.fb.group({
      date: ['', Validators.required],
      typeAlimentId: ['', Validators.required],
      quantiteKg: [0, [Validators.required, Validators.min(0.01)]],
      prixUnitaire: [0, [Validators.required, Validators.min(0)]],
      animalId: [null],
      typeAnimalId: [null],
      fournisseurId: [null]
    });
  }

  ngOnInit(): void {
    this.loadReferenceData();
    this.setupModeValidation();
  }

  loadReferenceData() {
    this.typeAlimentService.getAll().subscribe((res) => {
      this.typeAliments = res;
    });

    this.animalService.getAll().subscribe((res) => {
      this.animaux = res;
    });

    this.typeAnimalService.getAll().subscribe((res) => {
      this.typeAnimaux = res;
    });

    this.fournisseurService.getAll().subscribe((res) => {
      this.fournisseurs = res;
    });
  }

  setupModeValidation() {
    // Écouter le changement de mode pour ajuster la validation
    this.form.valueChanges.subscribe(() => {
      if (this.modeAlimentation === 'individuel') {
        this.form.patchValue({ typeAnimalId: null }, { emitEvent: false });
      } else {
        this.form.patchValue({ animalId: null }, { emitEvent: false });
      }
    });
  }

  switchMode(mode: 'individuel' | 'lot') {
    this.modeAlimentation = mode;
    if (mode === 'individuel') {
      this.form.patchValue({ typeAnimalId: null });
    } else {
      this.form.patchValue({ animalId: null });
    }
  }

  handleShow() {
    this.showForm = true;
    this.showFormChange.emit(true);
    this.form.reset({
      date: new Date().toISOString().split('T')[0],
      quantiteKg: 0,
      prixUnitaire: 0
    });
    this.modeAlimentation = 'individuel';
  }

  handleSubmit() {
    if (!this.form.valid) return;

    // Validation: au moins un animal ou un type animal doit être sélectionné
    const animalId = this.form.value.animalId;
    const typeAnimalId = this.form.value.typeAnimalId;

    if (!animalId && !typeAnimalId) {
      alert('Veuillez sélectionner soit un animal soit un type d\'animal');
      return;
    }

    this.processing = true;
    const dto: AlimentationDTO = {
      date: this.form.value.date,
      typeAlimentId: this.form.value.typeAlimentId,
      quantiteKg: this.form.value.quantiteKg,
      prixUnitaire: this.form.value.prixUnitaire,
      animalId: this.form.value.animalId || null,
      typeAnimalId: this.form.value.typeAnimalId || null,
      fournisseurId: this.form.value.fournisseurId || null
    };

    this.service.create(dto).subscribe({
      next: () => this.afterSubmit(),
      error: () => (this.processing = false)
    });
  }

  private afterSubmit() {
    this.processing = false;
    this.showForm = false;
    this.showFormChange.emit(false);
    this.onUpdate.emit();
  }

  get coutTotal(): number {
    const quantite = this.form.value.quantiteKg || 0;
    const prix = this.form.value.prixUnitaire || 0;
    return quantite * prix;
  }
}