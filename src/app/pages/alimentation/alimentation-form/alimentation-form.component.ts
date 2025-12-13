

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { AlimentationService, AlimentationDTO } from '../../../@core/service/alimentation.service';
import { TypeAlimentService } from '../../../@core/service/type-aliment.service';
import { AnimalService } from '../../../@core/service/animal.service';
import { TypeAnimalService } from '../../../@core/service/type-animal.service';
import { FournisseurService } from '../../../@core/service/fournisseur.service';
import { IngredientService } from '../../../@core/service/ingredient.service';

@Component({
  selector: 'app-alimentation-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    CalendarModule,
    InputNumberModule
  ],
  templateUrl: './alimentation-form.component.html'
})
export class AlimentationFormComponent implements OnInit {

  @Input() mode: 'create' = 'create';
  @Input() showForm = false;

  @Output() showFormChange = new EventEmitter<boolean>();
  @Output() onUpdate = new EventEmitter<void>();

  form!: FormGroup;
  processing = false;

  // Mode principal: Achat ou Fabrication
  modeGestion: 'achat' | 'fabrication' = 'achat';

  // Données de référence
  typeAliments: any[] = [];
  ingredients: any[] = [];
  animaux: any[] = [];
  typeAnimaux: any[] = [];
  fournisseurs: any[] = [];

  // Catégories d'ingrédients pour le mode Fabrication
  categoriesIngredients = [
    { nom: 'Énergétique' },
    { nom: 'Protéique' },
    { nom: 'Minéral' },
    { nom: 'Vitamine' }
  ];

  constructor(
    private fb: FormBuilder,
    private service: AlimentationService,
    private typeAlimentService: TypeAlimentService,
    private animalService: AnimalService,
    private typeAnimalService: TypeAnimalService,
    private fournisseurService: FournisseurService,
    private ingredientService: IngredientService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadReferenceData();
  }

  initForm() {
    this.form = this.fb.group({
      // Champs communs
      date: [new Date(), Validators.required],
      fournisseurId: [null],
      
      // 🔥 NOUVEAUX CHAMPS GLOBAUX POUR FABRICATION
      modeAlimentationGlobal: ['lot'],  
      typeAnimalIdGlobal: [null],       
      animalIdGlobal: [null],           
      
      // Mode Achat
      ingredientsAchat: this.fb.array([]),
      
      // Mode Fabrication
      ingredientsFabrication: this.fb.array([])
    });
  }

  get ingredientsAchatArray(): FormArray {
    return this.form.get('ingredientsAchat') as FormArray;
  }

  get ingredientsFabricationArray(): FormArray {
    return this.form.get('ingredientsFabrication') as FormArray;
  }

  loadReferenceData() {
    this.typeAlimentService.getAll().subscribe((res) => {
      this.typeAliments = res;
    });

    this.ingredientService.getAll().subscribe((res) => {
      this.ingredients = res;
    });

    this.animalService.getAll().subscribe((res) => {
      this.animaux = res;
    });

    this.typeAnimalService.getAll().subscribe((res) => {
      this.typeAnimaux = res;
    });

    this.fournisseurService.getAll().subscribe((res) => {
      this.fournisseurs = res;
    });
  }

  // 🔥 NOUVELLE FONCTION: Changer le mode global (fabrication uniquement)
  setModeGlobal(mode: 'individuel' | 'lot') {
    this.form.patchValue({
      modeAlimentationGlobal: mode,
      typeAnimalIdGlobal: null,
      animalIdGlobal: null
    });
  }

  // Basculer entre Mode Achat et Mode Fabrication
  switchModeGestion(mode: 'achat' | 'fabrication') {
    this.modeGestion = mode;
    
    if (mode === 'achat') {
      // Réinitialiser les ingrédients fabrication
      this.ingredientsFabricationArray.clear();
      // Ajouter un ingrédient par défaut pour achat
      if (this.ingredientsAchatArray.length === 0) {
        this.ajouterIngredientAchat();
      }
    } else {
      // Mode fabrication: ajouter les catégories par défaut
      this.ingredientsAchatArray.clear();
      this.initCategoriesIngredients();
    }
  }

  // MODE ACHAT: Ajouter un ingrédient
  ajouterIngredientAchat() {
    const group = this.fb.group({
      typeAlimentId: [null, Validators.required],
      ingredientId: [null, Validators.required],
      quantiteKg: [0, [Validators.required, Validators.min(0.01)]],
      prixUnitaire: [0, [Validators.required, Validators.min(0)]],
      modeAlimentation: ['lot'],
      animalId: [null],
      typeAnimalId: [null],
      codeAnimal: [null]
    });

    // Réinitialiser ingredientId si le typeAliment change
    group.get('typeAlimentId')?.valueChanges.subscribe(() => {
      group.patchValue({ ingredientId: null });
    });

    // Met à jour codeAnimal quand on sélectionne un animal
    group.get('animalId')?.valueChanges.subscribe((selectedId: number | null) => {
      if (selectedId === null) {
        group.patchValue({ codeAnimal: null }, { emitEvent: false });
        return;
      }

      const animal = this.animaux.find(a => a.id === selectedId);
      group.patchValue({ codeAnimal: animal ? animal.codeAnimal : null }, { emitEvent: false });
    });

    this.ingredientsAchatArray.push(group);
  }

  supprimerIngredientAchat(index: number) {
    this.ingredientsAchatArray.removeAt(index);
  }

  // Filtrer les ingrédients par type pour MODE ACHAT
  getIngredientsByTypeAchat(typeAlimentId: number) {
    if (!typeAlimentId) return [];
    return this.ingredients.filter(i => i.typeAlimentId === typeAlimentId);
  }

  // MODE FABRICATION: Initialiser les catégories
  initCategoriesIngredients() {
    this.ingredientsFabricationArray.clear();
    this.categoriesIngredients.forEach(cat => {
      this.ajouterCategorieIngredient(cat.nom);
    });
  }

  ajouterCategorieIngredient(categorie: string) {
    const group = this.fb.group({
      categorie: [categorie],
      ingredientId: [null, Validators.required],
      quantiteKg: [0, [Validators.required, Validators.min(0.01)]],
      prixUnitaire: [0, [Validators.required, Validators.min(0)]]
    });

    this.ingredientsFabricationArray.push(group);
  }

  getIngredientsByCategorie(categorie: string) {
    const mapping: {[key: string]: string} = {
      'Énergétique': 'Énergétiques',
      'Protéique': 'Protéine',
      'Minéral': 'Minéraux',
      'Vitamine': 'Vitamines'
    };

    const libelle = mapping[categorie];
    if (!libelle) return [];

    return this.ingredients.filter(i => i.typeAlimentLibelle === libelle);
  }

  getSousTotal(index: number, mode: 'achat' | 'fabrication'): number {
    const array = mode === 'achat' ? this.ingredientsAchatArray : this.ingredientsFabricationArray;
    const ing = array.at(index).value;
    return (ing.quantiteKg || 0) * (ing.prixUnitaire || 0);
  }

  handleShow() {
    this.showForm = true;
    this.showFormChange.emit(true);
    this.initForm();
    this.modeGestion = 'achat';
    this.form.patchValue({
      date: new Date()
    });
    // Ajouter un ingrédient par défaut en mode achat
    this.ajouterIngredientAchat();
  }

  handleSubmit() {
    if (!this.form.valid) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.processing = true;

    if (this.modeGestion === 'achat') {
      this.submitModeAchat();
    } else {
      this.submitModeFabrication();
    }
  }

  submitModeAchat() {
    const ingredients = this.ingredientsAchatArray.value;
    const date = this.formatDate(this.form.value.date);
    const fournisseurId = this.form.value.fournisseurId || null;

    const requests = ingredients.map((ing: any) => {
      const dto: AlimentationDTO = {
        date: date,
        mode: 'ACHAT',
        fournisseurId: fournisseurId,
        codeAnimal: ing.modeAlimentation === 'individuel' ? ing.codeAnimal : null,
        typeAnimalId: ing.modeAlimentation === 'lot' ? ing.typeAnimalId : null,
        ingredients: [
          {
            ingredientId: ing.ingredientId,
            quantiteKg: ing.quantiteKg,
            prixUnitaire: ing.prixUnitaire
          }
        ]
      };
      return this.service.create(dto);
    });

    this.executeRequests(requests);
  }

  submitModeFabrication() {
    const ingredients = this.ingredientsFabricationArray.value;
    const date = this.formatDate(this.form.value.date);
    const fournisseurId = this.form.value.fournisseurId || null;

    // Vérification du nombre exact d'ingrédients pour FABRICATION
    if (ingredients.length !== 4) {
      alert("Le mode FABRICATION nécessite exactement 4 ingrédients.");
      this.processing = false;
      return;
    }

    // 🔥 RÉCUPÉRATION DU CIBLAGE GLOBAL
    const modeGlobal = this.form.value.modeAlimentationGlobal;
    let codeAnimal = null;
    let typeAnimalId = null;

    if (modeGlobal === 'individuel') {
      const animalId = this.form.value.animalIdGlobal;
      if (!animalId) {
        alert("Veuillez sélectionner un animal pour le mode Individuel");
        this.processing = false;
        return;
      }
      const animal = this.animaux.find(a => a.id === animalId);
      codeAnimal = animal ? animal.codeAnimal : null;
    } else {
      // mode === 'lot'
      typeAnimalId = this.form.value.typeAnimalIdGlobal;
      if (!typeAnimalId) {
        alert("Veuillez sélectionner un type d'animal pour le mode Lot");
        this.processing = false;
        return;
      }
    }

    const dto: AlimentationDTO = {
      date: date,
      mode: 'FABRICATION',
      fournisseurId: fournisseurId,
      codeAnimal: codeAnimal,
      typeAnimalId: typeAnimalId,
      ingredients: ingredients.map((ing: any) => ({
        ingredientId: ing.ingredientId,
        quantiteKg: ing.quantiteKg,
        prixUnitaire: ing.prixUnitaire
      }))
    };

    this.service.create(dto).subscribe({
      next: () => this.afterSubmit(),
      error: (err: any) => {
        console.error(err);
        this.processing = false;
        alert("Erreur lors de l'enregistrement");
      }
    });
  }

  executeRequests(requests: any[]) {
    let completed = 0;
    let hasError = false;

    requests.forEach(req => {
      req.subscribe({
        next: () => {
          completed++;
          if (completed === requests.length) {
            if (hasError) {
              alert('Certains ingrédients n\'ont pas pu être enregistrés');
            }
            this.afterSubmit();
          }
        },
        error: (err: any) => {
          console.error(err);
          hasError = true;
          completed++;
          if (completed === requests.length) {
            this.processing = false;
            alert('Erreur lors de l\'enregistrement');
          }
        }
      });
    });
  }

  private afterSubmit() {
    this.processing = false;
    this.showForm = false;
    this.showFormChange.emit(false);
    this.onUpdate.emit();
  }

  formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get coutTotalAchat(): number {
    return this.ingredientsAchatArray.controls.reduce((total, control) => {
      const ing = control.value;
      return total + ((ing.quantiteKg || 0) * (ing.prixUnitaire || 0));
    }, 0);
  }

  get coutTotalFabrication(): number {
    return this.ingredientsFabricationArray.controls.reduce((total, control) => {
      const ing = control.value;
      return total + ((ing.quantiteKg || 0) * (ing.prixUnitaire || 0));
    }, 0);
  }

  get coutTotal(): number {
    return this.modeGestion === 'achat' ? this.coutTotalAchat : this.coutTotalFabrication;
  }
}