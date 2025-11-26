import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ButtonDirective} from "primeng/button";
import {SidebarModule} from "primeng/sidebar";
import {AppService} from "../../../@core/service/app.service";
import {FlexModule} from "@angular/flex-layout";
import {InputTextModule} from "primeng/inputtext";
import {CalendarModule} from "primeng/calendar";
import {StepperModule} from "primeng/stepper";
import {DropdownModule} from "primeng/dropdown";
import { AbstractControl, FormGroup } from '@angular/forms';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {UserService} from "../../../@core/service/user.service";
import {DepartmentService} from "../../../@core/service/department.service";
import {DirectionService} from "../../../@core/service/direction.service";
import {ChipModule} from "primeng/chip";
import { ProjectService } from '../../../@core/service/project.service';
import {NgIf} from "@angular/common";
import { faUser } from '@fortawesome/free-regular-svg-icons';
import { CommonModule } from '@angular/common';
import {InputTextareaModule} from "primeng/inputtextarea";
import {ToastrService} from "ngx-toastr";
import {TemplateService} from "../../../@core/service/template.service";
import {faBuilding} from "@fortawesome/free-solid-svg-icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import {HasPermissionDirective} from "../../../@core/security/directives/has-permission.directive";
import { ProjectTypeService } from '../../../@core/service/project-type.service';
import { StrategicCriterionService } from '../../../@core/service/strategic-criterion.service';
import { ProjectRoadmapService } from '../../../@core/service/project-roadmap.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { PrimeNGConfig } from 'primeng/api';
@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
MultiSelectModule,
    ButtonDirective,
    SidebarModule,
    FlexModule,
    InputTextModule,
    CalendarModule,
    StepperModule,
    DropdownModule,
    FormsModule,
    ChipModule,
    CommonModule,
    NgIf,
    ReactiveFormsModule,
    InputTextareaModule,
    FaIconComponent,
    BadgeModule,
    DialogModule,
    FaIconComponent,
    HasPermissionDirective
  ],
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.scss'
})




// export class ProjectFormComponent implements OnInit {

//   @Input() target: any

//   steps: string[] = ["project-init",'additional-infos'];
//   showForm = false;
//   projectName = "";
//   step = 'project-init';
//   progress = 0;
//   priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
//   directions: any[] = [];
//   departments: any[] = [];
//   checkResult: any;
//   processing = false;
//   selectedTemplate: any;
//   loading = false;
//   users: any[] = [];
//   projectTypes: any[] = [];
//   projectRoadmaps:any[]=[];
//   strategicCriterions:any[] =[];
//   filteredUsers: any[] = []; 
//   predefinedBudgets: number[] = [
//     1000000,    
//     5000000,    
//     10000000,   
//     25000000,   
//     50000000,   
//     100000000,  
//     500000000,  
//     1000000000  
//   ];
//   projectNameError: string = '';

//   @Output()
//   onDone: EventEmitter<any> = new EventEmitter();
//   protected readonly faUser = faUser;


//   projectDetailsForm = this.fb.group<any>({
//    // beneficiary: ["", [Validators.required]], 
//    beneficiaryDirectionIds: [[] as string[], [Validators.required]], 
//     // beneficiaryDirectionId: [null, [Validators.required]],
//     plannedEndDate: [null, [Validators.required]],
//     surveyPlannedEndDate: [null, [Validators.required]],
//     startDate: [new Date(), [Validators.required]],
//     year: (new Date()).getFullYear(),
//   });

//   projectAdditionalInfoForm = this.fb.group({
//     directionId: [null, [Validators.required]],
//     departmentId: [null, [Validators.required]],
//     phasingTemplateId: [null, [Validators.required]],
//     budgetGlobal: [null as null | number],
//     cuidChefProjet: [null],
//     description: '',
//     projectTypeId: [null],
//     projectRoadmapId:[null],
//     strategicCriterionId:[null],
//     cuidResponsableEtude: [null, [Validators.required]],
//   });

//   templates: any[] = [];

//   constructor(
//     private appService: AppService,
//     private us: UserService,
//     private usersService: UserService,
//     private departmentService: DepartmentService,
//     private directionService: DirectionService,
//     private ps: ProjectService,
//     private fb: FormBuilder,
//     private projectTypeService: ProjectTypeService,
//     private projectRoadmapService: ProjectRoadmapService,
//     private strategicCriterionService: StrategicCriterionService,
//     private toastr: ToastrService,
//     private templateService: TemplateService,
//   ) { }

//   ngOnInit(): void {
//     this.loadData();
//     this.loadShamsyUsers(); 
//   }
  
//   // users Shamsy
//   private loadShamsyUsers() {
//     this.usersService.getUsers().subscribe({
//       next: (response: any) => {
//         // Filtrer ShamsyU
//         this.users = response.content
//           .filter((shamsyUser: any) => shamsyUser.user)
//           .map((shamsyUser: any) => ({
//             cuid: shamsyUser.user.cuid,
//             displayName: shamsyUser.user.displayName || `${shamsyUser.user.firstname} ${shamsyUser.user.lastname}`,
//             firstname: shamsyUser.user.firstname,
//             lastname: shamsyUser.user.lastname,
//             email: shamsyUser.user.email
//           }));
        
//         this.filteredUsers = [...this.users];
//         console.log('Utilisateurs Shamsy chargés:', this.users);
//       },
//       error: (err) => {
//         console.error('Erreur chargement utilisateurs Shamsy', err);
//       }
//     });
//   }

//   handleNext() {

//     if (this.step === 'project-init') {
//       if (!this.projectName || this.projectName.trim().length < 3) {
//         this.projectNameError = 'Le nom du projet est obligatoire';
//         this.toastr.error('Le nom du projet est obligatoire');
//         return;
//       }
//       const beneficiaryDirectionIds = this.projectDetailsForm.get('beneficiaryDirectionIds')?.value as string[];
//       if (!beneficiaryDirectionIds || beneficiaryDirectionIds.length === 0) {
//         this.toastr.error('Au moins une direction bénéficiaire est obligatoire');
//         return;
//       }
      
//       if (!this.projectDetailsForm.get('beneficiaryDirectionId')?.value) {
//         this.toastr.error('Le bénéficiaire est obligatoire');
//         return;
//       }
//     }
    
//     if (this.progress < this.steps.length - 1) {
//       this.progress++;
//       this.step = this.steps[this.progress];
//     } else {
//       this.submitForm();
//     }
//   }

//   // si montant select
//   isBudgetSelected(amount: number): boolean {
//     const currentValue = this.projectAdditionalInfoForm.get('budgetGlobal')?.value;
//     return currentValue !== null && currentValue === amount;
//   }

//   selectPredefinedBudget(amount: number): void {
//     this.projectAdditionalInfoForm.get('budgetGlobal')?.setValue(amount);
//   }
  
//   // affichage
//   formatBudget(amount: number): string {
//     return new Intl.NumberFormat('fr-FR', { 
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(amount) + ' F';
//   }
  
//   handleBack() {
//     this.progress--;
//     this.step = this.steps[this.progress];
//   }

//   private loadData() {
//     this.directionService.getAll().subscribe({
//       next: (data: any) => {
//         this.directions = data.data?.content;
//       }
//     });

//     this.departmentService.getAll().subscribe({
//       next: (data: any) => {
//         this.departments = data.data?.content;
//       }
//     });

//     this.templateService.getAll().subscribe({
//       next: (data: any) => {
//         // this.templates = [{name: 'FREE STYLE', id: 'FREE-STYLE'}, ...data];
//       }
//     });

//     // Charge types de roadmap
//     this.projectTypeService.getAll().subscribe({
//       next: (response: any) => {
//         if (response.data?.content) {
//           this.projectTypes = response.data.content;
//         } else if (Array.isArray(response)) {
//           this.projectTypes = response;
//         } else {
//           this.projectTypes = response.data || response;
//         }
//       },
//       error: (err:any) => {
//         console.error('Erreur chargement types de roadmap', err);
//       }
//     });

//     // Charge types de projets
//     this.projectRoadmapService.getAll().subscribe({
//       next: (response: any) => {
//         if (response.data?.content) {
//           this.projectRoadmaps= response.data.content;
//         } else if (Array.isArray(response)) {
//           this.projectRoadmaps = response;
//         } else {
//           this.projectRoadmaps = response.data || response;
//         }
//       },
//       error: (err:any) => {
//         console.error('Erreur chargement types de projets', err);
//       }
//     });
// //CRITER STRATEGIQUE
//     this.strategicCriterionService.getAll().subscribe({
//       next: (response: any) => {
//         if (response.data?.content) {
//           this.strategicCriterions = response.data.content;
//         } else if (Array.isArray(response)) {
//           this.strategicCriterions = response;
//         } else {
//           this.strategicCriterions = response.data || response;
//         }
//       },
//       error: (err:any) => {
//         console.error('Erreur chargement des critères stratégiques', err);
//       }
//     });
//   }

//   handleProjectName($event: any) {
//     const value = $event.target.value;
//     this.projectName = value;
    
//     if (value.trim().length < 3) {
//       this.projectNameError = 'Le nom du projet doit contenir au moins 3 caractères';
//     } else {
//       this.projectNameError = '';
//       this.ps.checkProjectName(value).subscribe({
//         next: value => {
//           this.checkResult = value;
//         }
//       });
//     }
//   }

//   private submitForm() {
//     if (!this.projectName || this.projectName.trim().length < 2) {
//       this.toastr.error('Le nom du projet est obligatoire');
//       return;
//     }
//     if (!this.projectDetailsForm.get('beneficiaryDirectionId')?.value) {
//       this.toastr.error('La direction bénéficiaire est obligatoire');
//       return;
//     }

//     const beneficiaryDirectionIds = this.projectDetailsForm.get('beneficiaryDirectionIds')?.value as string[];
//     if (!beneficiaryDirectionIds || beneficiaryDirectionIds.length === 0) {
//       this.toastr.error('Au moins une direction bénéficiaire est obligatoire');
//       return;
//     }

//     const beneficiaryDirections = beneficiaryDirectionIds.map((id: string) => {
//       const direction = this.directions.find(d => d.id === id);
//       return direction ? direction.name : '';
//     }).filter(Boolean); 

//     const beneficiaryDirectionId = this.projectDetailsForm.get('beneficiaryDirectionId')?.value;
//     const beneficiaryDirection = this.directions.find(d => d.id === beneficiaryDirectionId);
    
//     // if (!this.projectDetailsForm.get('beneficiary')?.value) {
//     //   this.toastr.error('Le bénéficiaire est obligatoire');
//     //   return;
//     // }
    
//     const project = {
//       ...this.projectDetailsForm.value,
//       ...this.projectAdditionalInfoForm.value,
//       priority: this.priority,
//       projectId: this.checkResult.uniqFinalCode,
//       name: this.projectName.toUpperCase(),
//       beneficiary: beneficiaryDirections.join(', ') 
//       // beneficiary: beneficiaryDirection ? beneficiaryDirection.name : '',

//     } as any;

//     this.processing = true;
//     this.ps.createProject(project).subscribe({
//       next: (value: any) => {
//         if (value.successful){
//           this.showForm = false;
//           this.toastr.success(`Votre projet ${this.projectName} a été créé avec succès !`);
//           this.onDone.emit(value);
//         } else {
//           this.toastr.error(value.message);
//         }
//         this.processing = false;
//       },
//       error: err => {
//         this.toastr.error(err.message);
//         this.processing = false;
//       }
//     });
//   }

//   handleTemplateChange($event: any) {
//     this.selectedTemplate = this.templates.find(item => item.id === $event.value);
//   }

// handleFilter(event: any) {
//   const searchValue = event.target.value.toLowerCase();
//   this.filteredUsers = this.users.filter(user => 
//     user.displayName?.toLowerCase().includes(searchValue) || 
//     user.cuid?.toLowerCase().includes(searchValue) ||
//     user.firstname?.toLowerCase().includes(searchValue) ||
//     user.lastname?.toLowerCase().includes(searchValue) ||
//     user.email?.toLowerCase().includes(searchValue)
//   );
// }
  
//   handleProjectTypeChange($event: any) {
//     console.log('Type de projet sélectionné:', $event.value);
//     this.projectAdditionalInfoForm.patchValue({
//       projectTypeId: $event.value
//     });
//   }
//   getDirectionName(directionId: string): string {
//     const direction = this.directions.find(d => d.id === directionId);
//     return direction ? direction.name : '';
//   }

//   handleProjectRoadmapChange($event: any) {
//     console.log('Type de projet sélectionné:', $event.value);
//     this.projectAdditionalInfoForm.patchValue({
//       projectRoadmapId: $event.value
//     });
//   }

//   handleStrategicCriterionChange($event: any) {
//     console.log('Critère stratégique sélectionné:', $event.value);
//     this.projectAdditionalInfoForm.patchValue({
//       strategicCriterionId: $event.value
//     });
// }
  
//   private searchUser(query: string) {
//     this.loading = true;
//     this.usersService.searchUserFromLdap(query).subscribe({
//       next: (data: any) => {
//         this.users = data;
//         this.loading = false;

//         if (this.target != undefined && this.target.manager != undefined) {
//           this.users.push(this.target.manager.user);
//         }
//       }
//     });
//   }

//   protected readonly faBuilding = faBuilding;
// }

export class ProjectFormComponent implements OnInit {

  @Input() target: any

  steps: string[] = ["project-init",'additional-infos'];
  showForm = false;
  projectName = "";
  step = 'project-init';
  progress = 0;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  directions: any[] = [];
  departments: any[] = [];
  checkResult: any;
  processing = false;
  selectedTemplate: any;
  loading = false;
  users: any[] = [];
  projectTypes: any[] = [];
  projectRoadmaps:any[]=[];
  strategicCriterions:any[] =[];
  filteredUsers: any[] = []; 
  predefinedBudgets: number[] = [
    1000000,    
    5000000,    
    10000000,   
    25000000,   
    50000000,   
    100000000,  
    500000000,  
    1000000000  
  ];
  projectNameError: string = '';

  @Output()
  onDone: EventEmitter<any> = new EventEmitter();
  protected readonly faUser = faUser;


  projectDetailsForm = this.fb.group<any>({
    // beneficiary: ["", [Validators.required]], 
    beneficiaryDirectionId: [null], 
    beneficiaryDirectionIds: [[], [Validators.required]], 
    plannedEndDate: [null, [Validators.required]],
    surveyPlannedEndDate: [null, [Validators.required]],
    startDate: [new Date(), [Validators.required]],
    year: (new Date()).getFullYear(),
  });

  projectAdditionalInfoForm = this.fb.group({
    directionId: [null, [Validators.required]],
    departmentId: [null, [Validators.required]],
    phasingTemplateId: [null, [Validators.required]],
    budgetGlobal: [null as null | number],
    cuidChefProjet: [null],
    description: '',
    projectTypeId: [null],
    projectRoadmapId:[null],
    strategicCriterionId:[null],
    cuidResponsableEtude: [null, [Validators.required]],
  });

  templates: any[] = [];

  constructor(
    private appService: AppService,
    private us: UserService,
    private usersService: UserService,
    private departmentService: DepartmentService,
    private directionService: DirectionService,
    private ps: ProjectService,
    private fb: FormBuilder,
    private projectTypeService: ProjectTypeService,
    private projectRoadmapService: ProjectRoadmapService,
    private strategicCriterionService: StrategicCriterionService,
    private toastr: ToastrService,
    private templateService: TemplateService,
    private primengConfig: PrimeNGConfig, 
  ) { }

  // ngOnInit(): void {
  //   this.loadData();
  //   this.loadShamsyUsers(); 
  // }
  ngOnInit(): void {
  this.loadData();
  this.loadShamsyUsers();
  
  // AJOUT - Configuration PrimeNG en français
  this.primengConfig.setTranslation({
    dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    dayNamesShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    dayNamesMin: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'],
    monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    monthNamesShort: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    today: 'Aujourd\'hui',
    clear: 'Effacer',
    weekHeader: 'Sem'
  });
}
  
  // users Shamsy
  private loadShamsyUsers() {
    this.usersService.getUsers().subscribe({
      next: (response: any) => {
        // Filtrer ShamsyU
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
        console.log('Utilisateurs Shamsy chargés:', this.users);
      },
      error: (err) => {
        console.error('Erreur chargement utilisateurs Shamsy', err);
      }
    });
  }

  handleNext() {
    if (this.step === 'project-init') {
      if (!this.projectName || this.projectName.trim().length < 3) {
        this.projectNameError = 'Le nom du projet est obligatoire';
        this.toastr.error('Le nom du projet est obligatoire');
        return;
      }
      
      const beneficiaryDirectionIds = this.projectDetailsForm.get('beneficiaryDirectionIds')?.value as string[];
      if (!beneficiaryDirectionIds || beneficiaryDirectionIds.length === 0) {
        this.toastr.error('Au moins une direction bénéficiaire est obligatoire');
        return;
      }
      
    }
    
    if (this.progress < this.steps.length - 1) {
      this.progress++;
      this.step = this.steps[this.progress];
    } else {
      this.submitForm();
    }
  }

  // si montant select
  isBudgetSelected(amount: number): boolean {
    const currentValue = this.projectAdditionalInfoForm.get('budgetGlobal')?.value;
    return currentValue !== null && currentValue === amount;
  }

  selectPredefinedBudget(amount: number): void {
    this.projectAdditionalInfoForm.get('budgetGlobal')?.setValue(amount);
  }
  
  // affichage
  formatBudget(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' F';
  }
  
  // handleBack() {
  //   this.progress--;
  //   this.step = this.steps[this.progress];
  // }

  handleBack() {
    this.progress--;
    this.step = this.steps[this.progress];
    
    if (this.projectDetailsForm && this.projectDetailsForm.get('startDate')?.value) {
      setTimeout(() => {
        this.projectDetailsForm.updateValueAndValidity();
      }, 100);
    }
  }

  
  

  // private loadData() {
  //   this.directionService.getAll().subscribe({
  //     next: (data: any) => {
  //       this.directions = data.data?.content;
  //     }
  //   });

  //   this.departmentService.getAll().subscribe({
  //     next: (data: any) => {
  //       this.departments = data.data?.content;
  //     }
  //   });

  //   this.templateService.getAll().subscribe({
  //     next: (data: any) => {
  //        this.templates = [{name: 'FREE STYLE', id: 'FREE-STYLE'}, ...data];
  //     }
  //   });

  //   // Charge types de roadmap
  //   this.projectTypeService.getAll().subscribe({
  //     next: (response: any) => {
  //       if (response.data?.content) {
  //         this.projectTypes = response.data.content;
  //       } else if (Array.isArray(response)) {
  //         this.projectTypes = response;
  //       } else {
  //         this.projectTypes = response.data || response;
  //       }
  //     },
  //     error: (err:any) => {
  //       console.error('Erreur chargement types de roadmap', err);
  //     }
  //   });

  //   // Charge types de projets
  //   this.projectRoadmapService.getAll().subscribe({
  //     next: (response: any) => {
  //       if (response.data?.content) {
  //         this.projectRoadmaps= response.data.content;
  //       } else if (Array.isArray(response)) {
  //         this.projectRoadmaps = response;
  //       } else {
  //         this.projectRoadmaps = response.data || response;
  //       }
  //     },
  //     error: (err:any) => {
  //       console.error('Erreur chargement types de projets', err);
  //     }
  //   });
  //   //CRITER STRATEGIQUE
  //   this.strategicCriterionService.getAll().subscribe({
  //     next: (response: any) => {
  //       if (response.data?.content) {
  //         this.strategicCriterions = response.data.content;
  //       } else if (Array.isArray(response)) {
  //         this.strategicCriterions = response;
  //       } else {
  //         this.strategicCriterions = response.data || response;
  //       }
  //     },
  //     error: (err:any) => {
  //       console.error('Erreur chargement des critères stratégiques', err);
  //     }
  //   });
  // }


  private loadData() {
    this.directionService.getAll().subscribe({
      next: (data: any) => {
        this.directions = data.data?.content;
      }
    });
  
    this.departmentService.getAll().subscribe({
      next: (data: any) => {
        this.departments = data.data?.content;
      }
    });
  
    this.templateService.getAll().subscribe({
      next: (data: any) => {
        const freeStyleExists = Array.isArray(data) && data.some(item => 
          item.id === 'FREE-STYLE' || item.name === 'FREE STYLE'
        );
        
        if (!freeStyleExists) {
          this.templates = [{name: 'FREE STYLE', id: 'FREE-STYLE'}, ...data];
        } else {
          this.templates = [...data];
        }
      }
    });
  
    // Charge types de roadmap
    this.projectTypeService.getAll().subscribe({
      next: (response: any) => {
        if (response.data?.content) {
          this.projectTypes = response.data.content;
        } else if (Array.isArray(response)) {
          this.projectTypes = response;
        } else {
          this.projectTypes = response.data || response;
        }
      },
      error: (err:any) => {
        console.error('Erreur chargement types de roadmap', err);
      }
    });

  // Charge types de projets
  this.projectRoadmapService.getAll().subscribe({
    next: (response: any) => {
      if (response.data?.content) {
        this.projectRoadmaps= response.data.content;
      } else if (Array.isArray(response)) {
        this.projectRoadmaps = response;
      } else {
        this.projectRoadmaps = response.data || response;
      }
    },
    error: (err:any) => {
      console.error('Erreur chargement types de projets', err);
    }
  });
  //CRITER STRATEGIQUE
  this.strategicCriterionService.getAll().subscribe({
    next: (response: any) => {
      if (response.data?.content) {
        this.strategicCriterions = response.data.content;
      } else if (Array.isArray(response)) {
        this.strategicCriterions = response;
      } else {
        this.strategicCriterions = response.data || response;
      }
    },
    error: (err:any) => {
      console.error('Erreur chargement des critères stratégiques', err);
    }
  });
  }

  handleProjectName($event: any) {
    const value = $event.target.value;
    this.projectName = value;
    
    if (value.trim().length < 3) {
      this.projectNameError = 'Le nom du projet doit contenir au moins 3 caractères';
    } else {
      this.projectNameError = '';
      this.ps.checkProjectName(value).subscribe({
        next: value => {
          this.checkResult = value;
        }
      });
    }
  }
  handleBeneficiaryDirectionsChange(selectedDirectionIds: string[]) {
    this.projectDetailsForm.get('beneficiaryDirectionIds')?.setValue(selectedDirectionIds);
    
    
  }

  private submitForm() {
    if (!this.projectName || this.projectName.trim().length < 2) {
      this.toastr.error('Le nom du projet est obligatoire');
      return;
    }

    const beneficiaryDirectionIds = this.projectDetailsForm.get('beneficiaryDirectionIds')?.value as string[];
    if (!beneficiaryDirectionIds || beneficiaryDirectionIds.length === 0) {
      this.toastr.error('Au moins une direction bénéficiaire est obligatoire');
      return;
    }

    const beneficiaryDirections = beneficiaryDirectionIds.map((id: string) => {
      const direction = this.directions.find(d => d.id === id);
      return direction ? direction.name : '';
    }).filter(Boolean); 

    
    
    const project = {
      ...this.projectDetailsForm.value,
      ...this.projectAdditionalInfoForm.value,
      priority: this.priority,
      projectId: this.checkResult.uniqFinalCode,
      name: this.projectName.toUpperCase(),
      beneficiary: beneficiaryDirections.join(', '),
      beneficiaryDirectionIds: beneficiaryDirectionIds
    } as any;

    this.processing = true;
    this.ps.createProject(project).subscribe({
      next: (value: any) => {
        if (value.successful){
          this.showForm = false;
          this.toastr.success(`Votre projet ${this.projectName} a été créé avec succès !`);
          this.onDone.emit(value);
        } else {
          this.toastr.error(value.message);
        }
        this.processing = false;
      },
      error: err => {
        this.toastr.error(err.message);
        this.processing = false;
      }
    });
  }

  handleTemplateChange($event: any) {
    this.selectedTemplate = this.templates.find(item => item.id === $event.value);
  }

  handleFilter(event: any) {
    const searchValue = event.target.value.toLowerCase();
    this.filteredUsers = this.users.filter(user => 
      user.displayName?.toLowerCase().includes(searchValue) || 
      user.cuid?.toLowerCase().includes(searchValue) ||
      user.firstname?.toLowerCase().includes(searchValue) ||
      user.lastname?.toLowerCase().includes(searchValue) ||
      user.email?.toLowerCase().includes(searchValue)
    );
  }
  
  handleProjectTypeChange($event: any) {
    console.log('Type de projet sélectionné:', $event.value);
    this.projectAdditionalInfoForm.patchValue({
      projectTypeId: $event.value
    });
  }
  
  getDirectionName(directionId: string): string {
    const direction = this.directions.find(d => d.id === directionId);
    return direction ? direction.name : '';
  }

  handleProjectRoadmapChange($event: any) {
    console.log('Type de roadmap sélectionné:', $event.value);
    this.projectAdditionalInfoForm.patchValue({
      projectRoadmapId: $event.value
    });
  }

  handleStrategicCriterionChange($event: any) {
    console.log('Critère stratégique sélectionné:', $event.value);
    this.projectAdditionalInfoForm.patchValue({
      strategicCriterionId: $event.value
    });
  }
  
  private searchUser(query: string) {
    this.loading = true;
    this.usersService.searchUserFromLdap(query).subscribe({
      next: (data: any) => {
        this.users = data;
        this.loading = false;

        if (this.target != undefined && this.target.manager != undefined) {
          this.users.push(this.target.manager.user);
        }
      }
    });
  }

  protected readonly faBuilding = faBuilding;
}






























