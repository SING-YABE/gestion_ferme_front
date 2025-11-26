import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {DialogModule} from "primeng/dialog";
import {InputTextModule} from "primeng/inputtext";
import {TableModule} from "primeng/table";
import {UserService} from "../../../../@core/service/user.service";
import {FormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";
import {ToastrService} from "ngx-toastr";
import {ButtonDirective} from "primeng/button";
import {DropdownModule} from "primeng/dropdown";
import {DirectionService} from "../../../../@core/service/direction.service";
import {ConfirmationService} from "primeng/api";

@Component({
  selector: 'app-user-importer',
  standalone: true,
  imports: [
    DialogModule,
    InputTextModule,
    TableModule,
    FormsModule,
    NgIf,
    ButtonDirective,
    DropdownModule,

  ],
  providers: [ConfirmationService],
  templateUrl: './user-importer.component.html',
  styleUrl: './user-importer.component.scss'
})
export class UserImporterComponent implements OnInit {

  @Output()
  onUpdate: EventEmitter<any> = new EventEmitter<any>()

  showForm = false;
  users: any[] = [];
  showImporterForm = false;
  toImport: any;
  processing = false;
  directions: any[] = [];
  departments: any[] = [];

  roles: any[] = [];
selectedRoleId: string | undefined; // Pour stocker le rôle sélectionné


  emptyMessage = "Aucune proposition trouvé!"
  selectedDirection: any;
  selectedDepartmentId: string | undefined

  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    private ds: DirectionService) {
  }

  ngOnInit(): void {
    this.loadRoles();

  }

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

  handleImport() {

    this.processing = true;
    const user = {...this.toImport, departmentId: this.selectedDepartmentId ?? null, roleCode: this.selectedRoleId}
    this.userService.import(user)
    .subscribe({
      next: (data: any) => {
        if (data.successful != undefined && !data.successful) {
          this.toastr.error(data.message);
        }else {
          this.toastr.success("Utilisateur importer avec succès !");
          this.toImport = undefined;
          this.showImporterForm = false;
          this.onUpdate.emit(data);
        }
        this.processing = false;
      },
      error: err => {
        this.toastr.error(err.message)
        this.processing = false;
      }
    });

  }

  handleShowForm() {
    this.showForm = true
    this.loadData();
  }

  private loadData() {
    this.ds.getAll(0, 1000).subscribe({
      next: (value: any) => {
        if (value.successful){
          this.directions = value.data.content;
        }
      }
    })
  }

  handleChange($event: any) {
    this.departments = $event.departments;
  }

  private loadRoles() {
    this.userService.getUserRole().subscribe({
      next: (data: any) => {
        this.roles = data; 
      },
      error: err => {
        this.toastr.error("Erreur lors du chargement des rôles: " + err.message);
      }
    });
  }
}
