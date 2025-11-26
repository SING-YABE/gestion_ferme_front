import { Component, OnInit } from '@angular/core';
import { ButtonDirective } from "primeng/button";
import { FlexModule } from "@angular/flex-layout";
import { InputTextModule } from "primeng/inputtext";
import { ConfirmationService, MenuItem, PrimeTemplate } from "primeng/api";
import { TableModule } from "primeng/table";
import { BudgetService } from "../../../../@core/service/budget.service";
import { ProjectService } from "../../../../@core/service/project.service";
import {DatePipe, DecimalPipe, NgForOf, NgIf, registerLocaleData} from "@angular/common";
import fr from '@angular/common/locales/fr';
import { TagModule } from "primeng/tag";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ToastrService } from "ngx-toastr";
import { BreadcrumbModule } from "primeng/breadcrumb";
import { ProjectIntervenantFormComponent } from "../project-intervenants/project-intervenant-form/project-intervenant-form.component";
import { DialogModule } from 'primeng/dialog';
import * as XLSX from 'xlsx';
import {PoService} from "../../../../@core/service/po.service";
import {saveAs} from "file-saver";
import {PvService} from "../../../../@core/service/pv.service";
import {PvFormComponent} from "./pv-form/pv-form.component"; // Assure-toi que XLSX est importé

@Component({
  selector: 'app-project-pv',
  standalone: true,
  imports: [
    ButtonDirective,
    FlexModule,
    InputTextModule,
    PrimeTemplate,
    TableModule,
    PvFormComponent,
    DecimalPipe,
    TagModule,
    ConfirmDialogModule,
    DatePipe,
    BreadcrumbModule,
    ProjectIntervenantFormComponent,
    DialogModule,
    NgIf,
    NgForOf
  ],
  templateUrl: './project-pv.component.html',
  styleUrl: './project-pv.component.scss',
  providers: [
    ConfirmationService
  ]
})
export class ProjectPvComponent implements OnInit {

  processVerbals: any[] = [];
  projectId: string = "";
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;
  loading: boolean = false;
  showDetailsModal: boolean = false;
  selectedPv: any = null; // Stocke le budget sélectionné


  constructor(
    private pvService: PvService,
    private poService: PoService,
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


  formatDate(dateArray: number[]): string {
    const [year, month, day, hour, minute, second, nanosecond] = dateArray;
    const date = new Date(year, month - 1, day, hour, minute, second, Math.round(nanosecond / 1e6));
    return date.toLocaleString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
  }
  loadData() {
    this.loading = true;
    this.pvService.getByProject(this.projectId).subscribe({
      next: (value: any) => {
        if (value.successful) {
          this.processVerbals = value.data;
          console.log("Budget:", this.processVerbals)
          this.loading = false;
        }
      },
      error: error => { this.loading = false; }
    })
  }

  handleDelete(budget: any) {
    this.cs.confirm({
      icon: "pi pi-exclamation-triangle",
      message: "Souhaitez-vous vraiment supprimer ce PV ?",
      header: 'Confirmation',
      defaultFocus: 'reject',
      acceptLabel: 'Oui je confirme',
      rejectLabel: 'Non',
      acceptButtonStyleClass: 'p-button-danger outlined p-button-sm',
      rejectButtonStyleClass: 'p-button-sm mr-2',
      accept: () => {
        this.pvService.delete(budget.id).subscribe({
          next: () => {
            this.loadData();
            this.toastr.success("PV supprimé avec succès !");
          },
          error: error => {
            this.toastr.error(error.message);
          }
        })
      }
    })
  }

  showBudgetDetails(budget: any) {
    this.selectedPv = budget;
    this.showDetailsModal = true;
  }

  downloadFiles(){
      this.pvService.downlloadFile(this.selectedPv?.id).subscribe(
        (response) => {
          console.log(response)
          const blob = new Blob([response.body as Blob], { type: 'application/octet-stream' });
          saveAs(blob, this.selectedPv?.numeroPo);
        },
        (error) => {
          console.log(error)
          this.toastr.error('Erreur lors du téléchargement du fichier');
        }
        );
  }
}
