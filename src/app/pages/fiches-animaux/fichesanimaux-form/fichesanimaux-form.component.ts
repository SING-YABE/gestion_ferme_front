import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessageService } from 'primeng/api';
import { AnimalService,AnimalDTO,AnimalResponseDTO } from '../../../@core/service/animal.service';
import { TypeAnimalService,TypeAnimalResponseDTO } from '../../../@core/service/type-animal.service';
import { EtatSanteService,EtatSanteResponseDTO } from '../../../@core/service/etat-sante.service';
import { BatimentService,BatimentResponseDTO } from '../../../@core/service/batiment.service';
import { CalendarModule } from 'primeng/calendar';
@Component({
  selector: 'app-fichesanimaux-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    InputTextareaModule,
    CalendarModule
  ],
  templateUrl: './fichesanimaux-form.component.html',
  styleUrl: './fichesanimaux-form.component.scss'
})
export class FichesanimauxFormComponent implements OnInit {
  @Input() target?: AnimalResponseDTO;
  @Input() mode: 'create' | 'edit' = 'create';
  @Output() onUpdate = new EventEmitter<void>();

  showForm: boolean = false;
  processing: boolean = false;
  animalForm!: FormGroup;

  typesAnimaux: TypeAnimalResponseDTO[] = [];
  etatsSante: EtatSanteResponseDTO[] = [];
  batiments: BatimentResponseDTO[] = [];

  constructor(
    private fb: FormBuilder,
    private animalService: AnimalService,
    private typeAnimalService: TypeAnimalService,
    private etatSanteService: EtatSanteService,
    private batimentService: BatimentService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadReferenceData();
  }

// Ajouter cette méthode helper
private formatDateToYMD(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

  initForm(): void {
    this.animalForm = this.fb.group({
      typeAnimalId: [0, [Validators.required, Validators.min(1)]],
      dateEntree: ['', Validators.required],
      poidsInitial: [0, [Validators.required, Validators.min(0.1)]],
      etatSanteId: [0, [Validators.required, Validators.min(1)]],
      batimentId: [0, [Validators.required, Validators.min(1)]],
      observations: ['']
    });
  } 

  loadReferenceData(): void {
    this.typeAnimalService.getAll().subscribe({
      next: (data) => this.typesAnimaux = data,
      error: (err) => console.error('Erreur chargement types animaux', err)
    });

this.etatSanteService.getAll().subscribe({
  next: (response) => this.etatsSante = response,
  error: (err) => console.error('Erreur chargement états santé', err)
});



    this.batimentService.getAll().subscribe({
      next: (data) => this.batiments = data,
      error: (err) => console.error('Erreur chargement bâtiments', err)
    });
  }

  handleShow(): void {
    this.showForm = true;
    
    if (this.mode === 'edit' && this.target) {
      this.animalForm.patchValue({
        typeAnimalId: this.target.typeAnimal.id,
        dateEntree: this.target.dateEntree,
        poidsInitial: this.target.poidsInitial,
        etatSanteId: this.target.etatSante.id,
        batimentId: this.target.batiment.id,
        observations: this.target.observations || ''
      });
    } else {
      this.animalForm.reset({
        typeAnimalId: 0,
        dateEntree: '',
        poidsInitial: 0,
        etatSanteId: 0,
        batimentId: 0,
        observations: ''
      });
    }
  }
handleSubmit(): void {
  if (this.animalForm.invalid) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Veuillez remplir tous les champs obligatoires'
    });
    return;
  }

  this.processing = true;
  const formData: any = { ...this.animalForm.value };

  // Conversion date en jj/mm/yyyy
  formData.dateEntree = this.formatDateToYMD(formData.dateEntree);

  const request$ = this.mode === 'create'
    ? this.animalService.create(formData)
    : this.animalService.update(this.target!.id, formData);

  request$.subscribe({
    next: () => {
      this.processing = false;

      // Afficher message de succès
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: this.mode === 'create' ? "Animal ajouté avec succès" : "Animal modifié avec succès"
      });

      this.showForm = false;

      this.onUpdate.emit();
    },
    error: (err) => {
      this.processing = false;
      console.error(err);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Une erreur est survenue lors de l’enregistrement.'
      });
    }
  });
}


  get dialogHeader(): string {
    return this.mode === 'edit' ? 'Modifier l\'animal' : 'Nouvel animal';
  }
}