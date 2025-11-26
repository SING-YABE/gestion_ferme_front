import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ButtonDirective, ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TypeAnimalService } from '../../../../@core/service/type-animal.service';

@Component({
  selector: 'app-type-animaux-form',
  standalone: true,
  imports: [
    DialogModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonDirective,
    NgIf,
    ButtonModule
  ],
  templateUrl: './type-animaux-form.component.html',
  styleUrl: './type-animaux-form.component.scss'
})
export class TypeAnimalFormComponent implements OnInit {
  @Input() target: any;
  @Input() mode: 'edit' | 'create' = 'create';
  @Output() onUpdate: EventEmitter<any> = new EventEmitter();
  
  typeAnimalForm: FormGroup;
  processing = false;
  showForm = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private typeAnimalService: TypeAnimalService
  ) {
    this.typeAnimalForm = this.fb.group({
      nom: ['', [Validators.required]],
      description: [''],
    });
  }

  ngOnInit(): void {
    if (this.mode === 'edit' && this.target) {
      this.typeAnimalForm.patchValue({
        nom: this.target.nom,
        description: this.target.description,
      });
    }
  }

  handleShow() {
    this.showForm = true;
  }

  handleSubmit() {
    if (!this.typeAnimalForm.valid) return;
  
    this.processing = true;
    const typeAnimalData = {
      nom: this.typeAnimalForm.value.nom,
      description: this.typeAnimalForm.value.description,
    };
  
    if (this.mode == 'create') {
      this.typeAnimalService.create(typeAnimalData).subscribe({
        next: (response) => {
          console.log("Type animal créé :", response);
          this.toastr.success("Type animal ajouté avec succès !");
          this.onUpdate.emit(response);
          this.showForm = false;
          this.typeAnimalForm.reset();
        },
        error: (err) => {
          console.error("Erreur :", err);
          this.toastr.error("Échec de l'ajout du type animal", "Erreur");
        },
        complete: () => {
          this.processing = false;  
        }
      });
    } else {
      this.typeAnimalService.update(this.target.id, typeAnimalData).subscribe({
        next: (response) => {
          console.log("Type animal mis à jour :", response);
          this.toastr.success("Type animal mis à jour avec succès !");
          this.onUpdate.emit(response);
          this.showForm = false;
        },
        error: (err) => {
          console.error("Erreur :", err);
          this.toastr.error("Échec de la mise à jour du type animal", "Erreur");
        },
        complete: () => {
          this.processing = false;  
        }
      });
    }
  }
}