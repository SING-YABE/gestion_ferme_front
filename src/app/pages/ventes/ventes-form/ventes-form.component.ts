import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { NgIf, NgFor , DecimalPipe} from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { VenteService, VenteCreateDTO, AnimalVenteDTO } from '../../../@core/service/vente.service';
import { TypeventeService, TypeVenteResponseDTO } from '../../../@core/service/typevente.service';
import { AnimalService, AnimalResponseDTO } from '../../../@core/service/animal.service';
@Component({
  selector: 'app-ventes-form',
  standalone: true,
  imports: [
    DialogModule, 
    ReactiveFormsModule, 
    InputTextModule, 
    ButtonModule, 
    CalendarModule, 
    DropdownModule,
    NgIf, 
    NgFor,
    DecimalPipe
  ],
  templateUrl: './ventes-form.component.html',
  styleUrls: ['./ventes-form.component.scss']
})
export class VentesFormComponent implements OnInit {

  @Output() onUpdate = new EventEmitter();

  showForm = false;
  processing = false;

  form: FormGroup;
  typesVente: TypeVenteResponseDTO[] = [];
  animauxDisponibles: AnimalResponseDTO[] = [];

  constructor(
    private fb: FormBuilder,
    private venteService: VenteService,
    private typeventeService: TypeventeService,
    private animalService: AnimalService,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      dateVente: ['', Validators.required],
      client: ['', Validators.required],
      animaux: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadTypesVente();
    this.loadAnimaux();
  }

  get animaux(): FormArray {
    return this.form.get('animaux') as FormArray;
  }

  loadTypesVente(): void {
    this.typeventeService.getAll().subscribe({
      next: (data) => this.typesVente = data,
      error: () => this.toastr.error('Erreur chargement types vente')
    });
  }

  loadAnimaux(): void {
    this.animalService.getAll().subscribe({
      next: (data) => {
        // Filtrer uniquement les animaux non vendus
        this.animauxDisponibles = data.filter(a => !a.vendu);
      },
      error: () => this.toastr.error('Erreur chargement animaux')
    });
  }

  ajouterAnimal(): void {
    const animalGroup = this.fb.group({
      codeAnimal: ['', Validators.required],
      typeVenteId: ['', Validators.required],
      poidsVente: ['', [Validators.required, Validators.min(0.1)]],
      prixUnitaire: ['', [Validators.required, Validators.min(1)]]
    });
    this.animaux.push(animalGroup);
  }

  supprimerAnimal(index: number): void {
    this.animaux.removeAt(index);
  }

  handleShow(): void {
    this.showForm = true;
    // Ajouter au moins un animal par défaut
    if (this.animaux.length === 0) {
      this.ajouterAnimal();
    }
  }

  handleSubmit(): void {
    if (this.form.invalid) {
      this.toastr.warning('Veuillez remplir tous les champs');
      return;
    }

    this.processing = true;

    // Convertir la date au format dd/MM/yyyy
    const dateValue = this.form.value.dateVente;
    const dateStr = dateValue instanceof Date 
      ? this.formatDate(dateValue) 
      : dateValue;

    const data: VenteCreateDTO = {
      dateVente: dateStr,
      client: this.form.value.client,
      animaux: this.form.value.animaux
    };

    this.venteService.create(data).subscribe({
      next: (res) => {
        this.toastr.success('Vente enregistrée avec succès');
        this.onUpdate.emit(res);
        this.showForm = false;
        this.form.reset();
        this.animaux.clear();
      },
      error: (err) => {
        const message = err.error?.message || 'Erreur lors de la création';
        this.toastr.error(message);
      },
      complete: () => (this.processing = false)
    });
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  calculerMontantAnimal(index: number): number {
    const animal = this.animaux.at(index).value;
    return (animal.poidsVente || 0) * (animal.prixUnitaire || 0);
  }

  calculerMontantTotal(): number {
    return this.animaux.controls.reduce((total, control) => {
      const animal = control.value;
      return total + ((animal.poidsVente || 0) * (animal.prixUnitaire || 0));
    }, 0);
  }
}