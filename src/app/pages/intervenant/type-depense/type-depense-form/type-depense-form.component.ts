import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TypeDepenseService } from '../../../../@core/service/type-depense.service';
interface TypeDepenseDTO {
  id?: number;
  nom: string;
}

@Component({
  selector: 'app-type-depense-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, DialogModule],
  templateUrl: './type-depense-form.component.html'
})
export class TypeDepenseFormComponent implements OnChanges {

  @Input() target?: TypeDepenseDTO;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() showForm = false;
  @Output() showFormChange = new EventEmitter<boolean>();
  @Output() onUpdate = new EventEmitter<void>();

  typeDepenseForm: FormGroup;
  processing = false;

  constructor(private fb: FormBuilder, private service: TypeDepenseService) {
    this.typeDepenseForm = this.fb.group({
      nom: ['', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['target'] && this.target) {
      this.typeDepenseForm.patchValue(this.target);
    } else if (changes['target'] && !this.target) {
      this.typeDepenseForm.reset();
    }
  }

  handleSubmit() {
    if (!this.typeDepenseForm.valid) return;

    this.processing = true;
    const dto: TypeDepenseDTO = this.typeDepenseForm.value;

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
  }

  closeDialog() {
    this.showForm = false;
    this.showFormChange.emit(this.showForm);
  }
}
