/**
 * AlimentationComponent — Gestion de l'alimentation porcine
 * ==========================================================
 * 3 onglets :
 *   1. Liste           — historique + création
 *   2. Ration Réf.     — suggestion officielle DGPA/MRAH + ONG Thamani
 *   3. Calcul Coût     — calculateur avec alerte règle 100 FCFA/kg
 *
 * L'analyse IA (KPI + Gemini) est dans /aide-decision (SadComponent).
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

import { TableModule }           from 'primeng/table';
import { ButtonModule }          from 'primeng/button';
import { ConfirmDialogModule }   from 'primeng/confirmdialog';
import { TabViewModule }         from 'primeng/tabview';
import { DropdownModule }        from 'primeng/dropdown';
import { InputTextModule }       from 'primeng/inputtext';
import { InputNumberModule }     from 'primeng/inputnumber';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule }             from 'primeng/tag';
import { ToastModule }           from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AlimentationFormComponent }                     from './alimentation-form/alimentation-form.component';
import { AlimentationResponseDTO, AlimentationService,
         StadePhysiologique, RationReferenceDTO,
         CoutRationDTO, IngredientAlimentationDTO }       from '../../@core/service/alimentation.service';
import { IngredientService, IngredientResponseDTO }       from '../../@core/service/ingredient.service';

@Component({
  selector: 'app-alimentation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    ConfirmDialogModule,
    TabViewModule,
    DropdownModule,
    InputTextModule,
    InputNumberModule,
    ProgressSpinnerModule,
    TagModule,
    ToastModule,
    AlimentationFormComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './alimentation.component.html',
  styleUrls: ['./alimentation.component.scss']
})
export class AlimentationComponent implements OnInit {

  // ── Onglet 1 : Liste ────────────────────────────────────────
  loading = false;
  data: AlimentationResponseDTO[] = [];
  pageSize = 10;

  // ── Onglet 2 : Ration de référence ──────────────────────────
  stades: { label: string; value: StadePhysiologique }[] = [
    { label: 'Porcelet sevré (7–25 kg)',  value: 'PORCELET_SEVRAGE'  },
    { label: 'Croissance (25–60 kg)',     value: 'CROISSANCE'        },
    { label: 'Finition (> 60 kg)',        value: 'FINITION'          },
    { label: 'Truie gestante',            value: 'TRUIE_GESTANTE'    },
    { label: 'Truie allaitante',          value: 'TRUIE_ALLAITANTE'  },
    { label: 'Truie vide',               value: 'TRUIE_VIDE'        },
    { label: 'Verrat',                   value: 'VERRAT'            },
  ];

  stadeSelectionne: StadePhysiologique | null = null;
  poidsKg: number | null = null;
  rationLoading = false;
  rationResult: RationReferenceDTO | null = null;
  rationErreur: string | null = null;

  get rationIngredients(): { nom: string; pct: number; couleur: string }[] {
    if (!this.rationResult) return [];
    return [
      { nom: 'Son de maïs',      pct: this.rationResult.sonMaïsPct,        couleur: '#F59E0B' },
      { nom: 'Drèche brasserie', pct: this.rationResult.drecheBrasseriePct, couleur: '#8B5CF6' },
      { nom: 'Drèche dolo',      pct: this.rationResult.drecheDoloPct,      couleur: '#EC4899' },
      { nom: 'Tourteau coton',   pct: this.rationResult.tourteauCotonPct,   couleur: '#10B981' },
      { nom: 'Farine poisson',   pct: this.rationResult.farinePoissonPct,   couleur: '#3B82F6' },
      { nom: 'Coquillage',       pct: this.rationResult.coquillagePct,      couleur: '#6B7280' },
      { nom: 'Sel',              pct: this.rationResult.selPct,             couleur: '#D1D5DB' },
    ].filter(i => i.pct > 0);
  }

  // ── Onglet 3 : Calculateur de coût ──────────────────────────
  ingredients: IngredientResponseDTO[] = [];
  calculForm!: FormGroup;
  calculLoading = false;
  calculResult: CoutRationDTO | null = null;
  calculErreur: string | null = null;

  get lignesCalcul(): FormArray { return this.calculForm.get('lignes') as FormArray; }

  get coutTotalCalcul(): number {
    return this.lignesCalcul.controls.reduce((t, c) =>
      t + (c.value.quantiteKg || 0) * (c.value.prixUnitaire || 0), 0);
  }

  constructor(
    private fb: FormBuilder,
    private alimentationService: AlimentationService,
    private ingredientService: IngredientService,
    private confirm: ConfirmationService,
    private toast: MessageService
  ) {
    this.initCalculForm();
  }

  ngOnInit(): void {
    this.loadListe();
    this.loadIngredients();
  }

  // ── Liste ────────────────────────────────────────────────────

  loadListe(): void {
    this.loading = true;
    this.alimentationService.getAll().subscribe({
      next: res => { this.data = res; this.loading = false; },
      error: ()  => this.loading = false
    });
  }

  confirmDelete(item: AlimentationResponseDTO): void {
    this.confirm.confirm({
      message: 'Supprimer cette alimentation ?',
      accept: () => {
        this.alimentationService.delete(item.id).subscribe({
          next: () => { this.toast.add({ severity: 'success', summary: 'Supprimé', detail: 'Alimentation supprimée' }); this.loadListe(); },
          error: ()  => this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Suppression impossible' })
        });
      }
    });
  }

  // ── Ration de référence ──────────────────────────────────────

  suggererRation(): void {
    if (!this.stadeSelectionne) return;
    this.rationLoading = true;
    this.rationResult  = null;
    this.rationErreur  = null;
    this.alimentationService.getRationReference(this.stadeSelectionne, this.poidsKg ?? undefined).subscribe({
      next: res => { this.rationResult = res; this.rationLoading = false; },
      error: err => { this.rationErreur = err.message; this.rationLoading = false; }
    });
  }

  importerRationDansCalculateur(ration: RationReferenceDTO): void {
    this.lignesCalcul.clear();
    this.calculResult = null;
    const proportions = [
      { nom: 'Son de maïs',      pct: ration.sonMaïsPct        },
      { nom: 'Drèche brasserie', pct: ration.drecheBrasseriePct },
      { nom: 'Drèche dolo',      pct: ration.drecheDoloPct      },
      { nom: 'Tourteau coton',   pct: ration.tourteauCotonPct   },
      { nom: 'Farine poisson',   pct: ration.farinePoissonPct   },
      { nom: 'Coquillage',       pct: ration.coquillagePct      },
    ].filter(i => i.pct > 0);

    proportions.forEach(item => {
      const found = this.ingredients.find(ing => ing.nom.toLowerCase().includes(item.nom.split(' ')[0].toLowerCase()));
      this.lignesCalcul.push(this.fb.group({
        ingredientId:  [found?.id ?? null],
        ingredientNom: [found?.nom ?? item.nom, Validators.required],
        quantiteKg:    [+(item.pct / 100).toFixed(3), [Validators.required, Validators.min(0.001)]],
        prixUnitaire:  [0, [Validators.required, Validators.min(0)]],
      }));
    });
    this.toast.add({ severity: 'info', summary: 'Importé', detail: 'Renseignez les prix dans l\'onglet Calcul Coût' });
  }

  // ── Calculateur de coût ──────────────────────────────────────

  loadIngredients(): void {
    this.ingredientService.getAll().subscribe(res => this.ingredients = res);
  }

  initCalculForm(): void {
    this.calculForm = this.fb.group({ lignes: this.fb.array([]) });
    this.ajouterLigneCalcul();
  }

  ajouterLigneCalcul(): void {
    this.lignesCalcul.push(this.fb.group({
      ingredientId:  [null],
      ingredientNom: ['', Validators.required],
      quantiteKg:    [null, [Validators.required, Validators.min(0.001)]],
      prixUnitaire:  [null, [Validators.required, Validators.min(0)]],
    }));
  }

  supprimerLigneCalcul(i: number): void {
    if (this.lignesCalcul.length > 1) this.lignesCalcul.removeAt(i);
  }

  onIngredientChange(i: number): void {
    const ctrl  = this.lignesCalcul.at(i);
    const found = this.ingredients.find(ing => ing.id === ctrl.value.ingredientId);
    if (found) ctrl.patchValue({ ingredientNom: found.nom }, { emitEvent: false });
  }

  calculerCout(): void {
    if (this.calculForm.invalid) return;
    this.calculLoading = true;
    this.calculResult  = null;
    this.calculErreur  = null;
    const payload: IngredientAlimentationDTO[] = this.lignesCalcul.value.map((l: any) => ({
      ingredientId: l.ingredientId ?? 0,
      quantiteKg:   l.quantiteKg,
      prixUnitaire: l.prixUnitaire,
    }));
    this.alimentationService.calculerCoutRation(payload).subscribe({
      next: res => { this.calculResult = res; this.calculLoading = false; },
      error: err => { this.calculErreur = err.message; this.calculLoading = false; }
    });
  }

  reinitialiserCalcul(): void {
    this.lignesCalcul.clear();
    this.ajouterLigneCalcul();
    this.calculResult = null;
    this.calculErreur = null;
  }

  sousTotalLigne(i: number): number {
    const v = this.lignesCalcul.at(i).value;
    return (v.quantiteKg || 0) * (v.prixUnitaire || 0);
  }
}
