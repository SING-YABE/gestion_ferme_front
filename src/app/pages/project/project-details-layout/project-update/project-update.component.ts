
import { DatePipe, DecimalPipe, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { FormGroup, FormControl, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PrimeTemplate } from 'primeng/api';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ConfirmationService } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { BudgetService } from '../../../../@core/service/budget.service';
import { ProjectService } from '../../../../@core/service/project.service';
import { BudgetFormComponent } from '../project-budget/budget-form/budget-form.component';
import { DialogModule } from 'primeng/dialog';
import { BadgeModule } from 'primeng/badge';
import { DropdownModule } from 'primeng/dropdown';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CalendarModule } from 'primeng/calendar';
import { UserService } from '../../../../@core/service/user.service';
import { DepartmentService } from '../../../../@core/service/department.service';
import { DirectionService } from '../../../../@core/service/direction.service';
import { TemplateService } from '../../../../@core/service/template.service';
import { ProjectTypeService } from '../../../../@core/service/project-type.service';
import { faUser, faBuilding } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ProjectRoadmapService } from '../../../../@core/service/project-roadmap.service';
import { StrategicCriterionService } from '../../../../@core/service/strategic-criterion.service';
@Component({
  selector: 'app-project-update',
  standalone: true,
  imports: [
    CardModule,
    FormsModule,
    MultiSelectModule,
    ButtonDirective,
    FlexModule,
    CommonModule,
    InputTextModule,
    PrimeTemplate,
    CalendarModule,
    TableModule,
    FontAwesomeModule,
    TagModule,
    ConfirmDialogModule,
    ButtonDirective,
    DatePipe,
    DialogModule,
    ReactiveFormsModule,
    InputTextModule,
    SelectButtonModule,
    DropdownModule,
    BadgeModule,
    NgIf
  ],
  templateUrl: './project-update.component.html',
  styleUrl: './project-update.component.scss',
  providers: [
    ConfirmationService,
    DatePipe
  ]
})
export class ProjectUpdateComponent implements OnInit {

  showForm = false;
  processing = false;
  projectDetails: any;
  filteredUsers: any[] = []; 

  @Input() target: any;
  @Input() mode: 'edit' | 'create' = 'create';

  @Output()
  onDone: EventEmitter<any> = new EventEmitter();

  projectId: string = "";
  priorityOptions = [
    { label: 'Faible', value: 'LOW' },
    { label: 'Moyenne', value: 'MEDIUM' },
    { label: 'Haute', value: 'HIGH' }
  ];
  showMotifDialog = false;
motifModification = '';
private motifResolver: ((value: string | null) => void) | null = null;
  originalNegoClosingDate: Date | null = null;
  directions: any[] = [];
  departments: any[] = [];
  templates: any[] = [];
  users: any[] = [];
  projectTypes: any[] = [];
  projectRoadmaps:any[]=[];
  strategicCriterions:any[]=[];
  selectedTemplate: any;
  loading = false;
  projectForm!: FormGroup;
  protected readonly faUser = faUser;
  protected readonly faBuilding = faBuilding;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private ps: ProjectService,
    private datePipe: DatePipe,
    private us: UserService,
    private departmentService: DepartmentService,
    private directionService: DirectionService,
    private templateService: TemplateService,
    private projectTypeService: ProjectTypeService,
    private strategicCriterionService: StrategicCriterionService,
    private projectRoadmapService: ProjectRoadmapService,
    private usersService: UserService,
    private confirmationService: ConfirmationService

  ) {
    this.initForm();
  }

  initForm(): void {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      priority: [null],
      description: [''],
      beneficiary: [''],
      year: [(new Date()).getFullYear()],
      startDate: [null, Validators.required],
      negoClosingDate:[null],
      motif: [''],
      surveyPlannedEndDate: [null, Validators.required],
      plannedEndDate: [null, Validators.required],
      directionId: [null, Validators.required],
      beneficiaryDirectionIds: [[], Validators.required],
      departmentId: [null, Validators.required],
      cuidChefProjet: [null],
      cuidResponsableEtude: [null],
      phasingTemplateId: [null],
      budgetGlobal: [null],
      projectTypeId: [null],
      strategicCriterionId:[null], 
      projectRoadmapId:[null],
      filterValue: [''] ,
    });
  }

  ngOnInit() {
    console.log('Initialisation du composant ProjectUpdate, mode:', this.mode);
    this.loadAllData();

    // Si édition
    if (this.mode === 'edit') {
      // RetirephasingTemplateId
      this.projectForm.get('phasingTemplateId')?.clearValidators();
      this.projectForm.get('phasingTemplateId')?.updateValueAndValidity();
    }
    
    this.ps.currentProjectId$.subscribe(projectId => {
      if (projectId) {
        this.projectId = projectId;
        console.log('ID du projet récupéré:', this.projectId);
        this.loadProjectDetails();
      }
    });

    
  }

  loadAllData() {
    console.log('Chargement de toutes les données...');
    this.loadDirections();
    this.loadDepartments();
    this.loadTemplates();
    this.loadUsers();
    this.loadProjectTypes();
    this.loadProjectRoadmaps();
    this.loadProjectCriterions();
  }

  loadDirections() {
    console.log('Chargement des directions...');
    this.directionService.getAll().subscribe({
      next: (data: any) => {
        this.directions = data.data?.content || [];
        console.log('Directions chargées:', this.directions.length);
      },
      error: (err) => {
        console.error('Erreur chargement directions', err);
      }
    });
  }

  loadDepartments() {
    console.log('Chargement des départements...');
    this.departmentService.getAll().subscribe({
      next: (data: any) => {
        this.departments = data.data?.content || [];
        console.log('Départements chargés:', this.departments.length);
      },
      error: (err) => {
        console.error('Erreur chargement départements', err);
      }
    });
  }

  loadTemplates() {
    console.log('Chargement des templates...');
    this.templateService.getAll().subscribe({
      next: (data: any) => {
        this.templates = [{name: 'FREE STYLE', id: 'FREE-STYLE'}, ...data];
        console.log('Templates chargés:', this.templates.length);
      },
      error: (err) => {
        console.error('Erreur chargement templates', err);
      }
    });
  }

  loadUsers() {
    console.log('Chargement des utilisateurs...');
    this.usersService.getUsers().subscribe({
      next: (response: any) => {
        this.users = response.content
          .filter((shamsyUser: any) => shamsyUser.user)
          .map((shamsyUser: any) => ({
            cuid: shamsyUser.user.cuid,
            displayName: shamsyUser.user.displayName || `${shamsyUser.user.firstname} ${shamsyUser.user.lastname}`,
            firstname: shamsyUser.user.firstname,
            lastname: shamsyUser.user.lastname,
            email: shamsyUser.user.email
          }));
        
        this.filteredUsers = [...this.users]; 
        console.log('Utilisateurs chargés:', this.users.length);
      },
      error: (err) => {
        console.error('Erreur chargement utilisateurs', err);
      }
    });
  }

  loadProjectTypes() {
    console.log('Chargement des types de roadmap...');
    this.projectTypeService.getAll().subscribe({
      next: (response: any) => {
        if (response.data?.content) {
          this.projectTypes = response.data.content;
        } else if (Array.isArray(response)) {
          this.projectTypes = response;
        } else {
          this.projectTypes = response.data || response;
        }
        console.log('Types de roadmap chargés:', this.projectTypes.length);
      },
      error: (err) => {
        console.error('Erreur chargement types de roadmap', err);
      }
    });
  }

  loadProjectRoadmaps() {
    console.log('Chargement des types de projet...');
    this.projectRoadmapService.getAll().subscribe({
      next: (response: any) => {
        if (response.data?.content) {
          this.projectRoadmaps = response.data.content;
        } else if (Array.isArray(response)) {
          this.projectRoadmaps = response;
        } else {
          this.projectRoadmaps = response.data || response;
        }
        console.log('Types de projet chargés:', this.projectTypes.length);
      },
      error: (err) => {
        console.error('Erreur chargement types de projet', err);
      }
    });
  }

  loadProjectCriterions() {
    console.log('Chargement des critères stratégiques...');
    this.strategicCriterionService.getAll().subscribe({
      next: (response: any) => {
        if (response.data?.content) {
          this.strategicCriterions = response.data.content;
        } else if (Array.isArray(response)) {
          this.strategicCriterions = response;
        } else {
          this.strategicCriterions = response.data || response;
        }
        console.log('Critères stratégiques chargés:', this.strategicCriterions.length);
      },
      error: (err) => {
        console.error('Erreur chargement des critères stratégiques', err);
      }
    });
  }
  loadProjectDetails() {
    console.log('Chargement des détails du projet:', this.projectId);
    this.ps.getProjectById(this.projectId).subscribe({
      next: (data: any) => {
        this.projectDetails = data.data;
        console.log('Détails du projet reçus:', this.projectDetails);
        this.ps.currentProjectDetails$.next(this.projectDetails);
        
        // // Charge et preremplir
        // const waitForData = setInterval(() => {
        //   if (this.directions.length > 0 && 
        //       this.departments.length > 0 && 
        //       this.users.length > 0 &&
        //       this.templates.length > 0 &&
        //       this.projectTypes.length > 0) {
        //     clearInterval(waitForData);
        //     this.patchFormWithProjectDetails();
        //   }
        // }, 300);

        const waitForData = setInterval(() => {
          if (this.directions.length > 0 && 
              this.departments.length > 0 && 
              this.users.length > 0 &&
              this.projectTypes.length > 0 &&
              this.templates.length > 0) { 
            clearInterval(waitForData);
            this.patchFormWithProjectDetails();
          }
        }, 300);
      },
      error: error => {
        this.toastr.error(error.error?.message || error.message);
      }
    });
  }



 
  patchFormWithProjectDetails() {
    console.log('projet complets:', JSON.stringify(this.projectDetails));
    
    if (this.projectDetails) {
      console.log('Préremplissage form:', this.projectDetails);
      
      let beneficiaryDirectionIds: string[] = [];
      
      if (this.projectDetails.beneficiaryDirectionIds && Array.isArray(this.projectDetails.beneficiaryDirectionIds)) {
        beneficiaryDirectionIds = [...this.projectDetails.beneficiaryDirectionIds];
      } 
      else if (this.projectDetails.beneficiaryDirectionId) {
        beneficiaryDirectionIds = [this.projectDetails.beneficiaryDirectionId];
      }
      else if (this.projectDetails.beneficiary) {
        const beneficiaryNames = this.projectDetails.beneficiary.split(', ');
        beneficiaryDirectionIds = beneficiaryNames
          .map((name: string) => {
            const direction = this.directions.find(dir => dir.name === name.trim());
            return direction ? direction.id : null;
          })
          .filter((id: string | null) => id !== null) as string[];
      }
      
      let templateIdValue = null;
      
      if (this.projectDetails.phasingTemplateId) {
        templateIdValue = this.projectDetails.phasingTemplateId;
      } else if (this.projectDetails.phasingType) {
        templateIdValue = this.projectDetails.phasingType;
      }

      this.originalNegoClosingDate = this.projectDetails.negoClosingDate ? 
      new Date(this.projectDetails.negoClosingDate[0], this.projectDetails.negoClosingDate[1]-1, this.projectDetails.negoClosingDate[2]) : null;
      
      // Préremplir le formulaire
      this.projectForm.patchValue({
        name: this.projectDetails.name,
        priority: this.projectDetails.priority,
        description: this.projectDetails.description,
        beneficiary: this.projectDetails.beneficiary,
        beneficiaryDirectionIds: beneficiaryDirectionIds,
        year: this.projectDetails.year || (new Date()).getFullYear(),
        startDate: this.projectDetails.startDate ? new Date(this.projectDetails.startDate[0], this.projectDetails.startDate[1]-1, this.projectDetails.startDate[2]) : null,
        negoClosingDate: this.projectDetails.negoClosingDate ? new Date(this.projectDetails.negoClosingDate[0], this.projectDetails.negoClosingDate[1]-1, this.projectDetails.negoClosingDate[2]) : null,
        surveyPlannedEndDate: this.projectDetails.surveyPlannedEndDate ? new Date(this.projectDetails.surveyPlannedEndDate[0], this.projectDetails.surveyPlannedEndDate[1]-1, this.projectDetails.surveyPlannedEndDate[2]) : null,
        plannedEndDate: this.projectDetails.plannedEndDate ? new Date(this.projectDetails.plannedEndDate[0], this.projectDetails.plannedEndDate[1]-1, this.projectDetails.plannedEndDate[2]) : null,
        directionId: this.projectDetails.directionId,
        departmentId: this.projectDetails.departmentId,
        cuidChefProjet: this.projectDetails.cuidChefProjet,
        cuidResponsableEtude: this.projectDetails.cuidResponsableEtude,
        budgetGlobal: this.projectDetails.budgetGlobal,
        projectTypeId: this.projectDetails.projectTypeId,
        projectRoadmapId: this.projectDetails.projectRoadmapId,
        strategicCriterionId: this.projectDetails.strategicCriterionId,
        phasingTemplateId: templateIdValue
      });
      
      console.log('Valeur templ prerempli:', templateIdValue);
      console.log('Directions bénéficiaires préremplies:', beneficiaryDirectionIds);
      console.log('Formulaire projet à envoyer:', this.projectForm.value);

    }
  }

  getPriorityLabel(value: string | undefined): string {
    if (!value) return 'Sélectionnez une priorité';
    const option = this.priorityOptions.find(opt => opt.value === value);
    return option ? option.label : 'Sélectionnez une priorité';
  }

  handleShowForm() {
    console.log('Affichage du formulaire');
    this.showForm = true;
  }


  

  
  // handleSaveBudget() {
  //   if (this.projectForm.valid) {
  //     const phasingTemplateId = this.projectForm.get('phasingTemplateId')?.value;
      
  //     // confirmation MP
  //     if (phasingTemplateId && phasingTemplateId !== 'FREE-STYLE') {
  //       this.confirmationService.confirm({
  //         header: 'Attention - Modification du modèle de phasage',
  //         message: 'La modification du modèle de phasage va écraser les livrables existants et remettre le projet en statut étude. Voulez-vous continuer?',
  //         icon: 'pi pi-exclamation-triangle',
  //         acceptLabel: 'Oui, continuer',

  //         rejectLabel: 'Non, annuler',
  //         accept: () => {
  //           this.saveProjectData();
  //         }
  //       });
  //     } else {
  //       this.saveProjectData();
  //     }
  //   } else {
  //     console.warn('Formulaire invalide:', this.projectForm.errors);
  //     this.toastr.error("Veuillez bien renseigner tous les champs requis");
  //   }
  // }



async handleSaveBudget() {
  if (this.projectForm.valid) {
    const newPhasingTemplateId = this.projectForm.get('phasingTemplateId')?.value;
    const originalPhasingTemplateId = this.projectDetails.phasingTemplateId || this.projectDetails.phasingType;
    
    // SI MO PH A CHANGE
    const phasingTemplateChanged = newPhasingTemplateId !== originalPhasingTemplateId;
    
    
    if (phasingTemplateChanged && newPhasingTemplateId && newPhasingTemplateId !== 'FREE-STYLE') {
      this.confirmationService.confirm({
        header: 'Attention - Modification du modèle de phasage',
        message: 'La modification du modèle de phasage va écraser les livrables existants et remettre le projet en statut étude. Voulez-vous continuer?',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Oui, continuer',
        rejectLabel: 'Non, annuler',
        acceptButtonStyleClass: 'p-button-danger p-mr-2',  
        rejectButtonStyleClass: 'p-button-outlined p-button-secondary p-ml-2',  
        accept: () => {
          this.saveProjectData();
        }
      });
    } else {
      this.saveProjectData();
    }
  } else {
    console.warn('Formulaire invalide:', this.projectForm.errors);
    this.toastr.error("Veuillez bien renseigner tous les champs requis");
  }
}

  // private saveProjectData() {
  //   console.log('Soumis formulaire avec les valeurs:', this.projectForm.value);
  //   this.processing = true;
    
  //   const beneficiaryDirectionId = this.projectForm.get('beneficiaryDirectionId')?.value;
  //   const beneficiaryDirection = this.directions.find(d => d.id === beneficiaryDirectionId);
    
  //   const projet = {
  //     ...this.projectForm.value,
  //     id: this.projectDetails.id,
  //     beneficiary: beneficiaryDirection ? beneficiaryDirection.name : this.projectForm.get('beneficiary')?.value
  //   };
  
  //   this.ps.updateProject(this.projectDetails.id, projet).subscribe({
  //     next: (value: any) => {
  //       console.log('Projet maj:', value);
  //       this.handleOk(value);
  //     },
  //     error: err => {
  //       this.processing = false;
  //       this.toastr.error(err.error?.message || err.message);
  //       console.error('Erreur maj', err);
  //     }
  //   });
  // }



  private async  saveProjectData() {
    console.log('Soumis formulaire avec les valeurs:', this.projectForm.value);
    const motif = await this.checkNegoClosingDateChange();
  if (motif === null && this.hasNegoClosingDateChanged(this.projectForm.get('negoClosingDate')?.value)) {
    return; 
  }
    this.processing = true;
    
    const beneficiaryDirectionIds = this.projectForm.get('beneficiaryDirectionIds')?.value as string[];
    let beneficiary = '';
    
    if (beneficiaryDirectionIds && beneficiaryDirectionIds.length > 0) {
      beneficiary = beneficiaryDirectionIds
        .map((id: string) => {
          const direction = this.directions.find(d => d.id === id);
          return direction ? direction.name : '';
        })
        .filter((name: string) => name !== '')
        .join(', ');
    }
    
    const projet = {
      ...this.projectForm.value,
      id: this.projectDetails.id,
      beneficiary: beneficiary,
      beneficiaryDirectionIds: beneficiaryDirectionIds,
      negoClosingDateChangeReason: motif
      
    };
  
    this.ps.updateProject(this.projectDetails.id, projet).subscribe({
      next: (value: any) => {
        console.log('Projet maj:', value);
        this.handleOk(value);
      },
      error: err => {
        this.processing = false;
        this.toastr.error(err.error?.message || err.message);
        console.error('Erreur maj', err);
      }
    });
  }

  handleTemplateChange($event: any) {
    console.log('Changement de template:', $event.value);
    this.selectedTemplate = this.templates.find(item => item.id === $event.value);
  }

  handleProjectTypeChange($event: any) {
    console.log('Type de roadmap sélectionné:', $event.value);
    this.projectForm.patchValue({
      projectTypeId: $event.value
    });
  }

  handleProjectRoadmapChange($event: any) {
    console.log('Type de projet sélectionné:', $event.value);
    this.projectForm.patchValue({
      projectRoadmapId: $event.value
    });
  }
  handleProjectCriterionChange($event: any) {
    console.log('Critère strategique sélectionné:', $event.value);
    this.projectForm.patchValue({
      strategicCriterionId: $event.value
    });
  }

  getDirectionName(directionId: string): string {
    const direction = this.directions.find(d => d.id === directionId);
    return direction ? direction.name : '';
  }

  handleFilter($event: any) {
    const searchTerm = $event.target.value.toLowerCase();
    
    if (!searchTerm) {
      this.filteredUsers = [...this.users];
      return;
    }
    
    this.filteredUsers = this.users.filter(user => {
      return user.displayName.toLowerCase().includes(searchTerm) || 
             user.cuid.toLowerCase().includes(searchTerm) ||
             (user.email && user.email.toLowerCase().includes(searchTerm));
    });
  }



  private handleOk(value: any) {
    this.processing = false;
    this.showForm = false;
    this.toastr.success("Projet mis à jour !");
    console.log('maj ok');
    this.onDone.emit(value);
    this.loadProjectDetails(); 
  }

private checkNegoClosingDateChange(): Promise<string | null> {
  return new Promise((resolve) => {
    const currentDate = this.projectForm.get('negoClosingDate')?.value;
    
    if (this.hasNegoClosingDateChanged(currentDate)) {
      this.motifModification = '';
      this.showMotifDialog = true;
      this.motifResolver = resolve;
    } else {
      resolve(null);
    }
  });
}

confirmMotifDialog() {
  if (this.motifModification && this.motifModification.trim()) {
    this.showMotifDialog = false;
    if (this.motifResolver) {
      this.motifResolver(this.motifModification.trim());
      this.motifResolver = null;
    }
  }
}

cancelMotifDialog() {
  this.showMotifDialog = false;
  if (this.motifResolver) {
    this.motifResolver(null);
    this.motifResolver = null;
  }
  // date originale
  this.projectForm.get('negoClosingDate')?.setValue(this.originalNegoClosingDate);
}

private hasNegoClosingDateChanged(currentDate: Date | null): boolean {
  if (!this.originalNegoClosingDate && !currentDate) return false;
  if (!this.originalNegoClosingDate || !currentDate) return true;
  return this.originalNegoClosingDate.getTime() !== currentDate.getTime();
}
}
































