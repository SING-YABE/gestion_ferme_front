import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { NgIf } from '@angular/common';
import { FournisseurDTO,FournisseurResponseDTO } from '../../../../@core/service/fournisseur.service';
import { ToastrService } from 'ngx-toastr';
import { FournisseurService } from '../../../../@core/service/fournisseur.service';

@Component({
  selector: 'app-fournisseur-form',
  standalone: true,
  imports: [ReactiveFormsModule, DialogModule, InputTextModule, ButtonModule, NgIf],
  templateUrl: './fournisseur-form.component.html',
  styleUrls: ['./fournisseur-form.component.scss']
})
export class FournisseurFormComponent {
  @Input() target?: FournisseurResponseDTO;
  @Input() mode: 'create' | 'edit' = 'create';
  @Output() onUpdate = new EventEmitter<void>();

  showForm = false;
  processing = false;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private service: FournisseurService,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      contact: ['']
    });
  }

  ngOnChanges(): void {
    if (this.mode === 'edit' && this.target) {
      this.form.patchValue({
        nom: this.target.nom,
        contact: this.target.contact
      });
    }
  }

  handleShow(): void {
    this.showForm = true;
  }

  handleSubmit(): void {
    if (this.form.invalid) return;
    this.processing = true;

    const dto: FournisseurDTO = {
      nom: this.form.value.nom,
      contact: this.form.value.contact
    };

    if (this.mode === 'create') {
      this.service.create(dto).subscribe({
        next: () => {
          this.toastr.success('Fournisseur ajouté');
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
          this.toastr.success('Fournisseur mis à jour');
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
