import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
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
      dateEnlevement: [''],
      dateEnlevementAuPlusTard: [''],
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

    const dateVenteValue = this.form.value.dateVente;
    const dateEnlevementValue = this.form.value.dateEnlevement;
    const dateEnlevementAuPlusTardValue = this.form.value.dateEnlevementAuPlusTard;

    const dateVenteStr = dateVenteValue instanceof Date
      ? this.formatDate(dateVenteValue)
      : dateVenteValue;

    const dateEnlevementStr = dateEnlevementValue instanceof Date
      ? this.formatDate(dateEnlevementValue)
      : null;
    const dateEnlevementAuPlusTardStr = dateEnlevementAuPlusTardValue instanceof Date
      ? this.formatDate(dateEnlevementValue)
      : null;

    const data: VenteCreateDTO = {
      dateVente: dateVenteStr,
      dateEnlevement: dateEnlevementStr,
      dateEnlevementAuPlusTard: dateEnlevementAuPlusTardStr,
      client: this.form.value.client,
      animaux: this.form.value.animaux
    };

    this.venteService.create(data).subscribe({
      next: (res) => {
        this.toastr.success('Vente enregistrée avec succès');
        this.onUpdate.emit(res);
        
        // 🆕 Proposer d'imprimer la facture
        this.proposerImpressionFacture(res.id);
        
        this.showForm = false;
        this.form.reset();
        this.animaux.clear();
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Erreur lors de la création');
      },
      complete: () => (this.processing = false)
    });
  }

  // 🆕 Méthode pour proposer l'impression
  private proposerImpressionFacture(venteId: number): void {
    setTimeout(() => {
      if (confirm('Vente enregistrée ! Voulez-vous imprimer la facture ?')) {
        this.imprimerFacture(venteId);
      }
    }, 500);
  }

  // 🆕 Méthode pour imprimer la facture
  private imprimerFacture(venteId: number): void {
    this.venteService.getFacturePdf(venteId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        // Alternative: Télécharger directement
        // const link = document.createElement('a');
        // link.href = url;
        // link.download = `facture_${venteId}.pdf`;
        // link.click();
        // window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.toastr.error('Erreur lors de la génération de la facture');
      }
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