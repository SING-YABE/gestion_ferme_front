import {ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID} from '@angular/core';
import {FlexModule} from "@angular/flex-layout";
import {TimelineModule} from "primeng/timeline";
import {BadgeModule} from "primeng/badge";
import {ButtonDirective} from "primeng/button";
import {ProgressBar, ProgressBarModule} from "primeng/progressbar";
import {ProjectService} from "../../../../@core/service/project.service";
import {ChartModule} from "primeng/chart";
import {DatePipe, isPlatformBrowser, NgIf} from "@angular/common";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import { RiskStatus } from '../../../../@core/model/enum';

@Component({
  selector: 'app-project-overview',
  standalone: true,
  imports: [
    FlexModule,
    TimelineModule,
    BadgeModule,
    ProgressBarModule,
    ButtonDirective,
    ChartModule,
    NgIf,
    DatePipe,
    ProgressSpinnerModule
  ],
  templateUrl: './project-overview.component.html',
  styleUrl: './project-overview.component.scss'
})
export class ProjectOverviewComponent implements OnInit {
  platformId = inject(PLATFORM_ID);
  projectId: any;
  options: any = {};
  dataRiskStatut: any;
  dataRiskCategorie: any;
  projectPhaseCount: any;
  riskStatut: any;
  riskCategorie: any;
  membershipCount: any;
  projectBudgetCount: any;
  projetDepensesCount: any;
  projetRiskCount: any;
  projetPlanActionCount: any;
  projectKPIs: any
  constructor(private projectService: ProjectService,private cd: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    this.options = {
      plugins: {
        legend: {
          position: 'bottom',
          display: true,
          labels: {
            usePointStyle: true,
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
          }
        }
      },
    };
    this.projectService.currentProjectId$.subscribe({
      next: (value: string) => {
        this.projectId = value;
      },
      error: (e) => {}
    });

    //Liste des KPI pour un projet
    this.getProjectKpi()
  }

  getProjectFinishedPhaseCountAndOtherCount(){
    this.projectService.getProjectFinishedPhaseCountAndOtherCount(this.projectId).subscribe(data => {
      this.projectPhaseCount = data;
    })
  }


  getProjectKpi(){
    this.projectService.getProjectKPI(this.projectId).subscribe({
      next: (response:any) => {
        console.log(response);
        this.projectKPIs = response.data

        this.riskStatut = this.projectKPIs.projectRiskCountByStatus
        this.riskCategorie = this.projectKPIs.projectRiskCountByCategory
        this.projectBudgetCount = this.projectKPIs.budgetConsomationPercent
        this.projetPlanActionCount = this.projectKPIs.totalActionPlan
        this.membershipCount = this.projectKPIs.totalMemberShip
        this.projetDepensesCount = this.projectKPIs.totalDepenseNombreDepense
        this.projetRiskCount = this.projectKPIs.totalRisks


        //Initialisation des chart
        this.initRisqueStatutChart()
        this.initRisqueCategoryChart()
      },
      error: (err: any) => {
        console.log(err)
      }
    })
  }

  getPhaseCount(phase:string){
    return this.projectKPIs?.phaseByStatus.filter((it:any) => it.status === phase)[0].count
  }









  getProgressBackground() {
    return `conic-gradient(#f84 ${Number(this.projectBudgetCount)}%, #e0e0e0 0)`;
  }

  initRisqueStatutChart() {
    this.dataRiskStatut = {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: ["#cc86f1","#fc0","#a82627"],
        }
      ]
    };
    if (isPlatformBrowser(this.platformId)) {
      this.riskStatut.forEach((value: any)=>{
        this.dataRiskStatut.labels.push(value?.statut)
        this.dataRiskStatut.datasets[0].data.push(value?.count)
      })
      this.cd.markForCheck()
    }

  }

  initRisqueCategoryChart() {
    this.dataRiskCategorie = {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: ["#f16e00","#527edb","#50be87","#cc86f1"],
        }
      ]
    };
    if (isPlatformBrowser(this.platformId)) {
      this.riskCategorie.forEach((value: any)=>{
        this.dataRiskCategorie.labels.push(value.category)
        this.dataRiskCategorie.datasets[0].data.push(value.count)
      })
      this.cd.markForCheck()
    }

  }

}
