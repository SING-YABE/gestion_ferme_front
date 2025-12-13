import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { NgIf } from '@angular/common';

import { ToastrService } from 'ngx-toastr';
import { IngredientDTO, IngredientResponseDTO,IngredientService } from '../../../../@core/service/ingredient.service';
import { TypeAlimentResponseDTO, TypeAlimentService } from '../../../../@core/service/type-aliment.service';
import { DropdownModule } from 'primeng/dropdown';
@Component({
  selector: 'app-ingredients-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, DialogModule, InputTextModule, ButtonModule, NgIf,DropdownModule],
  templateUrl: './ingredients-form.component.html',
  styleUrls: ['./ingredients-form.component.scss']
})
export class IngredientsFormComponent {
  @Input() target?: IngredientResponseDTO;
  @Input() mode: 'create' | 'edit' = 'create';
  @Output() onUpdate = new EventEmitter<void>();

  showForm = false;
  processing = false;

  form: FormGroup;
typeAliments: TypeAlimentResponseDTO[] = [];

selectedTypeAlimentId!: number; 

  constructor(
    private fb: FormBuilder,
    private service: IngredientService,
    private toastr: ToastrService,
    private typeAlimentService: TypeAlimentService
  ) {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      typeAlimentId: ['', Validators.required],
      typeAlimentLibelle: ['', Validators.required]
    });
  }
ngOnInit(): void {
  this.typeAlimentService.getAll().subscribe({
    next: (data) => this.typeAliments = data,
    error: (err) => console.error(err)
  });
}
  ngOnChanges() {
    if (this.mode === 'edit' && this.target) {
      this.form.patchValue({
        nom: this.target.nom,
        typeAlimentId: this.target.typeAlimentId,
        typeAlimentLibelle: this.target.typeAlimentLibelle
      });
    }
  }

  handleShow() {
    this.showForm = true;
  }
onSelectType(event: any) {
  const selected = this.typeAliments.find(t => t.id === event.value);
  if (selected) {
    this.form.patchValue({
      typeAlimentLibelle: selected.libelle
    });
  }
}


  handleSubmit() {
    if (this.form.invalid) return;
    this.processing = true;

    const dto: IngredientDTO = this.form.value;

    if (this.mode === 'create') {
      this.service.create(dto).subscribe({
        next: () => {
          this.toastr.success("Ingrédient ajouté");
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
    }
    else if (this.mode === 'edit' && this.target) {
      this.service.update(this.target.id, dto).subscribe({
        next: () => {
          this.toastr.success("Ingrédient mis à jour");
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
