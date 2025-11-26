import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ButtonDirective} from "primeng/button";
import {FlexModule} from "@angular/flex-layout";
import {InputTextModule} from "primeng/inputtext";
import {ConfirmationService, MenuItem, PrimeTemplate} from "primeng/api";
import {TableModule} from "primeng/table";
// import {PvFormComponent} from "./pv-form/pv-form.component";
import {BudgetService} from "../../../../@core/service/budget.service";
import {ProjectService} from "../../../../@core/service/project.service";
import {CommonModule, DecimalPipe, NgForOf, NgIf, registerLocaleData} from "@angular/common";
import fr from '@angular/common/locales/fr'
import {TagModule} from "primeng/tag";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ToastrService} from "ngx-toastr";
import { BudgetFormComponent } from '../project-budget/budget-form/budget-form.component';
import { ProjectIntervenantFormComponent } from "./project-intervenant-form/project-intervenant-form.component";
import { ProjectMembershipService } from '../../../../@core/service/project-membership.service';
import { emptyPage, PageResponse } from '../../../../@core/model/page-response.model';
import { ProjectIntervenantUpdateComponent } from "./project-intervenant-update/project-intervenant-update.component";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import {BreadcrumbModule} from "primeng/breadcrumb";
import {RisqueFormComponent} from "../project-risques/risque-form/risque-form.component";
import { PhaseService } from '../../../../@core/service/phase.service';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectButtonModule } from 'primeng/selectbutton';
import {ChipModule} from "primeng/chip";
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-project-budget',
  standalone: true,
  imports: [
    DialogModule,
    FormsModule,
    NgIf,
    MultiSelectModule,
    ButtonDirective,
    DropdownModule,
    FlexModule,
    InputTextModule,
    PrimeTemplate,
    TableModule,
    TagModule,
    ConfirmDialogModule,
    ProjectIntervenantFormComponent,
    NgForOf,
    BreadcrumbModule,
    ReactiveFormsModule,
    CheckboxModule,
    SelectButtonModule,
    ChipModule,
    AvatarModule,
    CommonModule
  ],
  templateUrl: './project-intervenants.component.html',
  styleUrl: './project-intervenants.component.scss',
  providers: [
    ConfirmationService
  ]
})

export class ProjectIntervenantsComponent implements OnInit{

  @Output()
  onUpdate: EventEmitter<any> = new EventEmitter<any>()
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;
  usersPage: PageResponse = emptyPage();
  showImporterUpdate = false;
  pageSize = 10;
  loading = false;
  user: any;
  currentPageInfo : any;
  member: any;
  project: any;
  roles: any[] = [];
  permissions: any[] = [];
  projectId: string = "";
  id: string = "";
  processing = false;
  projectDetails: any;
  memberDetails: any;
  projectPhases: any[] = [];
  memberForm: FormGroup;
  emptyMessage = "Aucune proposition trouvé!"
  permissionsIntervenant: any[] = [];
  validatorOptions = [
    { label: 'Non', value: false },
    { label: 'Oui', value: true }
  ];
  sendMail = [
    { label: 'Non', value: false },
    { label: 'Oui', value: true }
  ];

  showDetailsDialog = false;
  selectedIntervenant: any = null;

  constructor(
    private ps: ProjectService,
    private psm: ProjectMembershipService,
    private toastr: ToastrService,
    private cs: ConfirmationService,
    private phaseS : PhaseService,
    private fb : FormBuilder
  ) {

    this.memberForm = this.fb.group({
      id: [''],
      lastname: ['', Validators.required],
      firstname: ['', Validators.required],
      role: ['', Validators.required],
      phases: [[]],
      permissionsIntervenant: [[]],
      isValidator: [false],
      sendMail: []
    });
  }


  ngOnInit(): void {
    this.loadRoles();
    this.loadPermissions();

    this.ps.currentProjectId$.subscribe(projectId => {
      this.projectId = projectId;
      if (this.projectId) {
        this.loadProjectPhases();
      }
    });
      this.memberDetails = {
      phases: []
    };

    this.ps.currentProjectDetails$.subscribe({
      next: (projectDetails) => {
        if (projectDetails) {
          this.project = projectDetails;
        }
      },
      error: (err) => {
        this.toastr.error(err.error.message ?? err.message);
      }
    });



    this.loadData();
  }



  loadData() {
    this.loading = true;
    if (!this.project || !this.project.id) {
      return;
    }

    this.psm.getMembersOfProject(this.project.id).subscribe({
      next: (value: any) => {
        if (value) {
          this.user = value;
          this.loading = false
        } else {
        }
      },
      error: (error) => {
        this.toastr.error(error.error.message??error.message);
      }
    });
  }





  getMemberyId(template: any) {
    this.loading = true;
    this.memberDetails = template;
    console.log("Intervenant sélectionné", template);
    this.loadProjectPhases();
    const userPhases = template.phases && template.phases.length > 0
      ? template.phases.map((phase: any) => phase.id)
      : [];

    const userData = {
      lastname: template?.member?.user?.lastname || "",
      firstname: template?.member?.user?.firstname || "",
      role: template?.role || "",
      phases: userPhases,
      permissionsIntervenant:template?.permissions || [],
      isValidator: !!template?.isValidator
    };
      this.memberForm.patchValue(userData);

    this.showImporterUpdate = true;

    this.psm.getMemberById(template.id).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.memberDetails = response.data;
          console.log("Données récupérées:", this.memberDetails);

          this.memberForm.patchValue({
            phases: response.data.phases ? response.data.phases.map((phase: any) => phase.id) : [],
            isValidator: !!response.data.isValidator
          });
        } else {
          console.warn("Réponse API vide ou mal formatée:", response);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error("Erreur API:", error);
        this.toastr.error(error.message || "Erreur lors de la récupération des données");
        this.loading = false;
      }
    });
  }

  loadProjectPhases() {
    if (!this.project || !this.project.id) {
      console.warn("ID du projet manquant");
      return;
    }
      this.ps.getProjectById(this.projectId).subscribe({
      next: (response: any) => {
        if (response && response.data && response.data.phases) {
          this.projectPhases = response.data.phases;
          console.log("Phases du projet:", this.projectPhases);
        } else {
          console.warn("Phases du projet non disponibles:", response);
          this.projectPhases = [];
        }
      },
      error: error => {
        console.error("Erreur lors du chargement des phases:", error);
        this.toastr.error("Impossible de charger les phases du projet");
        this.projectPhases = [];
      }
    });
  }

  loadAllMembers(page = 0, size = 10) {
    this.loading = true;
    this.psm.getAllMembers(page,size).subscribe({
        next: (data: any) => {
          this.usersPage = data
          this.loading = false;
        },
        error: err => {
          this.toastr.error(err.message)
          this.loading = false;
        }
      })
  }

  paginate($event: any) {
    this.currentPageInfo = $event;
    this.pageSize = $event.rows;
    this.loadAllMembers($event.first / $event.rows, this.pageSize);
  }

  handleDelete(template: any) {
    this.cs.confirm({
      header: 'Attention!',
      message: 'Voulez vous vraiment supprimer cet intervenant ?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui je confirme',
      rejectLabel: 'Non',
      defaultFocus: 'reject',
      acceptButtonStyleClass: 'p-button-danger outlined p-button-sm',
      rejectButtonStyleClass: 'p-button-sm mr-2',
      accept: () => {
        this.psm.deleteMembership(template.id).subscribe({
          next: () => {
            this.toastr.success("Intervenant supprimer avec succès !");
            this.loadData();
          },
          error: error => {
            this.toastr.error(error.error.message??error.message);
          }
        })
      },
      reject: () => {}
    })
  }


  submitForm(template: any) {
    this.processing = true;
    console.log('Form Data:', template);
    const data = {
      id: this.memberDetails?.id || "",
    addDate: this.memberDetails?.addDate || undefined,
    isDelete: this.memberDetails?.isDelete || undefined,
    isActif: this.memberDetails?.isActif || undefined,
    isValidator: template.isValidator,
    sendMail: template.sendMail,
    teamId: this.memberDetails?.teamId || undefined,
    role: template.role,
    projectId: this.memberDetails?.projectId || "",
    phases: template.phases || [],
    permissions: template.permissionsIntervenant || [],
    memberCuid: this.memberDetails?.memberCuid || undefined
    };
     console.log("data",data )
    this.psm.updateMembership(this.memberDetails?.id, data).subscribe({
      next: (response: any) => {
        if (response.successful !== undefined && !response.successful) {
          this.toastr.error(response.message || "Échec de la mise à jour de l'adhésion.");
        } else {
          this.handleOk(response);
          this.showImporterUpdate = false;
        }
        this.processing = false;
      },
      error: (error) => {

        this.toastr.error(error.message || "Une erreur s'est produite lors de la mise à jour.");
        this.processing = false;
      },
    });
  }

  private handleOk(value: any) {
    this.processing = false;
    this.showImporterUpdate = false;
    this.toastr.success("Utilisateur ajouté avec succès !");
    this.onUpdate.emit(value);
  }

  loadRoles() {
    this.psm.getAllRoles().subscribe({
      next: (data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          this.roles = data;
        } else {
          this.toastr.error("Les données des rôles sont mal formatées.");
        }
      },
      error: error => {
        this.toastr.error(error.error?.message ?? error.message);
      }
    });
  }

  loadProjectDataTest() {
    this.phaseS.getById(this.projectId).subscribe({
      next: (data: any) => {
        this.projectDetails = data.data;
        this.ps.currentProjectDetails$.next(this.projectDetails);
      },
      error: error => {
        console.log("oups...! une erreur est survenue")
        this.toastr.error(error.error.message??error.message);
      }
    })
  }

  loadProjectData() {
    console.log("Envoi de la requête pour récupérer le projet avec l'ID :", this.projectId);

    this.ps.getProjectById(this.projectId).subscribe({
      next: (data: any) => {
        console.log("Réponse reçue :", data);
        this.projectDetails = data.data;
        this.ps.currentProjectDetails$.next(this.projectDetails);
      },
      error: error => {
        console.log("oups...! une erreur est survenue :", error);
        this.toastr.error(error.error.message ?? error.message);
      }
    });
  }

  loadPermissions() {
    this.psm.getAllPermissions().subscribe({
      next: (data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          this.permissions = data;
          console.log ("Permissions",data )
        } else {
          this.toastr.error("Les données des rôles sont mal formatées.");
        }
      },
      error: error => {
        this.toastr.error(error.error?.message ?? error.message);
      }
    });
  }

  showIntervenantDetails(intervenant: any) {
    this.selectedIntervenant = intervenant;
    this.showDetailsDialog = true;
  }
}
