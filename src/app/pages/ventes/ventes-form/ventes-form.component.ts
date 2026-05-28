import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import {
  FormBuilder, FormGroup, Validators,
  ReactiveFormsModule, FormArray, AbstractControl
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { SelectButtonModule } from 'primeng/selectbutton';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { VenteService, VenteCreateDTO, ModeVente } from '../../../@core/service/vente.service';
import { TypeventeService, TypeVenteResponseDTO } from '../../../@core/service/typevente.service';
import { AnimalService, AnimalResponseDTO } from '../../../@core/service/animal.service';

@Component({
  selector: 'app-ventes-form',
  standalone: true,
  imports: [
    DialogModule, ReactiveFormsModule, InputTextModule,
    ButtonModule, CalendarModule, DropdownModule,
    SelectButtonModule, NgIf, NgFor, DecimalPipe
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

  // Options pour le SelectButton PrimeNG
  modesVente = [
    { label: '⚖️ Au poids', value: 'AU_POIDS' },
    { label: '🤝 Sans pesée', value: 'SANS_PESEE' }
  ];

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
      next: (data) => this.animauxDisponibles = data,
      error: () => this.toastr.error('Erreur chargement animaux')
    });
  }

ajouterAnimal(): void {
  const animalGroup = this.fb.group({
    codeAnimal:  ['', Validators.required],
    typeVenteId: ['', Validators.required],
    modeVente:   ['AU_POIDS' as ModeVente, Validators.required], // valeur par défaut
    poidsVente:  ['', [Validators.min(0.1)]],
    prixUnitaire:['', [Validators.min(1)]],
    prixNegocie: ['', [Validators.min(1)]]
  });

  // Mise à jour dynamique des validateurs à chaque changement de mode
  animalGroup.get('modeVente')!.valueChanges.subscribe((mode) => {
    this.mettreAJourValidateurs(animalGroup, mode as ModeVente);
  });

  // Appliquer les validateurs initiaux selon le mode par défaut
  this.mettreAJourValidateurs(animalGroup, 'AU_POIDS');

  this.animaux.push(animalGroup);
}

private mettreAJourValidateurs(group: AbstractControl, mode: ModeVente): void {
  const fg = group as FormGroup;
  const poidsCtrl    = fg.get('poidsVente')!;
  const prixUnitCtrl = fg.get('prixUnitaire')!;
  const prixNegCtrl  = fg.get('prixNegocie')!;

  if (mode === 'AU_POIDS') {
    // Au poids → poids et prix unitaire requis
    poidsCtrl.setValidators([Validators.required, Validators.min(0.1)]);
    prixUnitCtrl.setValidators([Validators.required, Validators.min(1)]);

    // Prix négocié non utilisé
    prixNegCtrl.clearValidators();
    prixNegCtrl.setValue(null);
  } else {
    // Sans pesée → prix négocié requis
    prixNegCtrl.setValidators([Validators.required, Validators.min(1)]);

    // Champs poids et prix unitaire non utilisés
    poidsCtrl.clearValidators();
    prixUnitCtrl.clearValidators();
    poidsCtrl.setValue(null);
    prixUnitCtrl.setValue(null);
  }

  // Actualiser l'état du formulaire pour refléter les validators
  poidsCtrl.updateValueAndValidity();
  prixUnitCtrl.updateValueAndValidity();
  prixNegCtrl.updateValueAndValidity();
}

  supprimerAnimal(index: number): void {
    this.animaux.removeAt(index);
  }

  getModeVente(index: number): ModeVente {
    return this.animaux.at(index).get('modeVente')?.value as ModeVente;
  }

  handleShow(): void {
    this.showForm = true;
    if (this.animaux.length === 0) {
      this.ajouterAnimal();
    }
  }

  handleSubmit(): void {
    if (this.form.invalid || this.animaux.length === 0) {
      this.toastr.warning('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.processing = true;

    const formatDate = (val: any): string | null => {
      if (!val) return null;
      if (val instanceof Date) {
        const d = String(val.getDate()).padStart(2, '0');
        const m = String(val.getMonth() + 1).padStart(2, '0');
        return `${d}/${m}/${val.getFullYear()}`;
      }
      return val;
    };

    const data: VenteCreateDTO = {
      dateVente: formatDate(this.form.value.dateVente)!,
      dateEnlevement: formatDate(this.form.value.dateEnlevement),
      dateEnlevementAuPlusTard: formatDate(this.form.value.dateEnlevementAuPlusTard),
      client: this.form.value.client,
      animaux: this.form.value.animaux.map((a: any) => ({
        codeAnimal: a.codeAnimal,
        typeVenteId: a.typeVenteId,
        modeVente: a.modeVente,
        poidsVente: a.modeVente === 'AU_POIDS' ? a.poidsVente : null,
        prixUnitaire: a.modeVente === 'AU_POIDS' ? a.prixUnitaire : null,
        prixNegocie: a.modeVente === 'SANS_PESEE' ? a.prixNegocie : null
      }))
    };

    this.venteService.create(data).subscribe({
      next: (res) => {
        this.toastr.success('Vente enregistrée avec succès');
        this.onUpdate.emit(res);
        this.proposerImpressionFacture(res.id);
        this.showForm = false;
        this.form.reset();
        this.animaux.clear();
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Erreur lors de la création');
        this.processing = false;
      },
      complete: () => (this.processing = false)
    });
  }

  private proposerImpressionFacture(venteId: number): void {
    setTimeout(() => {
      if (confirm('Vente enregistrée ! Voulez-vous imprimer la facture ?')) {
        this.venteService.getFacturePdf(venteId).subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
          },
          error: () => this.toastr.error('Erreur génération facture')
        });
      }
    }, 500);
  }

  // Calcul montant pour affichage live
  calculerMontantAnimal(index: number): number {
    const a = this.animaux.at(index).value;
    if (a.modeVente === 'AU_POIDS') {
      return (a.poidsVente || 0) * (a.prixUnitaire || 0);
    }
    return a.prixNegocie || 0;
  }

  calculerMontantTotal(): number {
    return this.animaux.controls.reduce((total, _, i) => {
      return total + this.calculerMontantAnimal(i);
    }, 0);
  }
}