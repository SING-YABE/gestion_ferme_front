import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { SanteSoinsService,SoinAnimalDTO } from '../../../@core/service/santesoins.service';
import { Calendar, CalendarModule } from 'primeng/calendar';
@Component({
  selector: 'app-santesoins-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    DropdownModule,
    CheckboxModule,
    FormsModule,
    CalendarModule
  ],
  templateUrl: './santesoins-form.component.html'
})
export class SantesoinsFormComponent implements OnInit, OnChanges {

  @Input() target?: SoinAnimalDTO;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() showForm = false;

  @Output() showFormChange = new EventEmitter<boolean>();
  @Output() onUpdate = new EventEmitter<void>();

  form!: FormGroup;
  processing = false;

  isSoinCollectif = false;

  coutPresets = [2500, 5000, 10000, 2500];


  constructor(
    private fb: FormBuilder,
    private service: SanteSoinsService
  ) {
    this.form = this.fb.group({
      codeAnimal: [''],
      dateSoin: ['', Validators.required],
      motif: ['', Validators.required],
      traitement: ['', Validators.required],
      cout: [0, Validators.required],
      veterinaire: ['', Validators.required],
      observations: ['']
    });
  }
ngOnInit(): void {
  const today = new Date();
  const formatted = `${today.getDate().toString().padStart(2,'0')}/${
    (today.getMonth() + 1).toString().padStart(2,'0')
  }/${today.getFullYear()}`;
  this.form.patchValue({ dateSoin: formatted });
}


  ngOnChanges(changes: SimpleChanges): void {
    if (this.target) {
      this.form.patchValue(this.target);
      this.isSoinCollectif = !this.target.codeAnimal;
    }
  }

  onSoinCollectifChange() {
    if (this.isSoinCollectif) {
      this.form.patchValue({ codeAnimal: '' });
      this.form.get('codeAnimal')?.clearValidators();
    } else {
      this.form.get('codeAnimal')?.setValidators([Validators.required]);
    }
    this.form.get('codeAnimal')?.updateValueAndValidity();
  }

  /** Remplir le coût en cliquant */
  applyCout(c: number) {
    this.form.patchValue({ cout: c });
  }

  /** Beautifier coût */
  formatCout() {
    let val = this.form.value.cout;
    if (val < 0) this.form.patchValue({ cout: 0 });
  }

  handleShow() {
    this.showForm = true;
    this.showFormChange.emit(true);
  }

  handleSubmit() {
    if (!this.form.valid) return;

    this.processing = true;
    const dto: SoinAnimalDTO = this.form.value;

    // Si soin collectif, on retire le codeAnimal
    if (this.isSoinCollectif) {
      delete dto.codeAnimal;
    }

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
    this.form.reset();
    this.isSoinCollectif = false;
  }
}