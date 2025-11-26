import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { NgIf } from '@angular/common';
import { TypeAlimentService } from '../../../../@core/service/type-aliment.service';
import { TypeAlimentDTO, TypeAlimentResponseDTO } from '../../../../@core/service/type-aliment.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-type-aliment-form',
  standalone: true,
  imports: [ReactiveFormsModule, DialogModule, InputTextModule, ButtonModule, NgIf],
  templateUrl: './type-aliment-form.component.html',
  styleUrls: ['./type-aliment-form.component.scss']
})
export class TypeAlimentFormComponent {
  @Input() target?: TypeAlimentResponseDTO;
  @Input() mode: 'create' | 'edit' = 'create';
  @Output() onUpdate = new EventEmitter<void>();

  showForm = false;
  processing = false;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private service: TypeAlimentService,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      libelle: ['', Validators.required]
    });
  }

  ngOnChanges(): void {
    if (this.mode === 'edit' && this.target) {
      this.form.patchValue({ libelle: this.target.libelle });
    }
  }

  handleShow(): void {
    this.showForm = true;
  }

  handleSubmit(): void {
    if (this.form.invalid) return;
    this.processing = true;

    const dto: TypeAlimentDTO = { libelle: this.form.value.libelle };

    if (this.mode === 'create') {
      this.service.create(dto).subscribe({
        next: () => {
          this.toastr.success('Type d’aliment ajouté');
          this.onUpdate.emit();
          this.showForm = false;
          this.form.reset();
          this.processing = false;
        },
        error: err => {
          console.error(err);
          this.toastr.error('Erreur lors de l’ajout');
          this.processing = false;
        }
      });
    } else if (this.mode === 'edit' && this.target) {
      this.service.update(this.target.id, dto).subscribe({
        next: () => {
          this.toastr.success('Type d’aliment mis à jour');
          this.onUpdate.emit();
          this.showForm = false;
          this.processing = false;
        },
        error: err => {
          console.error(err);
          this.toastr.error('Erreur lors de la mise à jour');
          this.processing = false;
        }
      });
    }
  }
}
