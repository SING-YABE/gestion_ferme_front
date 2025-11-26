import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategorieRisquesService } from '../../../../@core/service/categorie-risques.service';  // Le service pour la gestion des catégories de risques
import { ToastrService } from 'ngx-toastr';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';  // Icône de risque
import { ButtonDirective, ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { BadgeModule } from 'primeng/badge';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-categorie-risques-form',
  standalone: true,
  imports: [ButtonModule,
    DialogModule,
        ReactiveFormsModule,
        InputTextModule,
        ButtonDirective,
        DropdownModule,
        BadgeModule,
        FaIconComponent,
        NgIf
  ],
  templateUrl: './categorie-risques-form.component.html',
  styleUrls: ['./categorie-risques-form.component.scss']
})
export class CategorieRisquesFormComponent implements OnInit {

  @Input() target: any;  // La catégorie de risque cible si en mode 'edit'
  @Input() mode: 'edit' | 'create' = 'create';  // Mode de création ou d'édition
  @Output() onUpdate: EventEmitter<any> = new EventEmitter();  // Événement pour notifier le parent
  
  categorieRisquesForm: FormGroup;  // Le formulaire réactif pour la catégorie de risque
  processing = false;  // Indicateur de traitement pour l'envoi des données
  showForm = false;  // Contrôle l'affichage du modal
  faExclamationTriangle = faExclamationTriangle;  // Icône de risque

  constructor(
    private fb: FormBuilder,
    private categorieRisquesService: CategorieRisquesService,
    private toastr: ToastrService
  ) {
    // Initialisation du formulaire avec des valeurs par défaut
    this.categorieRisquesForm = this.fb.group({
      name: ['', [Validators.required]],  // Nom de la catégorie de risque
      description: ['', [Validators.required]],  // Description de la catégorie de risque
    });
  }

  ngOnInit(): void {
    if (this.mode === 'edit' && this.target) {
      // Si nous sommes en mode édition, pré-remplir les données du formulaire
      this.categorieRisquesForm.patchValue({
        name: this.target?.name,
        description: this.target?.description,
      });
    }
  }

  // Fonction de soumission du formulaire
  handleSubmit() {
    if (!this.categorieRisquesForm.valid) return;  // Si le formulaire est invalide, ne pas soumettre

    this.processing = true;  // Indiquer qu'on est en train de traiter la soumission

    const categoryData = {
      name: this.categorieRisquesForm.value.name,
      description: this.categorieRisquesForm.value.description,
    };

    if (this.mode === 'create') {
      // Mode création
      this.categorieRisquesService.createRiskCategory(categoryData).subscribe({
        next: (data) => {
          this.handleResponse(data);
        },
        error: (err) => {
          this.toastr.error(err.message);
          this.processing = false;
        }
      });
    } else {
      // Mode édition
      this.categorieRisquesService.updateRiskCategory({ ...categoryData, id: this.target.id }).subscribe({
        next: (data) => {
          this.handleResponse(data);
        },
        error: (err) => {
          this.toastr.error(err.message);
          this.processing = false;
        }
      });
    }
  }

  // Gérer la réponse de la soumission
  private handleResponse(data: any) {
    if (data.successful) {
      this.toastr.success(data.message);
      this.onUpdate.emit();  // Émettre l'événement pour notifier de la mise à jour
      this.processing = false;
      this.showForm = false;  // Fermer le formulaire/modal après soumission réussie
    } else {
      this.toastr.error(data.message);
      this.processing = false;
    }
  }

  // Fonction pour afficher le modal
  handleShow() {
    this.showForm = true;
  }
}
