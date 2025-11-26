import { Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RisqueService } from '../../../../../@core/service/risque.service';
import { CategorieRisquesService } from '../../../../../@core/service/categorie-risques.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonDirective } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DropdownModule } from 'primeng/dropdown';
import { DatePipe, NgIf } from '@angular/common';
import { BadgeModule } from 'primeng/badge';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { CalendarModule } from 'primeng/calendar';
import { Impact, Probability, RiskStatus, RiskType } from '../../../../../@core/model/enum';
import { ProjectService } from '../../../../../@core/service/project.service';
import {InputTextareaModule} from "primeng/inputtextarea";

@Component({
  selector: 'app-risque-form',
  standalone: true,
  imports: [
    DialogModule,
    ButtonDirective,
    ReactiveFormsModule,
    InputTextModule,
    SelectButtonModule,
    DropdownModule,
    NgIf,
    BadgeModule,
    CalendarModule,
    DropdownModule,
    InputTextareaModule
  ],
  templateUrl: './risque-form.component.html',
  styleUrls: ['./risque-form.component.scss']
})
export class RisqueFormComponent implements OnInit, OnChanges {

  // Définition des options de risques



  impact = [
    { label: 'ÉLEVÉ', value: Impact.HIGH },
    { label: 'MOYEN', value: Impact.MEDIUM },
    { label: 'FAIBLE', value: Impact.LOW }
  ];

  status = [
    { label: 'IDENTIFIÉ', value: RiskStatus.IDENTIFIED },
    { label: 'ATTÉNUÉ', value: RiskStatus.MITIGATED },
    { label: 'NON RÉSOLU', value: RiskStatus.UNRESOLVED }
  ];

  @Input() target: any;
  @Input() mode: 'edit' | 'create' = 'create';
  @Input() showForm = false;

  @Output() onDone: EventEmitter<any> = new EventEmitter();

  processing = false;
  loading = false;
  projectId: string = "";
  riskCategories: any[] = [];

  risqueForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private risqueService: RisqueService,
    private projectService: ProjectService,
    private categorieRisquesService: CategorieRisquesService
  ) {
    this.risqueForm = this.fb.group({
      name: ['', [Validators.required]],
      impact: [null, [Validators.required]],
      status: [null, [Validators.required]],
      description: ['', []],
      mitigationPlan: ['', []],
      riskTypeId: [null, [Validators.required]]
    });
  }

  ngOnInit() {
    this.getAllRiskCategories();
    this.projectService.currentProjectId$.subscribe(projectId => {
      console.log("ID du projet récupéré...:", projectId);
      this.projectId = projectId;
    });

    if (this.target) {
      this.mode = 'edit';
      this.populateForm();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['target'] && this.target) {
      this.populateForm();
    }
  }

  getAllRiskCategories() {
    this.loading = true;
    this.categorieRisquesService.getAll().subscribe({
      next: (data: any) => {
        this.riskCategories = data.data.map((item: any) => ({
          label: item.name,
          value: item.id
        }));
        console.log('Catégories de risques récupérées:', this.riskCategories);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des catégories de risques:', err);
        this.loading = false;
      }
    });
  }

  private populateForm() {
    this.risqueForm.patchValue({
      name: this.target?.name || '',
      impact: this.target?.impact || null,
      status: this.target?.status || null,
      description: this.target?.description || '',
      mitigationPlan: this.target?.mitigationPlan || '',
      riskTypeId: this.target?.riskCategoryId || null
    });
  }

  handleSaveRisque() {
    if (this.risqueForm.valid && this.projectId) {
      this.processing = true;
      const formData = { ...this.risqueForm.value, projectId: this.projectId};
      if (this.target) {
        this.risqueService.updateProjectRisk(this.target.id, formData).subscribe({
          next: (response) => this.handleSuccess(response),
          error: (err) => this.handleError(err)
        });
      } else {
        this.risqueService.addRisk(formData).subscribe({
          next: (response) => {
            this.handleSuccess(response)
            this.risqueForm.reset();
          },
          error: (err) => this.handleError(err)
        });
      }
    } else {
      this.toastr.error('Veuillez remplir tous les champs correctement et vérifier le projectId.');
    }
  }

  handleSuccess(response: any) {
    this.processing = false;
    this.showForm = false;
    // this.risqueForm.reset();
    this.toastr.success(this.target ? 'Risque modifié avec succès!' : 'Risque créé avec succès!');
    this.onDone.emit(response);
  }

  handleError(err: any) {
    this.processing = false;
    this.toastr.error(err?.message ?? 'Une erreur est survenue.');
  }

  handleShowForm() {
    console.log('Affichage du formulaire');
    this.showForm = true;
  }
}
