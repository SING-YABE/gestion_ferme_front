import {DatePipe, DecimalPipe, isPlatformBrowser, NgIf} from '@angular/common';
import { Component, ChangeDetectorRef, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { Chart } from 'chart.js';
import { ButtonDirective } from 'primeng/button';
import { FlexModule } from '@angular/flex-layout';
import { InputTextModule } from 'primeng/inputtext';
import {PrimeTemplate, ConfirmationService, MenuItem} from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProjectService } from "../../../../@core/service/project.service";
import { ToastrService } from "ngx-toastr";
import { RisqueService } from '../../../../@core/service/risque.service';
import { RisqueFormComponent } from './risque-form/risque-form.component';
import { CategorieRisquesService } from '../../../../@core/service/categorie-risques.service';
import { DialogModule } from 'primeng/dialog';
import { Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import{ActionPlansService} from '../../../../@core/service/action-plans.service';
import { ProgressBarModule } from 'primeng/progressbar';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import {HasPermissionDirective} from "../../../../@core/security/directives/has-permission.directive";
@Component({
  selector: 'app-project-risques',
  standalone: true,

  imports: [
    ChartModule,
    ButtonDirective,
    ProgressBarModule,
    FlexModule,
    InputTextModule,
    PrimeTemplate,
    TableModule,
    DecimalPipe,
    TagModule,
    ConfirmDialogModule,
    DatePipe,
    RouterModule,
    RisqueFormComponent,
    DialogModule,
    ProgressSpinnerModule,
    NgIf,
    HasPermissionDirective
  ],
  templateUrl: './project-risques.component.html',
  styleUrls: ['./project-risques.component.scss'],
  providers: [ConfirmationService]
})
export class ProjectRisquesComponent implements OnInit {
  actionPlans: any[] = [];
  displayActionPlans: boolean = false;
  data: any;
  risk: any;
  options: any;
  platformId = inject(PLATFORM_ID);
  chart: any;
  risques: any[] = [];
  riskCategories: any[] = [];
  projectId: string = "";
  loading: boolean = false;
  selectedRisque: any = null;
  displayDetails: boolean = false;
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;
  selectedRiskId: string = "";

  constructor(
    private cd: ChangeDetectorRef,
    private risqueService: RisqueService,
    private categorieRisqueService: CategorieRisquesService,
    private ps: ProjectService,
    private actionPlansService: ActionPlansService,
    private cs: ConfirmationService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.ps.currentProjectId$.subscribe(projectId => {
      console.log("id du projet", projectId);
      this.projectId = projectId;
      this.loadData();
      this.items = [
        { label: 'projet' },
        { label: this.projectId },
        { label: 'risques' },
      ];
    });
  }

  loadData() {
    this.loading = true;

    this.risqueService.getProjectRisks(this.projectId, 1, 10).subscribe({
      next: (response: any) => {
        this.risques = response.data;
        console.log("Liste des risque recupéré: ",this.risques)
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error("Erreur lors du chargement des risques");
        console.error("Erreur lors du chargement des risques:", error);
        this.loading = false;
      }
    });
  }

  handleDelete(risque: any) {
    this.cs.confirm({
      icon: "pi pi-exclamation-triangle",
      message: "Voulez-vous vraiment supprimer ce risque ?",
      header: 'Confirmation',
      defaultFocus: 'reject',
      acceptLabel: 'Oui, supprimer',
      rejectLabel: 'Non',
      acceptButtonStyleClass: 'p-button-danger outlined p-button-sm',
      rejectButtonStyleClass: 'p-button-sm mr-2',
      accept: () => {
        this.loading = true; // 🔹 Active le loader pendant la suppression

        this.risqueService.deleteProjectRisk(risque.id, this.projectId).subscribe({
          next: () => {
            this.toastr.success("Risque supprimé avec succès !");
            this.loadData();
          },
          error: (error) => {
            this.toastr.error(error.message || "Impossible de supprimer ce risque.");
            this.loading = false; // 🔹 Désactive le loader en cas d'échec
          }
        });
      }
    });
  }

  viewDetails(risque: any) {
    this.selectedRisque = risque;
    this.displayDetails = true;
  }
  loadActionPlans(riskId: string) {
    this.loading = true;
    this.risqueService.getActionPlansByRisk(riskId).subscribe({
      next: (response: any) => {
        this.actionPlans = response.data;
        this.loading = false;
      },

    });
  }
  viewActionPlans(risque: any) {
    this.selectedRisque = risque;
    this.selectedRiskId = risque.id;
    this.loading = true;

    this.actionPlansService.getActionPlansByRisk(risque.id).subscribe({
      next: (response: any) => {
        this.actionPlans = response.data;
        this.displayActionPlans = true;
        this.loading = false;
      },
      error: (error:any) => {
        this.toastr.error("Erreur lors du chargement des plans d'action");
        console.error("Erreur lors du chargement des plans d'action:", error);
        this.loading = false;
      }
    });
  }
navigateToRiskActionPlans(risque: any) {
  this.router.navigate(['risque-action-plans', risque.id], {
    relativeTo: this.route,
    state: { riskData: risque }
  });
}

  closeActionPlansDialog() {
    this.displayActionPlans = false;
  }
}
