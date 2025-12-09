import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { NgIf } from '@angular/common';
import { EtatSanteDTO, EtatSanteResponseDTO, EtatSanteService } from '../../../../@core/service/etat-sante.service';
import { ToastrService } from 'ngx-toastr';
import { TypeAnimalService, TypeAnimalResponseDTO } from '../../../../@core/service/type-animal.service';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-etat-sante-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
    NgIf,
    DropdownModule
  ],
  templateUrl: './etat-sante-form.component.html',
  styleUrls: ['./etat-sante-form.component.scss']
})
export class EtatSanteFormComponent implements OnInit {
  @Input() target?: EtatSanteResponseDTO;
  @Input() mode: 'create' | 'edit' = 'create';
  @Output() onUpdate = new EventEmitter<void>();

  showForm = false;
  processing = false;
  form: FormGroup;
  typesAnimaux: TypeAnimalResponseDTO[] = [];
  constructor(
    private fb: FormBuilder,
    private service: EtatSanteService,
    private typeAnimalService: TypeAnimalService,  
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      description: ['', Validators.required],
      typeAnimalId:[0, [Validators.required, Validators.min(1)]]
    });
  }
ngOnInit(): void {
  this.typeAnimalService.getAll().subscribe({
    next: (data) => this.typesAnimaux = data,
    error: (err) => console.error('Erreur', err)
  });
}

ngOnChanges(): void {
  if (this.mode === 'edit' && this.target) {
    this.form.patchValue({ 
      description: this.target.description,
      typeAnimalId: this.target.typeAnimal.id  
    });
  }
}
  handleShow(): void {
    this.showForm = true;
  }

  handleSubmit(): void {
    if (this.form.invalid) return;
    this.processing = true;

    const dto: EtatSanteDTO = {
       description: this.form.value.description,
       typeAnimalId: this.form.value.typeAnimalId
      };

    if (this.mode === 'create') {
      this.service.create(dto).subscribe({
        next: () => {
          this.toastr.success("État de santé ajouté");
          this.onUpdate.emit();
          this.showForm = false;
          this.form.reset();
          this.processing = false;
        },
        error: err => {
          console.error(err);
          this.toastr.error("Erreur lors de l'ajout");
          this.processing = false;
        }
      });
    } else if (this.mode === 'edit' && this.target) {
      this.service.update(this.target.id, dto).subscribe({
        next: () => {
          this.toastr.success("État de santé mis à jour");
          this.onUpdate.emit();
          this.showForm = false;
          this.processing = false;
        },
        error: err => {
          console.error(err);
          this.toastr.error("Erreur lors de la mise à jour");
          this.processing = false;
        }
      });
    }
  }
}
