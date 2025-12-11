import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { SanteSoinsService, SoinAnimalDTO } from '../../../@core/service/santesoins.service';
import { TraitementService } from '../../../@core/service/traitement.service';
import { CalendarModule } from 'primeng/calendar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-santesoins-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    DropdownModule,
    CheckboxModule,
    CalendarModule,
    MultiSelectModule,
    RadioButtonModule,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule
  ],
  templateUrl: './santesoins-form.component.html'
})
export class SantesoinsFormComponent implements OnInit, OnChanges {
  @Input() target?: any;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() showForm = false;
  @Output() showFormChange = new EventEmitter<boolean>();
  @Output() onUpdate = new EventEmitter<void>();

  form!: FormGroup;
  processing = false;
  traitements: any[] = [];
  animals: any[] = [];
  typeSoin: 'individuel' | 'collectif' = 'individuel';

  constructor(
    private fb: FormBuilder,
    private service: SanteSoinsService,
    private traitementService: TraitementService
  ) {
    this.form = this.fb.group({
      codeAnimal: [''],
      animalCodes: [[]],
      applyToAll: [false],
      dateSoin: [null, Validators.required],
      motif: ['', Validators.required],
      traitement: ['', Validators.required],
      traitementApporte: [''],
      cout: [0, [Validators.required, Validators.min(0)]],
      coutMedicament: [0, [Validators.min(0)]],
      totalPrestation: [{ value: 0, disabled: true }],
      veterinaire: ['', Validators.required],
      observations: ['']
    });

    this.form.get('cout')!.valueChanges.subscribe(() => this.calcTotal());
    this.form.get('coutMedicament')!.valueChanges.subscribe(() => this.calcTotal());
  }

  ngOnInit(): void {
    this.loadTtt();
    this.loadAnimals();
    
    const today = new Date();
    this.form.patchValue({ dateSoin: today });
  }

  loadTtt() {
    this.traitementService.getAll().subscribe(res => this.traitements = res);
  }

  loadAnimals() {
    this.service.getAnimals().subscribe(res => {
      this.animals = res.map((a: any) => ({ 
        label: a.codeAnimal, 
        value: a.codeAnimal 
      }));
    });
  }

  get isIndividuel() {
    return this.typeSoin === 'individuel';
  }

  get isCollectif() {
    return this.typeSoin === 'collectif';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.target && this.mode === 'edit') {
      if (this.target.soinCollectif) {
        this.typeSoin = 'collectif';
      } else {
        this.typeSoin = 'individuel';
      }

      const dateParts = this.target.dateSoin.split('/');
      const dateObj = new Date(
        parseInt(dateParts[2]), 
        parseInt(dateParts[1]) - 1, 
        parseInt(dateParts[0])
      );

      this.form.patchValue({
        codeAnimal: this.target.animalCode || '',
        dateSoin: dateObj,
        motif: this.target.motif,
        traitement: this.target.traitement,
        traitementApporte: this.target.traitementApporte,
        cout: this.target.cout,
        coutMedicament: this.target.coutMedicament,
        veterinaire: this.target.veterinaire,
        observations: this.target.observations
      });
      
      this.updateValidators();
    }
  }

  onTypeSoinChange() {
    this.updateValidators();
    this.form.patchValue({
      codeAnimal: '',
      animalCodes: [],
      applyToAll: false
    });
  }

  updateValidators() {
    const codeAnimalCtrl = this.form.get('codeAnimal');
    const animalCodesCtrl = this.form.get('animalCodes');
    const applyToAllCtrl = this.form.get('applyToAll');

    if (this.isIndividuel) {
      codeAnimalCtrl?.setValidators([Validators.required]);
      animalCodesCtrl?.clearValidators();
      applyToAllCtrl?.clearValidators();
    } else {
      codeAnimalCtrl?.clearValidators();
      animalCodesCtrl?.clearValidators();
      applyToAllCtrl?.clearValidators();
    }

    codeAnimalCtrl?.updateValueAndValidity();
    animalCodesCtrl?.updateValueAndValidity();
    applyToAllCtrl?.updateValueAndValidity();
  }

  calcTotal() {
    const cout = Number(this.form.get('cout')!.value || 0);
    const med = Number(this.form.get('coutMedicament')!.value || 0);
    const total = cout + med;
    this.form.get('totalPrestation')!.setValue(total, { emitEvent: false });
  }

  handleShow() {
    this.showForm = true;
    this.showFormChange.emit(true);
  }

  resetForm() {
    this.form.reset();
    this.form.patchValue({ dateSoin: new Date() });
  }

  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  handleSubmit() {
    if (!this.form.valid) {
      console.error('Formulaire invalide');
      return;
    }

    if (this.isCollectif) {
      const applyToAll = this.form.value.applyToAll;
      const animalCodes = this.form.value.animalCodes || [];
      
      if (!applyToAll && animalCodes.length === 0) {
        alert('Veuillez cocher "Tous les animaux" ou sélectionner au moins un animal');
        return;
      }
    }

    this.processing = true;

    const dateValue = this.form.value.dateSoin;
    const formattedDate = this.formatDate(dateValue);

    const payload: SoinAnimalDTO = {
      codeAnimal: this.isIndividuel ? this.form.value.codeAnimal : undefined,
      animalCodes: this.isCollectif && this.form.value.animalCodes?.length > 0 
        ? this.form.value.animalCodes 
        : undefined,
      applyToAll: this.isCollectif ? this.form.value.applyToAll : false,
      dateSoin: formattedDate,
      motif: this.form.value.motif,
      traitement: this.form.value.traitement,
      traitementApporte: this.form.value.traitementApporte || undefined,
      cout: Number(this.form.value.cout || 0),
      coutMedicament: Number(this.form.value.coutMedicament || 0),
      veterinaire: this.form.value.veterinaire,
      observations: this.form.value.observations || undefined
    };

    if (this.mode === 'create') {
      this.service.create(payload).subscribe({
        next: () => this.afterSubmit(),
        error: (err) => {
          console.error(err);
          alert('Erreur lors de la création');
          this.processing = false;
        }
      });
    } else {
      this.service.update(this.target.id, payload).subscribe({
        next: () => this.afterSubmit(),
        error: (err) => {
          console.error(err);
          alert('Erreur lors de la modification');
          this.processing = false;
        }
      });
    }
  }

  private afterSubmit() {
    this.processing = false;
    this.showForm = false;
    this.showFormChange.emit(false);
    this.onUpdate.emit();
    this.form.reset();
    this.typeSoin = 'individuel';
    this.form.patchValue({ dateSoin: new Date() });
  }
}