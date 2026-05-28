import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { NgIf } from '@angular/common';
import { MessageService } from 'primeng/api';
import { AnimalService, AnimalDTO, AnimalResponseDTO } from '../../../@core/service/animal.service';
import { TypeAnimalService, TypeAnimalResponseDTO } from '../../../@core/service/type-animal.service';
import { EtatSanteService, EtatSanteResponseDTO } from '../../../@core/service/etat-sante.service';
import { BatimentService, BatimentResponseDTO } from '../../../@core/service/batiment.service';
import { BoxService, BoxResponseDTO } from '../../../@core/service/box.service';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-fichesanimaux-form',
  standalone: true,
  imports: [
    CommonModule, NgIf, ReactiveFormsModule,
    ButtonModule, DialogModule, InputTextModule,
    DropdownModule, InputTextareaModule, CalendarModule
  ],
  templateUrl: './fichesanimaux-form.component.html',
  styleUrl: './fichesanimaux-form.component.scss'
})
export class FichesanimauxFormComponent implements OnInit {
  @Input() target?: AnimalResponseDTO;
  @Input() mode: 'create' | 'edit' = 'create';
  @Output() onUpdate = new EventEmitter<void>();

  showForm = false;
  processing = false;
  animalForm!: FormGroup;

  typesAnimaux: TypeAnimalResponseDTO[] = [];
  etatsSante: EtatSanteResponseDTO[] = [];
  batiments: BatimentResponseDTO[] = [];
  boxesDisponibles: BoxResponseDTO[] = [];
selectedPhoto: File | null = null;
photoPreviewUrl: string | null = null;
private isPrefilling = false;
  constructor(
    private fb: FormBuilder,
    private animalService: AnimalService,
    private typeAnimalService: TypeAnimalService,
    private etatSanteService: EtatSanteService,
    private batimentService: BatimentService,
    private boxService: BoxService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadReferenceData();

    // Reload états santé quand type change
    this.animalForm.get('typeAnimalId')?.valueChanges.subscribe(typeId => {
  if (this.isPrefilling) return; // ← bloque pendant le patch
  if (typeId && typeId > 0) {
    this.etatSanteService.getByTypeAnimal(typeId).subscribe(data => {
      this.etatsSante = data;
      this.animalForm.patchValue({ etatSanteId: 0 });
    });
  }
});
    
  }

onPhotoSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) {
    this.selectedPhoto = input.files[0];
    // Aperçu local immédiat
    const reader = new FileReader();
    reader.onload = (e) => {
      this.photoPreviewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(this.selectedPhoto);
  }
}

  initForm(): void {
    this.animalForm = this.fb.group({
      typeAnimalId: [0, [Validators.required, Validators.min(1)]],
      dateEntree:   ['', Validators.required],
      poidsInitial: [0, [Validators.required, Validators.min(0.1)]],
      etatSanteId:  [0, [Validators.required, Validators.min(1)]],
      batimentId:   [0, [Validators.required, Validators.min(1)]], // helper local, pas envoyé au backend
      boxId:        [0, [Validators.required, Validators.min(1)]],
      observations: ['']
    });
  }

  loadReferenceData(): void {
    this.typeAnimalService.getAll().subscribe(data => this.typesAnimaux = data);
    this.batimentService.getAll().subscribe(data => this.batiments = data);
  }

  // ✅ Cascade : bâtiment sélectionné → charger ses boxes
  onBatimentChange(batimentId: number): void {
    this.animalForm.patchValue({ boxId: 0 });
    this.boxesDisponibles = [];
    if (batimentId) {
      this.boxService.getByBatiment(batimentId).subscribe({
        next: data => this.boxesDisponibles = data,
        error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur chargement boxes' })
      });
    }
  }

handleShow(): void {
  this.showForm = true;

  if (this.mode === 'edit' && this.target) {
    this.selectedPhoto   = null;
    this.photoPreviewUrl = null;
const typeId = this.target.typeAnimalId ?? 0;
const etatId = this.target.etatSanteId  ?? 0;
    // Trouver le bâtiment par nom
    const batiment = this.batiments.find(b => b.nom === this.target!.batimentNom);

    if (batiment) {
      // Charger boxes du bâtiment EN PARALLÈLE avec les états de santé
      forkJoin({
        boxes: this.boxService.getByBatiment(batiment.id),
        etats: this.etatSanteService.getByTypeAnimal(typeId)
      }).subscribe({
        next: ({ boxes, etats }) => {
          this.boxesDisponibles = boxes;
          this.etatsSante = etats;
this.isPrefilling = true;
          this.animalForm.patchValue({
            typeAnimalId: typeId,
            dateEntree:   this.target!.dateEntree ? new Date(this.target!.dateEntree) : '',
            poidsInitial: this.target!.poidsInitial || 0,
            etatSanteId:  etatId,
            batimentId:   batiment.id,
            boxId:        this.target!.boxId || 0,
            observations: this.target!.observations || ''
          });
          this.isPrefilling = false;
        },
        error: () => this.messageService.add({
          severity: 'error', summary: 'Erreur',
          detail: 'Erreur chargement des données'
        })
      });

    } else {
      // Bâtiment introuvable — charger quand même les états de santé
      if (typeId) {
        this.etatSanteService.getByTypeAnimal(typeId).subscribe({
          next: etats => {
            this.etatsSante = etats;
            this.animalForm.patchValue({
              typeAnimalId: typeId,
              dateEntree:   this.target!.dateEntree ? new Date(this.target!.dateEntree) : '',
              poidsInitial: this.target!.poidsInitial || 0,
              etatSanteId:  etatId,
              boxId:        this.target!.boxId || 0,
              observations: this.target!.observations || ''
            });
          },
          error: () => this.messageService.add({
            severity: 'error', summary: 'Erreur',
            detail: 'Erreur chargement états de santé'
          })
        });
      }
    }

  } else {
    // Mode création : reset complet
    this.animalForm.reset({
      typeAnimalId: 0,
      dateEntree:   '',
      poidsInitial: 0,
      etatSanteId:  0,
      batimentId:   0,
      boxId:        0,
      observations: ''
    });
    this.etatsSante      = [];
    this.boxesDisponibles = [];
    this.selectedPhoto    = null;
    this.photoPreviewUrl  = null;
  }
}

  handleSubmit(): void {
    if (this.animalForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Veuillez remplir tous les champs' });
      return;
    }

    this.processing = true;
    const formData = this.animalForm.value;

    // Conversion date
    if (formData.dateEntree instanceof Date) {
      const d = formData.dateEntree;
      formData.dateEntree = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
    }

    const dto: AnimalDTO = {
      typeAnimalId: formData.typeAnimalId,
      dateEntree:   formData.dateEntree,
      poidsInitial: formData.poidsInitial,
      etatSanteId:  formData.etatSanteId,
      boxId:        formData.boxId,
      observations: formData.observations
    };

    const req$ = this.mode === 'create'
      ? this.animalService.create(dto)
      : this.animalService.update(this.target!.id, dto);

    req$.subscribe({
    next: (res) => {
  // Upload photo si une photo a été sélectionnée
  if (this.selectedPhoto) {
    this.animalService.uploadPhoto(res.id, this.selectedPhoto).subscribe({
      next: () => {
        this.selectedPhoto = null;
        this.photoPreviewUrl = null;
      }
    });
  }
  this.messageService.add({
    severity: 'success', summary: 'Succès',
    detail: 'Animal modifié'
  });
  this.processing = false;
  this.showForm = false;
  this.onUpdate.emit();
},
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err.error?.message || 'Erreur serveur' });
        this.processing = false;
      }
    });
  }

  get dialogHeader(): string {
    return this.mode === 'edit' ? "Modifier l'animal" : 'Nouvel animal';
  }
}