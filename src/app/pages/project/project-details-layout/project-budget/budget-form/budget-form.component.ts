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
import {DatePipe, NgIf} from "@angular/common";
import {BadgeModule} from "primeng/badge";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faBuilding, faMoneyBills} from "@fortawesome/free-solid-svg-icons";
import {CalendarModule} from "primeng/calendar";

@Component({
  selector: 'app-budget-form',
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
    DatePipe
  ],
  templateUrl: './budget-form.component.html',
  styleUrl: './budget-form.component.scss'
})
export class BudgetFormComponent implements OnInit {

  showForm = false;
  processing = false;
  lignes: any = [];
  @Input() target: any
  @Input() mode: 'edit' | 'create' = 'create';

  @Output()
  onDone: EventEmitter<any> = new EventEmitter();

  depenseForm: FormGroup = this.fb.group({
    dateDepense: new FormControl(new Date(), [Validators.required]),
    label: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    annualBudgetId: new FormControl(null, [Validators.required]),
    amount: new FormControl('', [Validators.required]),

  })

  projectId: string = "";

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private ps: ProjectService,
    private bs: BudgetService
  ) {
  }

  ngOnInit() {
    this.getAllLigneBudget();
    this.ps.currentProjectId$.subscribe(projectId => { this.projectId = projectId });
    console.log("target : ",this.target)
    if (this.mode === 'edit') {
      this.depenseForm.patchValue({
        year: this.target?.year,
        label: this.target?.label,
        description: this.target?.description,
        type: this.target?.type,
        amount: this.target?.amount,
        annualBudgetId: this.target?.annualBudgetDTO?.id
      })
    }

  }

  getAllLigneBudget(){
    this.bs.getAllAnnualBudgetWithoutPaginate().subscribe(data => {
      this.lignes = data.data;
      // console.log("liste des lignes budgetaire :", this.lignes)
    })
  }

  handleShowForm(){
    this.showForm = true;
  }


  handleSaveBudget() {
    if (this.depenseForm.valid) {
      this.processing = true;
      const budget = {...this.depenseForm.value, projectId: this.projectId};

      if (this.mode === 'create') {
        this.bs.createBudget(budget).subscribe({
          next: (value: any) => {
            this.handleOk(value)
          },
          error: err => {
            this.processing = false;
            this.toastr.error(err.error?.message??err.message);
          }
        })
      }else {
        this.bs.updateBudget(this.target.id, budget).subscribe({
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

  private handleOk(value: any) {
    this.processing = false;
    this.showForm = false;
    this.depenseForm.reset();
    this.toastr.success("Budget crée avec succès !");
    this.onDone.emit(value);
  }

  protected readonly faBuilding = faBuilding;
  protected readonly faMoneyBills = faMoneyBills;
}
