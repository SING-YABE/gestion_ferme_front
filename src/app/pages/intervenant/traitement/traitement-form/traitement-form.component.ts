import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TraitementDTO } from '../../../../@core/service/traitement.service';
import { TraitementService } from '../../../../@core/service/traitement.service';
@Component({
  selector: 'app-traitement-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, DialogModule],
  templateUrl: './traitement-form.component.html'
})
export class TraitementFormComponent implements OnChanges {

  @Input() target?: TraitementDTO;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() showForm = false;
  @Output() showFormChange = new EventEmitter<boolean>();
  @Output() onUpdate = new EventEmitter<void>();

  traitementForm: FormGroup;
  processing = false;

  constructor(private fb: FormBuilder, private service: TraitementService) {
    this.traitementForm = this.fb.group({
      nom: ['', Validators.required],
      description: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['target'] && this.target) {
      this.traitementForm.patchValue(this.target);
    } else if (changes['target'] && !this.target) {
      this.traitementForm.reset();
    }
  }

  handleSubmit() {
    if (!this.traitementForm.valid) return;

    this.processing = true;
    const dto: TraitementDTO = this.traitementForm.value;

    if (this.mode === 'create') {
      this.service.create(dto).subscribe({
        next: () => this.afterSubmit(),
        error: () => this.processing = false
      });
    } else if (this.mode === 'edit' && this.target?.id) {
      this.service.update(this.target.id, dto).subscribe({
        next: () => this.afterSubmit(),
        error: () => this.processing = false
      });
    }
  }

  private afterSubmit() {
    this.processing = false;
    this.showForm = false;
    this.showFormChange.emit(this.showForm);
    this.onUpdate.emit();
    this.traitementForm.reset();
  }

  closeDialog() {
    this.showForm = false;
    this.showFormChange.emit(this.showForm);
  }
}
