import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, NgControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ButtonDirective } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DirectionService } from '../../../../../@core/service/direction.service';
import { UserService } from '../../../../../@core/service/user.service';
import { ProjectService } from '../../../../../@core/service/project.service';
import { ProjectMembershipService } from '../../../../../@core/service/project-membership.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { first, last } from 'rxjs';
import {ActivatedRoute} from "@angular/router";
import { SelectButtonModule } from 'primeng/selectbutton';
import {AvatarModule} from "primeng/avatar";


@Component({
  selector: 'app-project-intervenant-form',
  standalone: true,
  imports: [
    DialogModule,
    InputTextModule,
    TableModule,
    FormsModule,
    NgIf,
    MultiSelectModule,
    ButtonDirective,
    DropdownModule,
    SelectButtonModule,
    ReactiveFormsModule,
    AvatarModule
  ],
  templateUrl: './project-intervenant-form.component.html',
  styleUrl: './project-intervenant-form.component.scss',
  providers: []
})
export class ProjectIntervenantFormComponent implements OnInit {
  validatorOptions = [
    { label: 'Oui', value: true },
    { label: 'Non', value: false }
  ];

  @Output()
  onUpdate: EventEmitter<any> = new EventEmitter<any>()

    @Input() target: any
    @Input() mode: 'edit' | 'create' = 'create';

    showForm = false;
    shamsy: any[] = [];
    roles: any[] = [];
    users: any[] = [];
    permissionsIntervenant: any[] = [];
    usersPage: any[] = [];
    permissions: any[] = [];
    showImporterForm = false;
    showImporterUpdate = false;
    directions: any[] = [];
    departments: any[] = [];
    toImport: any;
    processing = false;
    projectDetails: any;

    loading = false;
    projectId: string = "";
    emptyMessage = "Aucune proposition trouvé!"
    selectedDepartmentId: string | undefined

    intervenantForm: FormGroup = this.fb.group({
      memberEmail: [null, [Validators.required]],
      role: [null, [Validators.required]],
      phases: [null, [Validators.required]],  
      permissionsIntervenant: [null, [Validators.required]],
      sendMail: [],
    })

    sendMail = [
      { label: 'Non', value: false },
      { label: 'Oui', value: true }
    ];

    constructor(
      private userService: UserService,
      private toastr: ToastrService,
      private ds: DirectionService,
      private ps: ProjectService,
      private fb: FormBuilder,
      private psm: ProjectMembershipService,
      private activatedRoute: ActivatedRoute,
    ) {
    }

    ngOnInit(): void {
      this.ps.currentProjectId$.subscribe(projectId => { this.projectId = projectId });
      this.projectDetails = this.loadProjectData()
      this.validatorOptions;
      this.loadAllUsers();
      this.loadRoles();
      this.loadPermissions();
    }

 
    submitForm() {
      this.processing = true;
      console.log("Formulaire :", this.intervenantForm.value); 
    
      const data = {
        isActif: true,
        isDelete: false,
        memberCuid: this.toImport.cuid,
        memberEmail: this.intervenantForm.value.memberEmail,
        role: this.intervenantForm.value.role,
        projectId: this.projectDetails.id,
        phases: this.intervenantForm.value.phases,
        sendMail: this.intervenantForm.value.sendMail,
        permissions: this.intervenantForm.value.permissionsIntervenant,
        addDate: new Date().toISOString().split('T')[0],
      };
    
      this.psm.addUserInProject(data).subscribe({
        next: (response: any) => {
          if (response.successful != undefined && !response.successful) {
            this.toastr.error(response.message);
          } else {
            this.toastr.success("Utilisateur ajouté avec succès !");
            this.toImport = undefined;
            this.showImporterForm = false;
            this.showForm = false;
            this.intervenantForm.reset();
            this.onUpdate.emit(response);
          }
          this.processing = false;
        },
        error: err => {
          this.toastr.error(err.message);
          this.processing = false;
        }
      });
    }
    


    handleImport(user: any) {
      this.showImporterForm = true;
      this.toImport = user;
      console.log(this.toImport);
      this.intervenantForm.patchValue({ memberCuid: this.toImport.cuid, memberEmail: this.toImport.email});
      console.log("IntervenantForm: ",this.intervenantForm)
    }

    loadAllUsers() {
      let page = 0;
      const size = 100;

      const loadPage = (page: number) => {
        this.userService.getUsers(page, size).subscribe({
          next: (response: any) => {
            if (response && response.content) {
              console.log("Liste des intervenants: ",response);
              this.shamsy = response.content.map((item: any) => ({
                id: item.id, 
                fullName: `${item.user?.lastname} ${item.user?.firstname}`,
                lastname: item.user?.lastname,
                firstname: item.user?.firstname,
                cuid: item.user?.cuid,
                email: item.user?.email,
                role: item.role,
              }));
            } else {
              this.toastr.error("Les données des utilisateurs sont mal formatées.");
            }

            if (page < response.totalPages - 1) {
              loadPage(page + 1);
            } else {
            }
          },
          error: (error) => {
            this.toastr.error(error.error.message??error.message);
          }
        });
      };

      loadPage(page);
    }

    handleShowForm() {
      this.showForm = true
    }

    loadProjectData() {
      this.ps.getProjectById(this.projectId).subscribe({
        next: (data: any) => {
          this.projectDetails = data.data;
          console.log("projectDetails",data)

          this.ps.currentProjectDetails$.next(this.projectDetails);
        },
        error: error => {
          console.error(error)
          this.toastr.error(error.error === null? "Une erreur est survenue": error.error.message);
        }
      })
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

    getPermission(){}

    searchUser($event: any) {
      this.userService.searchUserFromLdap($event.target.value).subscribe({
        next: (data: any) => {
          this.users = data;
        },
        error: err => {
          this.toastr.error(err.message)
        }
      })
    }

}
