import { Component, OnInit,OnDestroy ,ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../../../@core/service/task.service';
import { ProjectService } from '../../../../@core/service/project.service';
import { ToastrService } from 'ngx-toastr';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject,finalize } from 'rxjs';
import { combineLatest } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { UserService } from '../../../../@core/service/user.service';
import{PickListModule} from 'primeng/picklist';
import { InputTextareaModule } from 'primeng/inputtextarea';
import{InputSwitchModule} from 'primeng/inputswitch';
import { MultiSelectModule } from 'primeng/multiselect';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CheckboxModule } from 'primeng/checkbox';
import {ProjectMembershipService} from "../../../../@core/service/project-membership.service";
//import {ActivatedRoute} from "@angular/router";
import Chart from 'chart.js/auto';
import {AvatarGroupModule} from "primeng/avatargroup";
import {AvatarModule} from "primeng/avatar";
import { ActionPlansService } from '../../../../@core/service/action-plans.service';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import {RisqueFormComponent} from "../project-risques/risque-form/risque-form.component";
interface ShamsyUserOption {
  id: string;
  name: string;
  department: string;
  email: string;
  originalData: any;
  cuid: string;
}
interface ActionPlanProgressDTO {
  actionPlanId: string;
  actionPlanTitle: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  plannedTasks: number;
  blockedTasks: number;
  progressPercentage: number;
}
@Component({
  selector: 'app-project-tasks',
  standalone: true,
  imports: [
    InputSwitchModule,
    InputTextModule,
    ProgressBarModule,
    CommonModule,
    TableModule,
    ButtonModule,
    RouterModule,
    DialogModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarModule,
    DropdownModule,
    PickListModule,
    MultiSelectModule,
    InputTextareaModule,
    ProgressSpinnerModule,
    CheckboxModule,
    AvatarGroupModule,
    AvatarModule,
    RisqueFormComponent,
  ],
  templateUrl: './project-tasks.component.html',
  styleUrl: './project-tasks.component.scss'
})

export class ProjectTasksComponent implements OnInit, OnDestroy ,AfterViewInit {
  tasks: any[] = [];
  actionPlanId: string = '';
  risqueId: string = '';
  selectedTask: any = null;
  showDialog = false;
  taskForm: FormGroup;
  confirmationVisible = false;
  taskToDelete: any = null;
  progressData: any = null;
  fullScreenMode: boolean = false;
  dialogMode: 'create' | 'edit' = 'create';
  @ViewChild('pieChart') pieChartRef!: ElementRef;
  @ViewChild('barChart') barChartRef!: ElementRef;


    pieChart: any;
    barChart: any;
    chartLoaded = false;
  // Utilisateurs Shamsy
  shamsyUsers: any[] = [];
  shamsyUsersOptions: ShamsyUserOption[] = [];
  selectedExecutors: string[] = [];
  showProgressModal: boolean = false;

  isLoadingUsers = false;
  projectId: string = ''
  taskStatuses = [
    { label: 'Planifié', value: 'PLANNED' },
    { label: 'En cours', value: 'IN_PROGRESS' },
    { label: 'Terminé', value: 'COMPLETED' },
    { label: 'Bloqué', value: 'BLOCKED' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private projectMembershipService: ProjectMembershipService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private actionPlansService: ActionPlansService,
    private fb: FormBuilder,
  ) {
    this.taskForm = this.fb.group({
      title: [null, [Validators.required, Validators.minLength(3)]],
      description: [null],
      plannedEndDate: [null, Validators.required],
      status: [null, Validators.required],
    });
  }

  // ngOnInit(): void {
  //   // ID PA EN COURS
  //   this.route.params.subscribe(params => {
  //     this.actionPlanId = params['actionPlanId'];
  //   });

  //   this.projectService.currentProjectId$.subscribe(projectId => {
  //     console.log("id du projet", projectId);
  //     this.projectId = projectId;
  //   });

  //   // risqueId à partir du pA
  //   if (this.actionPlanId) {
  //     this.actionPlansService.getActionPlan(this.actionPlanId)
  //       .pipe(takeUntil(this.destroy$))
  //       .subscribe({
  //         next: (response: any) => {
  //           if (response && response.risqueId) {
  //             this.risqueId = response.risqueId;
  //           }
  //         },
  //         error: (error: any) => {
  //           console.error('Erreur lors de la recup du risqueId:', error);
  //         }
  //       });
  //   }

  //   this.loadShamsyUsers();
  //   this.loadTasks();
  // }
  // goBackToActionPlans() {
  //   console.log('Tentative de retour aux plans d\'action');
  //   console.log('ProjectId:', this.projectId);
  //   console.log('RisqueId:', this.risqueId);

  //   if (this.projectId && this.risqueId) {
  //     this.router.navigate([
  //       '/projects/details',
  //       this.projectId,
  //       'risques',
  //       'risque-action-plans',
  //       this.risqueId
  //     ]).then(
  //       success => console.log('Navigation retour réussie'),
  //       error => console.error('Erreur de navigation retour:', error)
  //     );
  //   } else {
  //     console.error('Impossible de naviguer : projectId ou risqueId manquant');
  //     // Proposer une navigation de secours
  //     this.router.navigate(['/projects/details', this.projectId, 'risques']);
  //   }
  // }

  ngOnInit(): void {
    console.log('ProjectTasksComponent - Initialisation');

    // CombinE route et queryParams
    combineLatest([
      this.route.params,
      this.route.queryParams
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([params, queryParams]) => {
      console.log('Route Params:', params);
      console.log('Query Params:', queryParams);

      this.actionPlanId = params['actionPlanId'] || queryParams['actionPlanId'];
      this.risqueId = params['risqueId'] || queryParams['risqueId'];

      console.log('ActionPlanId récupéré:', this.actionPlanId);
      console.log('RisqueId récupéré:', this.risqueId);

      // Si risqueId est manquant, recup sur PA
      if (!this.risqueId && this.actionPlanId) {
        this.actionPlansService.getActionPlan(this.actionPlanId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response: any) => {
              console.log('Récupération risqueId depuis action plan:', response);
              if (response && response.risqueId) {
                this.risqueId = response.risqueId;
              }
            },
            error: (error: any) => {
              console.error('Erreur lors de la récupération du risqueId:', error);
            }
          });
      }
    });

    // RECUPERER le projectId
    this.projectService.currentProjectId$.subscribe(projectId => {
      console.log('ProjectId récupéré:', projectId);
      this.projectId = projectId;
    });

    if (this.actionPlanId) {
      this.actionPlansService.getActionPlan(this.actionPlanId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            if (response && response.risqueId) {
              this.risqueId = response.risqueId;
            }
          },
          error: (error: any) => {
            console.error('Erreur Récupération du risqueId depuis PA:', error);
          }
        });
    }

    this.loadShamsyUsers();
    this.loadTasks();
  }


  toggleFullScreen() {
    this.fullScreenMode = !this.fullScreenMode;
  }
  loadShamsyUsers() {
    this.isLoadingUsers = true;
    this.projectMembershipService.getMembersOfProject2(this.projectId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoadingUsers = false)
      )
      .subscribe({
        next: (response: any) => {
          if (response.data) {
            this.shamsyUsers = response.data;
            //Trans les donne pour mlselect
            this.shamsyUsersOptions = this.shamsyUsers.map(user => ({
              id: user.member.user.id,
              name: user.member.user.displayName || `${user.member.user.firstname} ${user.member.user.lastname}`,
              department: user.member.department?.name || 'Non défini',
              cuid: user.member.user.cuid || '',
              email: user.member.user.email || '',
              originalData: user.member.user
            }));
            console.log(this.shamsyUsersOptions)
          } else {
            this.toastr.error('Format incor...');
          }
        },
        error: (error) => {
          this.toastr.error(error.message || 'Erreur CHARGEMENT UTILISATEURS');
        }
      });
  }

  loadTasks() {
    if (!this.actionPlanId) {
      this.toastr.error('ID du plan d\'action non disponible');
      return;
    }

    // Dans loadTasks()
this.taskService.getActionPlanTasks(this.actionPlanId)
.pipe(takeUntil(this.destroy$))
.subscribe({
  next: (response: any) => {
    this.tasks = Array.isArray(response) ? response : [];
  },
  error: (error) => {
    this.tasks = [];
    this.toastr.error(error.message || 'Erreur lors du chargement des tâches');
  }
});

  }

  openCreateDialog() {
    this.dialogMode = 'create';
    this.selectedTask = null;
    this.selectedExecutors = [];
    this.taskForm.reset({
      status: 'PLANNED',
    });
    this.showDialog = true;
  }

  openEditDialog(task: any) {
    this.dialogMode = 'edit';
    this.selectedTask = task;

    // IDs des exécuteurs existants
    this.selectedExecutors = task.executors?.map((executor: any) => executor.user.id) || [];

    this.taskForm.patchValue({
      ...task,
      plannedEndDate: task.plannedEndDate ? new Date(task.plannedEndDate) : null,
    });
    console.log("Avant loadProgressData");
    console.log("Type de données:", typeof this.actionPlanId, this.actionPlanId);
    this.showDialog = true;
  }

  submitTask() {
    if (this.taskForm.invalid) {
      this.toastr.warning('Remplir tous les champs');
      return;
    }

    const formValues = this.taskForm.value;
    const executorCuids = this.selectedExecutors.map(userId => {
      const userOption = this.shamsyUsersOptions.find(option => option.id === userId);
      return userOption ? userOption.cuid : userId;
    });

    const formData = {
      ...formValues,
      actionPlanId: this.actionPlanId,
      //executorsIds: this.selectedExecutors
      executorsIds: executorCuids
    };

    console.log('Données à envoyer:', formData);

    const taskMethod = this.dialogMode === 'create'
      ? this.taskService.createTask(formData)
      : this.taskService.updateTask(this.selectedTask.id, formData);

    taskMethod
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const successMessage = this.dialogMode === 'create'
            ? 'Tâche créée avec succès'
            : 'Tâche mise à jour avec succès';

          this.toastr.success(successMessage);
          this.showDialog = false;
          this.loadTasks();
        },
        error: (error) => {
          const errorMessage = this.dialogMode === 'create'
            ? 'Erreur lors de la création de la tâche'
            : 'Erreur lors de la mise à jour de la tâche';

          this.toastr.error(error.message || errorMessage);
        }
      });
  }

  confirmDeleteTask(task: any) {
    this.taskToDelete = task;
    this.confirmationVisible = true;
  }
  deleteTask() {
    if (this.taskToDelete) {
      this.taskService.deleteTask(this.taskToDelete.id).subscribe(
        () => {
          this.tasks = this.tasks.filter(
            task => task.id !== this.taskToDelete.id
          );
          this.confirmationVisible = false;
          this.taskToDelete = null;
          this.toastr.success('Tâche supprimée avec succès');
        },
        error => {
          console.error('Erreur lors de la suppression', error);
          this.toastr.error('Erreur lors de la suppression de la tâche');
          this.confirmationVisible = false;
        }
      );
    }
  }


  ngAfterViewInit() {
    if (this.showProgressModal && this.progressData) {
      this.renderCharts();
    }
  }
  renderCharts() {
    setTimeout(() => {
      this.createPieChart();
      this.createBarChart();
      this.chartLoaded = true;
    }, 100);
  }

  loadProgressData() {
    this.progressData = null;
    this.chartLoaded = false;

    if (!this.actionPlanId || !this.projectId) {
      this.toastr.error('Id Projet ou plan action non trouvé');
      return;
    }

    this.actionPlansService.getProjectActionPlansProgress(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            const currentActionPlanProgress = response.data.find(
              (item: ActionPlanProgressDTO) => item.actionPlanId === this.actionPlanId
            );

            if (currentActionPlanProgress) {
              this.progressData = currentActionPlanProgress;

              if (this.showProgressModal && this.pieChartRef && this.barChartRef) {
                this.renderCharts();

              }
            } else {
              this.toastr.warning('Pas de donnée de progression trouvée pour ce plan d\'action');
              this.showProgressModal = false;
            }
          } else {
            this.toastr.error('Format de réponse incorrect');
            this.showProgressModal = false;
          }
        },
        error: (error:any) => {
          this.toastr.error(error.message || 'Erreur CHARGEMENT..');
          this.showProgressModal = false;
        }
      });
  }

  createPieChart() {
    if (!this.pieChartRef || !this.progressData) return;

    const ctx = this.pieChartRef.nativeElement.getContext('2d');

    if (this.pieChart) {
      this.pieChart.destroy();
    }

    this.pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Terminées', 'En cours', 'Planifiées', 'Bloquées'],
        datasets: [{
          data: [
            this.progressData.completedTasks,
            this.progressData.inProgressTasks,
            this.progressData.plannedTasks,
            this.progressData.blockedTasks
          ],
          backgroundColor: [
            'rgba(40, 167, 69, 0.7)',  // green
            'rgba(0, 123, 255, 0.7)',  // blue
            'rgba(255, 153, 0, 0.7)',  // orange
            'rgba(220, 53, 69, 0.7)'   // red
          ],
          borderColor: [
            'rgba(40, 167, 69, 1)',
            'rgba(0, 123, 255, 1)',
            'rgba(255, 153, 0, 1)',
            'rgba(220, 53, 69, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
          }
        }
      }
    });
  }

  createBarChart() {
    if (!this.barChartRef || !this.progressData) return;

    const ctx = this.barChartRef.nativeElement.getContext('2d');

    if (this.barChart) {
      this.barChart.destroy();
    }

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Terminées', 'En cours', 'Planifiées', 'Bloquées'],
        datasets: [{
          label: 'Nombre de tâches',
          data: [
            this.progressData.completedTasks,
            this.progressData.inProgressTasks,
            this.progressData.plannedTasks,
            this.progressData.blockedTasks
          ],
          backgroundColor: [
            'rgba(40, 167, 69, 0.7)',
            'rgba(0, 123, 255, 0.7)',
            'rgba(255, 153, 0, 0.7)',
            'rgba(220, 53, 69, 0.7)'
          ],
          borderColor: [
            'rgba(40, 167, 69, 1)',
            'rgba(0, 123, 255, 1)',
            'rgba(255, 153, 0, 1)',
            'rgba(220, 53, 69, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        },
        plugins: {
          legend: {
            display: false,
          }
        }
      }
    });
  }

  viewActionPlanDashboard() {
    console.log("Avant showProgressModal");
    this.showProgressModal = true;
    console.log("Avant loadProgressData");
    console.log("Type de données:", typeof this.progressData, this.progressData);
    this.loadProgressData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.pieChart) {
      this.pieChart.destroy();
    }

    if (this.barChart) {
      this.barChart.destroy();
    }
  }


}
