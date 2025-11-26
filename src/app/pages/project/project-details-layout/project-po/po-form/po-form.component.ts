import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ButtonDirective} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {SelectButtonModule} from "primeng/selectbutton";
import {DropdownModule} from "primeng/dropdown";
import {ToastrService} from "ngx-toastr";
import {ProjectService} from "../../../../../@core/service/project.service";
import {BudgetService} from "../../../../../@core/service/budget.service";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {BadgeModule} from "primeng/badge";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faBuilding, faMoneyBills} from "@fortawesome/free-solid-svg-icons";
import {CalendarModule} from "primeng/calendar";
import {ToastModule} from "primeng/toast";
import {FileUploadModule, UploadEvent} from "primeng/fileupload";
import {MessageService, PrimeNGConfig} from "primeng/api";
import {PoService} from "../../../../../@core/service/po.service";

@Component({
  selector: 'app-po-form',
  standalone: true,
  imports: [
    ButtonDirective,
    DialogModule,
    ReactiveFormsModule,
    InputTextModule,
    SelectButtonModule,
    DropdownModule,
    NgIf,
    BadgeModule,
    FaIconComponent,
    CalendarModule,
    DatePipe,
    ToastModule,
    FileUploadModule,
    NgForOf
  ],
  providers: [MessageService],

  templateUrl: './po-form.component.html',
  styleUrl: './po-form.component.scss'
})
export class PoFormComponent implements OnInit {

  showForm = false;
  processing = false;
  lignes: any = [];
  files = [];
  uploadedFiles: any;

  @Input() target: any
  @Input() mode: 'edit' | 'create' = 'create';

  @Output()
  onDone: EventEmitter<any> = new EventEmitter();
  ligneBudgetaires: any = [];
  poForm: FormGroup = this.fb.group({
    dateEmision: new FormControl(new Date(), [Validators.required]),
    numeroPo: new FormControl('', [Validators.required]),
    projectLigneId: new FormControl(null, [Validators.required]),
    totalAmount: new FormControl('', [Validators.required]),
    fournisseur: new FormControl(null, [Validators.required]),
    file: new FormControl(null, [Validators.required]),
    description: new FormControl(''),

  })

  projectId: string = "";

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private ps: ProjectService,
    private pos: PoService,
    private config: PrimeNGConfig,
    private messageService: MessageService
  ) {
  }

  ngOnInit() {
    this.ps.currentProjectId$.subscribe(projectId => { this.projectId = projectId });
    console.log("target : ",this.target)
    if (this.mode === 'edit') {
      this.poForm.patchValue({
        year: this.target?.year,
        label: this.target?.label,
        description: this.target?.description,
        type: this.target?.type,
        amount: this.target?.amount,
        annualBudgetId: this.target?.annualBudgetDTO?.id
      })
    }
    this.getProjectLignes();

  }

  getProjectLignes(){
    this.pos.getProjectLignes(this.projectId).subscribe(
      (response) => {
        this.ligneBudgetaires = response.data;
      },
      (error) => {
        console.error('Erreur lors de la récupération des lignes du projet:', error);
      }
    )
  }

  handleShowForm(){
    this.showForm = true;
  }


  handleSavePo() {
    console.log(this.uploadedFiles[0])
    if (this.poForm.valid) {
      this.processing = true;
      const po = {...this.poForm.value, projectId: this.projectId};
      if (this.mode === 'create') {
        this.pos.createPo(po, this.uploadedFiles).subscribe({
          next: (value: any) => {
            this.handleOk(value)
          },
          error: err => {
            this.processing = false;
            this.toastr.error(err.error?.message??err.message);
          }
        })
      }else {
        this.pos.updatePo(this.target.id, po).subscribe({
          next: (value: any) => {
            this.handleOk(value)
          },
          error: err => {
            this.processing = false;
            this.toastr.error(err.error?.message??err.message);
          }
        })
      }

    }else {
      this.toastr.error("Veuillez bien renseigner tout les champs")
    }
  }

  onUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadedFiles = input.files[0];
    }
  }


  private handleOk(value: any) {
    this.processing = false;
    this.showForm = false;
    this.poForm.reset();
    this.toastr.success("PO crée avec succès !");
    this.onDone.emit(value);
  }



  protected readonly faBuilding = faBuilding;
  protected readonly faMoneyBills = faMoneyBills;
}
