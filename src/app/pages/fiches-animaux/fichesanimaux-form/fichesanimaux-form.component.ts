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
    InputTextareaModule
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
    const formData: AnimalDTO = this.animalForm.value;

    if (this.mode === 'edit' && this.target) {
      this.animalService.update(this.target.id, formData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Animal modifié avec succès'
          });
          this.showForm = false;
          this.processing = false;
          this.onUpdate.emit();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Erreur lors de la modification'
          });
          this.processing = false;
        }
      });
    } else {
      this.animalService.create(formData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Animal créé avec succès'
          });
          this.showForm = false;
          this.processing = false;
          this.animalForm.reset();
          this.onUpdate.emit();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Erreur lors de la création'
          });
          this.processing = false;
        }
      });
    }
  }

  get dialogHeader(): string {
    return this.mode === 'edit' ? 'Modifier l\'animal' : 'Nouvel animal';
  }
}