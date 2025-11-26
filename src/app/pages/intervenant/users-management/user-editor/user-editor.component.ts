import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonDirective } from "primeng/button";
import { SidebarModule } from "primeng/sidebar";
import { DirectionService } from '../../../../@core/service/direction.service';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { RoleService } from '../../../../@core/service/role.service';
import { UserService } from '../../../../@core/service/user.service';
import { ToastrService } from 'ngx-toastr';
import { emptyPage, PageResponse } from '../../../../@core/model/page-response.model';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-user-editor',
  standalone: true,
  imports: [
    ButtonDirective,
    SidebarModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    NgIf,
  ],
  templateUrl: './user-editor.component.html',
  styleUrl: './user-editor.component.scss'
})
export class UserEditorComponent implements OnChanges {
    @Input() user: any;
    userForm: FormGroup;
    directions: any[] = [];
    showForm = false;
    roles: any[] = [];
    selectedRoleId: string | undefined;
    private initialUserData: any = {};
    departments: any[] = [];
    selectedDepartmentName: string | null = null;
    selectedDirection : string | null = null;


    emptyMessage = "Aucune proposition trouvé!"

    @Output() onUpdate = new EventEmitter<void>();
    @Output() onClose = new EventEmitter<void>();
    constructor(
        private roleService: RoleService,
        private ds: DirectionService,
        private fb: FormBuilder,
        private userService: UserService,
        private toastr: ToastrService
    ) {
        this.userForm = this.fb.group({
            firstname: ['', Validators.required],
            lastname: ['', Validators.required],
            email: ['', Validators.required],
            msisdn: ['', Validators.required],
            role: [[], Validators.required],
            directions : [[],Validators.required],
            departmentId: [[], Validators.required]
        });
    }

    ngOnChanges(changes: SimpleChanges) {
      this.loadRoles().then(() => {
        this.loadDirections();
        this.updateForm();
      });
    }

    loadRoles(): Promise<void> {
      return new Promise((resolve) => {
        this.roleService.getAllRoles().subscribe(
          (data) => {
            console.log('Liste des rôles récupérée:', data);
            if (Array.isArray(data)) {
              this.roles = data;
            } else {
              this.roles = [];
            }
            resolve();
          },
          (error) => {
            console.error('Erreur lors de la récupération des rôles:', error);
            this.roles = [];
            resolve();
          }
        );
      });
    }
  private updateForm() {
    this.loadDirections();
    
    setTimeout(() => {
        const departmentId = this.user?.departmentId || this.user?.department?.id;
        let directionValue = null;
        
        // direction CONTENANT DEPART
        if (departmentId && this.directions.length > 0) {
            for (const direction of this.directions) {
                const departmentFound = direction.departments?.find((dept: any) => dept.id === departmentId);
                if (departmentFound) {
                    directionValue = direction;
                    this.departments = direction.departments || [];
                    break;
                }
            }
        }
        
        // Preremplir 
        this.userForm.patchValue({
            firstname: this.user?.user?.firstname || '',
            lastname: this.user?.user?.lastname || '',
            email: this.user?.user?.email || '',
            msisdn: this.user?.user?.msisdn || '',
            role: this.user?.user?.role?.id || '',
            directions: directionValue,
            departmentId: departmentId
        });
    }, 300);
}

    ngOnInit(): void {
      this.loadRoles().then(() => {
        this.updateForm();
      });
    }

    handleShow() {
      this.showForm = true;
      this.loadDirections();
      this.loadRoles();
  }


    private loadData() {
        this.ds.getAll(1, 1000).subscribe({
            next: (value: any) => {
                if (value.successful) {
                    this.directions = value.data.content;
                }
            }
        });
    }

    handleChange($event: any) {
      this.departments = $event.departments;
  }




  cancel() {
    this.userForm.reset();
    this.onClose.emit();

  }



  onSubmit() {
    if (this.userForm.valid) {
      const formData = this.userForm.value;
      this.user.user.role = this.roles.find(role => role.id === formData.role) || this.user.user.role
      this.user.user.email = this.userForm.value.email;
      this.user.user.msisdn = this.userForm.value.msisdn;
        const updatedUser: any = {
          user: this.user.user,
        ...formData,
          id: this.user.id
      };

      this.userService.updateUser(this.user.user.id, updatedUser).subscribe({
        next: (response) => {
          this.onUpdate.emit();
        },
        error: (error) => {
          console.error("Erreur de mise à jour :", error);
        }
      });
    } else {
      console.log("Formulaire invalide");
    }
  }


  private loadDirections() {
    this.ds.getAll(1, 1000).subscribe({
        next: (value: any) => {
            if (value.successful) {
                this.directions = value.data.content;
                console.log("Directions chargées :", this.directions);
            }
        },
        error: (err) => {
            console.error("Erreur lors du chargement des directions :", err);
        }
    });
}

onDirectionChange(direction: any) {
  if (direction && direction.departments) {
      this.departments = direction.departments;
  } else {
      this.departments = [];
  }
}

}
