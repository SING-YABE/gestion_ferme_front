import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { BatimentDTO, BatimentResponseDTO } from '../../../../@core/service/batiment.service';
import { ToastrService } from 'ngx-toastr';
import { NgIf } from '@angular/common';
import { BatimentService } from '../../../../@core/service/batiment.service';
import { TypeVenteDTO, TypeVenteResponseDTO, TypeventeService } from '../../../../@core/service/typevente.service';

@Component({
  selector: 'app-typevente-form',
  standalone: true,
  imports: [ReactiveFormsModule, DialogModule, InputTextModule, ButtonModule, NgIf],
  templateUrl: './typevente-form.component.html',
  styleUrl: './typevente-form.component.scss'
})
export class TypeventeFormComponent {

@Input() target?: TypeVenteResponseDTO;
  @Input() mode: 'create' | 'edit' = 'create';
  @Output() onUpdate = new EventEmitter<void>();

  form: FormGroup;
  showForm = false;
  processing = false;

  constructor(private fb: FormBuilder, private service: TypeventeService, private toastr: ToastrService) {
    this.form = this.fb.group({
      nom: ['', Validators.required],
    });
  }

  ngOnChanges(): void {
    if (this.mode === 'edit' && this.target) {
      this.form.patchValue({
        nom: this.target.nom,
      });
    }
  }

  handleShow(): void {
    this.showForm = true;
  }

  handleSubmit(): void {
    if (this.form.invalid) return;

    this.processing = true;
    const dto: TypeVenteDTO = this.form.value;

    if (this.mode === 'create') {
      this.service.create(dto).subscribe({
        next: () => {
          this.toastr.success("Bâtiment ajouté");
          this.onUpdate.emit();
          this.showForm = false;
          this.form.reset();
          this.processing = false;
        },
        error: () => {
          this.toastr.error("Erreur lors de l'ajout");
          this.processing = false;
        }
      });
    } else if (this.mode === 'edit' && this.target) {
      this.service.update(this.target.id, dto).subscribe({
        next: () => {
          this.toastr.success("Type vente  mis à jour");
          this.onUpdate.emit();
          this.showForm = false;
          this.processing = false;
        },
        error: () => {
          this.toastr.error("Erreur de mise à jour");
          this.processing = false;
        }
      });
    }
  }
}
