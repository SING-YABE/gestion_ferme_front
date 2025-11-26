import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { NgIf } from '@angular/common';
import { SuiviReproductionService, SuiviReproduction } from '../../../@core/service/suivi-reproduction.service';
import { DropdownModule } from 'primeng/dropdown';
import { AnimalService } from '../../../@core/service/animal.service';
import { CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-suivi-reproduction-form',
  standalone: true,
  imports: [DialogModule, ReactiveFormsModule, InputTextModule, ButtonModule,DropdownModule, CalendarModule, NgIf],
  templateUrl: './suivi-reproduction-form.component.html',
  styleUrls: ['./suivi-reproduction-form.component.scss']
})
export class SuiviReproductionFormComponent implements OnInit {
  @Input() target: SuiviReproduction | null = null;
  @Input() mode: 'create' | 'edit' = 'create';
  @Output() onUpdate: EventEmitter<any> = new EventEmitter();

  form: FormGroup;
  showForm = false;
  processing = false;
  truies: any[] = [];
  verrats: any[] = [];

  constructor(private fb: FormBuilder, private srService: SuiviReproductionService, private toastr: ToastrService,
        private animalService: AnimalService,      
  ) {
    this.form = this.fb.group({
     truieCode: ['', Validators.required],
      verratCode: ['', Validators.required],
      dateSaillie: ['', Validators.required],
      dateMiseBasPrevue: ['', Validators.required],
      dateMiseBasReelle: [''],
      nbNesVivants: [''],
      nbMortsNes: [''],
      nbSevres: [''],
      observations: ['']
    });
  }

  ngOnInit(): void {
        this.loadAnimals(); 
    if (this.mode === 'edit' && this.target) {
      this.form.patchValue(this.target);
    }
  }
  loadAnimals() {
    this.animalService.getAll().subscribe({
      next: (animals) => {
        this.truies = animals
          .filter(a => a.typeAnimal.prefix === 'T')
          .map(t => ({
            label: t.codeAnimal,
            value: t.codeAnimal
          }));

        this.verrats = animals
          .filter(a => a.typeAnimal.prefix === 'V')
          .map(v => ({
            label: v.codeAnimal,
            value: v.codeAnimal
          }));
      },
      error: (err) => {
        console.error(err);
        this.toastr.error("Impossible de charger les animaux");
      }
    });
  }
  handleShow() {
    this.showForm = true;
  }

  handleSubmit() {
    if (!this.form.valid) return;

    this.processing = true;
    const data: SuiviReproduction = this.form.value;

    if (this.mode === 'create') {
      this.srService.create(data).subscribe({
        next: (res) => {
          this.toastr.success('Suivi reproduction ajouté avec succès !');
          this.onUpdate.emit(res);
          this.showForm = false;
          this.form.reset();
        },
        error: (err) => {
          console.error(err);
          this.toastr.error("Échec de l'ajout du suivi reproduction");
        },
        complete: () => (this.processing = false)
      });
    } else {
      this.srService.update(this.target!.id!, data).subscribe({
        next: (res) => {
          this.toastr.success('Suivi reproduction mis à jour avec succès !');
          this.onUpdate.emit(res);
          this.showForm = false;
        },
        error: (err) => {
          console.error(err);
          this.toastr.error("Échec de la mise à jour du suivi reproduction");
        },
        complete: () => (this.processing = false)
      });
    }
  }
}
