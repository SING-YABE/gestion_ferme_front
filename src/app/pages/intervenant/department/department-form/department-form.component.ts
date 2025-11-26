import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DialogModule} from "primeng/dialog";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {UserService} from "../../../../@core/service/user.service";
import {ToastrService} from "ngx-toastr";
import {DirectionService} from "../../../../@core/service/direction.service";
import { faUser } from '@fortawesome/free-regular-svg-icons';
import {InputTextModule} from "primeng/inputtext";
import {ButtonDirective} from "primeng/button";
import {DropdownModule} from "primeng/dropdown";
import {BadgeModule} from "primeng/badge";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {DepartmentService} from "../../../../@core/service/department.service";
import {NgIf} from "@angular/common";
import {faBuilding} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [
    DialogModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonDirective,
    DropdownModule,
    BadgeModule,
    FaIconComponent,
    NgIf
  ],
  templateUrl: './department-form.component.html',
  styleUrl: './department-form.component.scss'
})
export class DepartmentFormComponent implements OnInit {

  @Input() target: any

  @Input()
  mode: 'edit' | 'create' = 'create';
  showForm = false;
  processing = false;

  @Output()
  onUpdate: EventEmitter<any> = new EventEmitter();

  protected readonly faUser = faUser;
  directions: any[] = [];

  users: any[] = [];

  departmentForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    managerCuid: [null, [Validators.required]],
    filterValue: [''],
    directionId: [null, [Validators.required]],
  });

  loading = false;

  constructor(private fb: FormBuilder,
              private usersService: UserService,
              private toastr: ToastrService,
              private ds: DirectionService,
              private departmentService: DepartmentService) {
  }

  ngOnInit(): void {
    this.departmentForm.patchValue({
      name: this.target?.name,
      description: this.target?.description,
      managerCuid: this.target?.manager?.user?.cuid,
      directionId: this.target?.directionId,
    });
  }

  handleFilter($event: any) {
    this.searchUser($event.target.value);
  }

  private searchUser(query: string) {
    this.loading = true;
    this.usersService.searchUserFromLdap(query).subscribe({
      next: (data: any) => {
        this.users = data
        this.loading = false;

        if (this.target != undefined && this.target.manager != undefined) {
          this.users.push(this.target.manager.user);
        }

      }
    })
  }

  handleSubmit() {

    if (!this.departmentForm.valid) return;

    this.processing = true;
    const department = {
      name: this.departmentForm.value.name,
      managerCuid: this.departmentForm.value.managerCuid,
      directionId: this.departmentForm.value.directionId
    }

    if (this.mode == 'create') {
      this.departmentService.createDepartment(department).subscribe({
        next: (data: any) => {
          this.handleResponse(data);
        },
        error: err => {
          this.toastr.error(err.message);
          this.processing = false;
        }
      });

    }else {

      this.departmentService.updateDepartment(this.target.id, department).subscribe({
        next: (data: any) => {
          this.handleResponse(data);
        },
        error: err => {
          this.toastr.error(err.message);
          this.processing = false;
        }
      });

    }
  }

  private handleResponse(data: any) {
    if (data.successful){
      this.toastr.success(data.message);
      this.onUpdate.emit();
      this.processing = false;
      this.showForm = false;
    }else {
      this.toastr.error(data.message);
    }
    this.processing = false;
  }

  private loadDirections() {
    this.ds.getAll().subscribe({
      next: (data: any) => {
        this.directions = data.data?.content;
      },
      error: err => {
        this.toastr.error(err.message);
      }
    })
  }

  protected readonly faBuilding = faBuilding;

  handleShow() {
    this.showForm = true;
    this.loadDirections();
    this.searchUser("DICKO");
  }
}
