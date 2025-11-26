import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ButtonDirective} from "primeng/button";
import {NgIf} from "@angular/common";
import {DialogModule} from "primeng/dialog";
import {InputTextModule} from "primeng/inputtext";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {UserService} from "../../../../@core/service/user.service";
import {ToastrService} from "ngx-toastr";
import {BadgeModule} from "primeng/badge";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faUser} from "@fortawesome/free-solid-svg-icons";
import {DirectionService} from "../../../../@core/service/direction.service";

@Component({
  selector: 'app-direction-form',
  standalone: true,
  imports: [
    ButtonDirective,
    NgIf,
    DialogModule,
    InputTextModule,
    ReactiveFormsModule,
    DropdownModule,
    BadgeModule,
    FormsModule,
    FaIconComponent
  ],
  templateUrl: './direction-form.component.html',
  styleUrl: './direction-form.component.scss'
})
export class DirectionFormComponent implements OnInit {

  @Input() target: any

  @Input()
  mode: 'edit' | 'create' = 'create';
  showForm = false;
  processing = false;

  @Output()
  onUpdate: EventEmitter<any> = new EventEmitter();

  users: any[] = [];

  directionForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    directorCuid: [null],
    filterValue: [''],
  });
  loading = false;
  filterValue = "";

  constructor(private fb: FormBuilder,
              private usersService: UserService,
              private toastr: ToastrService,
              private ds: DirectionService) {
  }

  ngOnInit(): void {
    this.directionForm.patchValue({
      name: this.target?.name,
      description: this.target?.description,
      directorCuid: this.target?.director?.cuid
    });

    this.searchUser("DICKO");
  }

  handleFilter($event: any) {
    this.searchUser($event.target.value);
  }

  // private searchUser(query: string) {
  //   this.loading = true;
  //   this.usersService.searchUserFromLdap(query).subscribe({
  //     next: (data: any) => {
  //       this.users = data
  //       this.loading = false;

  //       if (this.target != undefined && this.target.director != undefined) {
  //         this.users.push(this.target.director);
  //       }

  //     }
  //   })
  // }

  private searchUser(query: string) {
    this.loading = true;
    this.usersService.searchUserFromLdap(query).subscribe({
      next: (data: any) => {
        this.users = data;
        

        if (this.target?.director?.cuid && !this.users.some(user => user.cuid === this.target.director.cuid)) {
          const director = {
            ...this.target.director,
            displayName: this.target.director.displayName || this.target.director.displayname || 
                        this.target.director.name || "Directeur actue"
          };
          this.users.push(director);
        }
        
        this.loading = false;
      }
    });
  }
  protected readonly faUser = faUser;

  handleSubmit() {
    if (!this.directionForm.valid) return;

    this.processing = true;
    const direction = {
      name: this.directionForm.value.name,
      description: this.directionForm.value.description,
      directorCuid: this.directionForm.value.directorCuid
    }

    if (this.mode == 'create') {
      this.ds.createDirection(direction).subscribe({
        next: (data: any) => {

          if (data.successful){
            this.toastr.success(data.message);
            this.onUpdate.emit();
            this.directionForm.reset();
            this.showForm = false;
          }else {
            this.toastr.error(data.message);
          }
          this.processing = false;
        },
        error: err => {
          this.toastr.error(err.message);
          this.processing = false;
        }
      });

    }else {

      this.ds.updateDirection(this.target.id, direction).subscribe({
        next: (data: any) => {
          if (data.successful){
            this.toastr.success(data.message);
            this.onUpdate.emit();
            this.processing = false;
            this.showForm = false;
          }else {
            this.toastr.error(data.message);
          }
          this.processing = false;
        },
        error: err => {
          this.toastr.error(err.message);
          this.processing = false;
        }
      });

    }
  }
}
