import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ChargesDiversesService, ChargesDiversesDTO } from '../../../@core/service/charges-diverses-service.service';
import { TypeDepenseService, TypeDepenseDTO } from '../../../@core/service/type-depense.service';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';

@Component({
  selector: 'app-chargesdiverses-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    DropdownModule,
    CalendarModule,
    InputNumberModule,
    InputTextareaModule,
    InputTextModule,
    DropdownModule
  
  ],
  templateUrl: './chargesdiverses-form.component.html',
  styleUrls: ['./chargesdiverses-form.component.scss']
})
export class ChargesdiversesFormComponent implements OnInit, OnChanges {

  @Input() target?: ChargesDiversesDTO;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() showForm = false;

  @Output() showFormChange = new EventEmitter<boolean>();
  @Output() onUpdate = new EventEmitter<void>();

  form!: FormGroup;
  processing = false;

  typeDepenses: TypeDepenseDTO[] = [];
  montantPresets = [2000, 5000, 6000, 10000, 25000];

  modesPaiement = [
    'Espèces',
    'Mobile Money',
    'Virement bancaire',
    'Chèque',
    'Dépôt'
  ];

  constructor(
    private fb: FormBuilder,
    private service: ChargesDiversesService,
    private typeService: TypeDepenseService
  ) {
    this.form = this.fb.group({
      date: [new Date(), Validators.required],
      typeDepenseId: [null, Validators.required],
      description: ['', Validators.required],
      montant: [0, [Validators.required, Validators.min(1)]],
      modePaiement: ['', Validators.required],
      observations: ['']
    });
  }

  ngOnInit(): void {
    this.typeService.getAll().subscribe({
      next: (res) => {
        this.typeDepenses = res;
      },
      error: (err) => console.error('Erreur chargement types dépenses:', err)
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.target && changes['target']) {
      const dateValue = this.target.date ? new Date(this.target.date) : new Date();
      
      this.form.patchValue({
        date: dateValue,
        typeDepenseId: this.target.typeDepenseId,
        description: this.target.description,
        montant: this.target.montant,
        modePaiement: this.target.modePaiement,
        observations: this.target.observations || ''
      });
    }
  }

  applyMontant(m: number) {
    this.form.patchValue({ montant: m });
  }

  formatMontant() {
    let val = this.form.value.montant;
    if (val < 0) {
      this.form.patchValue({ montant: 0 });
    }
  }

  handleShow() {
    this.showForm = true;
    this.showFormChange.emit(true);
    
    if (this.mode === 'create') {
      this.form.reset({
        date: new Date(),
        typeDepenseId: null,
        description: '',
        montant: 0,
        modePaiement: '',
        observations: ''
      });
    }
  }

  handleSubmit() {
    if (!this.form.valid) {
      console.error('Formulaire invalide:', this.form.errors);
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control?.invalid) {
          console.error(`${key} invalide:`, control.errors);
        }
      });
      return;
    }

    this.processing = true;

    const formValue = this.form.value;
    const dateObj: Date = formValue.date;
    const dateStr = dateObj.toISOString().split('T')[0];

    const dto: ChargesDiversesDTO = {
      date: dateStr,
      typeDepenseId: formValue.typeDepenseId,
      description: formValue.description,
      montant: formValue.montant,
      modePaiement: formValue.modePaiement,
      observations: formValue.observations || undefined
    };

    if (this.mode === 'create') {
      this.service.create(dto).subscribe({
        next: () => this.afterSubmit(),
        error: (err) => {
          console.error('Erreur création:', err);
          this.processing = false;
        }
      });
    } else {
      this.service.update(this.target!.id!, dto).subscribe({
        next: () => this.afterSubmit(),
        error: (err) => {
          console.error('Erreur mise à jour:', err);
          this.processing = false;
        }
      });
    }
  }

  private afterSubmit() {
    this.processing = false;
    this.showForm = false;
    this.showFormChange.emit(false);
    this.form.reset({
      date: new Date(),
      typeDepenseId: null,
      description: '',
      montant: 0,
      modePaiement: '',
      observations: ''
    });
    this.onUpdate.emit();
  }
}