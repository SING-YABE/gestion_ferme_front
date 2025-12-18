import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ChargesDiversesDTO, ChargesDiversesService } from '../../../../@core/service/charges-diverses-service.service';
import { TypeDepenseService } from '../../../../@core/service/type-depense.service';

@Component({
  selector: 'app-chargesdiverses-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    DropdownModule
  ],
  templateUrl: './chargesdiverses-form.component.html'
})
export class ChargesdiversesFormComponent implements OnInit, OnChanges {

  @Input() target?: ChargesDiversesDTO;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() showForm = false;

  @Output() showFormChange = new EventEmitter<boolean>();
  @Output() onUpdate = new EventEmitter<void>();

  form!: FormGroup;
  processing = false;

  // Liste Type Dépense à afficher dans le dropdown
  typeDepenses: any[] = [];

  // Suggestions de montant
  montantPresets = [1000, 2000, 5000, 10000, 25000, 50000];

  constructor(
    private fb: FormBuilder,
    private service: ChargesDiversesService,
    private typeService: TypeDepenseService
  ) {
    this.form = this.fb.group({
      date: ['', Validators.required],
      typeDepenseId: ['', Validators.required],
      description: ['', Validators.required],
      montant: [0, Validators.required],
      modePaiement: ['', Validators.required],
      observations: ['']
    });
  }

  ngOnInit(): void {
    this.typeService.getAll().subscribe((res) => {
      this.typeDepenses = res;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.target) this.form.patchValue(this.target);
  }

  /** Remplir le montant en cliquant */
  applyMontant(m: number) {
    this.form.patchValue({ montant: m });
  }

  /** Beautifier montant */
  formatMontant() {
    let val = this.form.value.montant;
    if (val < 0) this.form.patchValue({ montant: 0 });
  }

  handleShow() {
    this.showForm = true;
    this.showFormChange.emit(true);
  }

  handleSubmit() {
    if (!this.form.valid) return;

    this.processing = true;
    const dto: ChargesDiversesDTO = this.form.value;

    if (this.mode === 'create') {
      this.service.create(dto).subscribe({
        next: () => this.afterSubmit(),
        error: () => (this.processing = false)
      });
    } else {
      this.service.update(this.target!.id!, dto).subscribe({
        next: () => this.afterSubmit(),
        error: () => (this.processing = false)
      });
    }
  }




  private afterSubmit() {
    this.processing = false;
    this.showForm = false;
    this.showFormChange.emit(false);
    this.onUpdate.emit();
  }
}
