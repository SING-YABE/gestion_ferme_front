import { Component, OnInit } from '@angular/core';
import { ButtonDirective } from "primeng/button";
import { FlexModule } from "@angular/flex-layout";
import { InputTextModule } from "primeng/inputtext";
import { ConfirmationService, MenuItem, PrimeTemplate } from "primeng/api";
import { TableModule } from "primeng/table";
import { BudgetFormComponent } from "./budget-form/budget-form.component";
import { BudgetService } from "../../../../@core/service/budget.service";
import { ProjectService } from "../../../../@core/service/project.service";
import {DatePipe, DecimalPipe, NgIf, registerLocaleData} from "@angular/common";
import fr from '@angular/common/locales/fr';
import { TagModule } from "primeng/tag";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ToastrService } from "ngx-toastr";
import { BreadcrumbModule } from "primeng/breadcrumb";
import { ProjectIntervenantFormComponent } from "../project-intervenants/project-intervenant-form/project-intervenant-form.component";
import { DialogModule } from 'primeng/dialog';
import * as XLSX from 'xlsx'; // Assure-toi que XLSX est importé

@Component({
  selector: 'app-project-budget',
  standalone: true,
  imports: [
    ButtonDirective,
    FlexModule,
    InputTextModule,
    PrimeTemplate,
    TableModule,
    BudgetFormComponent,
    DecimalPipe,
    TagModule,
    ConfirmDialogModule,
    DatePipe,
    BreadcrumbModule,
    ProjectIntervenantFormComponent,
    DialogModule,
    NgIf
  ],
  templateUrl: './project-budget.component.html',
  styleUrl: './project-budget.component.scss',
  providers: [
    ConfirmationService
  ]
})
export class ProjectBudgetComponent implements OnInit {

  budgets: any[] = [];
  projectId: string = "";
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;
  loading: boolean = false;

  showDetailsModal: boolean = false;
  selectedBudget: any; // Stocke le budget sélectionné


  constructor(
    private budgetService: BudgetService,
    private ps: ProjectService,
    private cs: ConfirmationService,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.home = { icon: 'pi pi-home', routerLink: '/' };
    registerLocaleData(fr);
    this.ps.currentProjectId$.subscribe(projectId => {
      this.projectId = projectId;
      console.log("ID récupéré:", this.projectId);
      this.items = [
        { label: 'projet' },
        { label: this.projectId },
        { label: 'dépenses' }
      ];
      this.loadData();
    });
  }

  loadData() {
    this.loading = true;
    this.budgetService.projectBudgets(this.projectId).subscribe({
      next: (value: any) => {
        if (value.successful) {
          this.budgets = value.data;
          console.log("Budget:", this.budgets)
          this.loading = false;
        }
      },
      error: error => { this.loading = false; }
    })
  }

  handleDelete(budget: any) {
    this.cs.confirm({
      icon: "pi pi-exclamation-triangle",
      message: "Souhaitez-vous vraiment supprimer cette ligne budgétaire ?",
      header: 'Confirmation',
      defaultFocus: 'reject',
      acceptLabel: 'Oui je confirme',
      rejectLabel: 'Non',
      acceptButtonStyleClass: 'p-button-danger outlined p-button-sm',
      rejectButtonStyleClass: 'p-button-sm mr-2',
      accept: () => {
        this.budgetService.delete(budget.id).subscribe({
          next: () => {
            this.loadData();
            this.toastr.success("Ligne supprimée avec succès !");
          },
          error: error => {
            this.toastr.error(error.message);
          }
        })
      }
    })
  }

  showBudgetDetails(budget: any) {
    console.log("Budget sélectionné :", budget);
    this.selectedBudget = budget;
    this.showDetailsModal = true;
  }


exportToExcel(): void {
  const data = this.budgets.map(budget => ({
    'Année': budget.year,
    'Type': budget.annualBudgetDTO?.type,
    'Libellé': budget.annualBudgetDTO?.label,
    'Direction': budget.annualBudgetDTO?.direction?.name,
    'Montant (XOF)': budget.amount,
  }));

  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Budgets');

  XLSX.writeFile(wb, 'budgets.xlsx');
}

}
