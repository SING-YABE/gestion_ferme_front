import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ToastrService } from 'ngx-toastr';
import { BadgeModule } from 'primeng/badge';
import { ButtonDirective, ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { StrategicCriterionService } from '../../../../@core/service/strategic-criterion.service';
@Component({
  selector: 'app-strategic-criterion-form',
  standalone: true,
  imports: [
    DialogModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonDirective,
    DropdownModule,
    BadgeModule,
    FaIconComponent,
    NgIf,
    ButtonModule
  ],
  templateUrl: './strategic-criterion-form.component.html',
  styleUrl: './strategic-criterion-form.component.scss'
})
export class StrategicCriterionFormComponent {
@Input() target: any;
  @Input() mode: 'edit' | 'create' = 'create';
  @Output() onUpdate: EventEmitter<any> = new EventEmitter();
  
  strategicCriterionForm: FormGroup;
  processing = false;
  showForm = false;

  constructor(
      private fb: FormBuilder,
      private toastr: ToastrService,
      private strategicCriterionService: StrategicCriterionService
  ) {
      this.strategicCriterionForm = this.fb.group({
          name: ['', [Validators.required]],
          description: ['', [Validators.required]],
      });
  }

  ngOnInit(): void {
      if (this.mode === 'edit' && this.target) {
          this.strategicCriterionForm.patchValue({
              name: this.target.name,
              description: this.target.description,
              id: this.target.id,
          });
      }
  }

  handleShow() {
      this.showForm = true;
  }

  handleSubmit1() {
    if (!this.strategicCriterionForm.valid) return; 
  
    this.processing = true; 
  
    const strategicCriterionData = {
      name: this.strategicCriterionForm.value.name,
      description: this.strategicCriterionForm.value.description,
    };

    if (this.mode == 'create') {
      this.strategicCriterionService.create(strategicCriterionData).subscribe({
        next: (response) => {
          console.log("C S créé :", response);
          this.toastr.success("Critère stratégique crée avec succès !");
          this.onUpdate.emit(response);
          this.showForm = false;
              this.strategicCriterionForm.reset();
        },
        error: (err) => {
          console.error("Erreur :", err);
          this.toastr.error("Échec de l'ajout du C S", "Erreur");
        },
        complete: () => {
          this.processing = false;  
        }
      });
    } else {

      this.strategicCriterionService.update(strategicCriterionData).subscribe({
        next: (response) => {
          console.log("C S MAJ :", response);
          this.toastr.success("Critére stratégique mis à jour avec succès !");
          this.onUpdate.emit(response);
          this.showForm = false;
              this.strategicCriterionForm.reset();
        },
        error: (err) => {
          console.error("Erreur :", err);
          this.toastr.error("Échec de la mis à jour du Critére stratégique", "Erreur");
        },
        complete: () => {
          this.processing = false;  
        }
      });


    }
  

  }

  handleSubmit() {
    if (!this.strategicCriterionForm.valid) return;
  
    this.processing = true;
    const strategicCriterionData = {
      name: this.strategicCriterionForm.value.name,
      description: this.strategicCriterionForm.value.description,
      // ID seulement en mode édition
      ...(this.mode === 'edit' && { id: this.target.id })
    };
  
    if (this.mode == 'create') {
      this.strategicCriterionService.create(strategicCriterionData).subscribe({
        next: (response) => {
          console.log(" C S créé :", response);
          this.toastr.success("Critère stratégique crée avec succès !");
          this.onUpdate.emit(response);
          this.showForm = false;
          this.strategicCriterionForm.reset();
        },
        error: (err) => {
          console.error("Erreur :", err);
          this.toastr.error("Échec de l'ajout du Critère stratégique", "Erreur");
        },
        complete: () => {
          this.processing = false;  
        }
      });
    } else {
      // ID pour la mise à jour
      this.strategicCriterionService.update(strategicCriterionData).subscribe({
        next: (response) => {
          console.log("C S mis à jour :", response);
          this.toastr.success("Critère stratégique mis à jour avec succès !");
          this.onUpdate.emit(response);
          this.showForm = false;
        },
        error: (err) => {
          console.error("Erreur :", err);
          this.toastr.error("Échec de la mise à jour du Critère stratégique", "Erreur");
        },
        complete: () => {
          this.processing = false;  
        }
      });
    }
  }
}
