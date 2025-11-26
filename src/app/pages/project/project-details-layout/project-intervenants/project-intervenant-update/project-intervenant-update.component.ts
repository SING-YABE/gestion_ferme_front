import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ButtonDirective } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { ProjectMembershipService } from '../../../../../@core/service/project-membership.service';
import { ProjectService } from '../../../../../@core/service/project.service';
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
  selector: 'app-project-intervenant-update',
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
  ],
  templateUrl: './project-intervenant-update.component.html',
  styleUrl: './project-intervenant-update.component.scss'
})
export class ProjectIntervenantUpdateComponent implements OnInit {

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
  usersPage: any[] = [];
  permissions: any[] = [];
  showImporterForm = false;
  showImporterUpdate = false;
  directions: any[] = [];
  departments: any[] = [];
  toImport: any;
  processing = false;
  memberDetails: any;
  selectedUser: any = null;
  loading = false;
  selectedUserId: string | null = null;
  @Input("id")
  id: string = "";
  projectDetails: any;
  projectId: string = "";

  
  emptyMessage = "Aucune proposition trouvé!"
    
  selectedDirection: any;
  selectedDepartmentId: string | undefined

  constructor(
    private ps: ProjectService,
    private psm: ProjectMembershipService,
    private toastr: ToastrService,
  ) {}


  ngOnInit(): void {
    this.psm.currentId$.subscribe(id => { this.id = id });
    this.memberDetails = this.loadData();
    this.projectDetails = this.loadProjectData()
    this.validatorOptions;


  }

  submitForm() {}

  handleShowForm() {
    this.showImporterUpdate = true;
  }
  loadProjectData() {
    this.ps.getProjectById(this.projectId).subscribe({
      next: (data: any) => {
        this.projectDetails = data.data;
        this.ps.currentProjectDetails$.next(this.projectDetails);
      },
      error: error => {
        this.toastr.error(error.error.message??error.message);
      }
    })
  }

  loadData() {
    this.psm.getMemberById(this.id).subscribe({
      next: (data: any) => {
        this.memberDetails = data.data;
        this.ps.currentProjectDetails$.next(this.memberDetails);
      },
      error: error => {
        this.toastr.error(error.message??error.message);
      }
    })
  }

}
