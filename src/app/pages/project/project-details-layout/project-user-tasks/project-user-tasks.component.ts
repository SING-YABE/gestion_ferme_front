import { Component } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { PrimeTemplate, ConfirmationService } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../../../@core/service/project.service';
import { AuthService } from '../../../../@core/service/auth.service';
import { TaskService } from '../../../../@core/service/task.service';
import {BadgeModule} from "primeng/badge";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ToastrService } from 'ngx-toastr';
import { ProjectMembershipService } from '../../../../@core/service/project-membership.service';

@Component({
  selector: 'app-project-user-tasks',
  standalone: true,
  imports: [
    ChartModule,
    ButtonDirective,
    ProgressBarModule,
    FlexModule,
    InputTextModule,
    PrimeTemplate,
    TableModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    CommonModule,
    BadgeModule,
    MultiSelectModule,
    CalendarModule,
    DropdownModule,
    ReactiveFormsModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './project-user-tasks.component.html',
  styleUrl: './project-user-tasks.component.scss'
})
export class ProjectUserTasksComponent {
  processing = false;

  loading: boolean = false;
  taches: any[] = [];
  projectId: string = "";
  user: any = {};
  filteredTasks: any[] = [];
  showingMyTasks: boolean = false;
  displayTaskModal: boolean = false;
  editModal: boolean = false;
  selectedTask: any = null;
  displayNewTaskModal: boolean = false;
  newTaskForm?: FormGroup;
  taskUpdateForm?: FormGroup;
  usersOptions = [];
  priorityOptions = [
    { label: 'Basse', value: 'LOW' },
    { label: 'Moyenne', value: 'MEDIUM' },
    { label: 'Haute', value: 'HIGH' }
  ];

  statusOptions = [
    { label: 'Plannifié', value: 'PLANNED' },
    { label: 'En cours', value: 'IN_PROGRESS' },
    { label: 'Terminée', value: 'COMPLETED' },
    { label: 'Bloqué', value: 'BLOCKED' }
  ]


  constructor(
        private ps: ProjectService,
        private authService: AuthService,
        private taskService: TaskService,
        private cs: ConfirmationService,
        private messageService: MessageService,
        private fb : FormBuilder,
        private toastr: ToastrService,
        private psm: ProjectMembershipService,

  ){

    // this.newTaskForm = this.fb.group({
    //   title: ['', Validators.required],
    //   description: [''],
    //   plannedEndDate: ['', Validators.required],
    //   priority: ['', Validators.required],
    //   projectId: [this.projectId],
    //   executorsIds: [[]]
    // });

    // this.taskUpdateForm = this.fb.group({
    //   title: ['', Validators.required],
    //   description: [''],
    //   actualEndDate: ['', Validators.required],
    //   plannedEndDate: ['', Validators.required],
    //   priority: ['', Validators.required],
    //   status: ['TODO', Validators.required],
    //   projectId: [this.projectId],
    //   executors: [[]]
    // });

  }



  ngOnInit() {
    this.ps.currentProjectId$.subscribe(projectId => {
      this.projectId = projectId;
      const tokenData = this.authService.getTokenData();
      this.user = tokenData || {};

      //Initialistion des forms
      this.newTaskForm = this.fb.group({
        title: ['', Validators.required],
        description: [''],
        plannedEndDate: ['', Validators.required],
        priority: ['', Validators.required],
        projectId: [this.projectId],
        executorsIds: [[]]
      });

      this.taskUpdateForm = this.fb.group({
        title: ['', Validators.required],
        description: [''],
        actualEndDate: ['', Validators.required],
        plannedEndDate: ['', Validators.required],
        priority: ['', Validators.required],
        status: ['TODO', Validators.required],
        projectId: [this.projectId],
        executors: [[]]
      });

      if (projectId && this.user.id) {
        this.getUserTasks(projectId, this.user.id);
      }
    });

    this.getMembersOfProject();


  }


  getMembersOfProject() {
    this.psm.getMembersOfProject2(this.projectId).subscribe({
      next: (value: any) => {
        if (value && value.data) { // Vérifie que "data" existe
          this.usersOptions = value.data;
          console.log("Liste des intervenants chargée :", this.usersOptions);
        } else {
          this.usersOptions = []; // Assure-toi d'avoir un tableau vide en cas d'erreur
        }
      },
      error: (error) => {
        this.toastr.error(error.error.message ?? error.message);
      }
    });
  }


  getUserTasks(projectId: string, userId: string) {
    this.loading = true;
    this.taskService.getTasksByProjectAndUser(projectId, userId).subscribe({
      next: (response: any) => {
        this.taches = response.data;


        console.log("Liste des tâches récupérées :", this.taches);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({severity: 'error', summary: 'Erreur', detail: 'Erreur lors du chargement des tâches'});
      }
    });
  }

  showTaskDetails(tache: any) {
    this.selectedTask = tache;
    this.displayTaskModal = true;
  }


  voirMesTaches() {
    this.loading = true;
    this.showingMyTasks = true;

    if (!this.showingMyTasks) {
      this.filteredTasks = [...this.taches];
    }

    this.taskService.getConnectedUserTaskForAProject(this.projectId).subscribe({
      next: (response: any) => {
        this.taches = response.data;
        console.log("Mes tAches :", this.taches);
        this.loading = false;
      },
      error: (err) => {
        console.error("Erreur lors de la recuperation de mes tâches :", err);
        this.loading = false;
      }
    });
  }


  voirToutesLesTaches() {
    if (this.showingMyTasks && this.filteredTasks.length > 0) {
      // Restaure toutes les tâches
      this.taches = [...this.filteredTasks];
      this.showingMyTasks = false;
    } else {
      // Toutes les tâches
      this.getUserTasks(this.projectId, this.user.id);
    }
  }

  toggleTaskView() {
    if (this.showingMyTasks) {
      this.showingMyTasks = false;
      if (this.filteredTasks.length > 0) {
        this.taches = [...this.filteredTasks];
      } else {
        this.getUserTasks(this.projectId, this.user.id);
      }
    } else {
      this.showingMyTasks = true;
      this.filteredTasks = [...this.taches];
      this.loading = true;
      this.taskService.getConnectedUserTaskForAProject(this.projectId).subscribe({
        next: (response: any) => {
          this.taches = response.data;
          console.log("Mes tâches :", this.taches);
          this.loading = false;
        },
        error: (err) => {
          console.error("Erreur lors de la récupération de mes tâches :", err);
          this.loading = false;
        }
      });
    }
  }


  deleteTask(taskId: string) {
    this.cs.confirm({
      icon: "pi pi-exclamation-triangle",
      message: "Souhaitez-vous vraiment supprimer cette tâche ?",
      header: 'Confirmation',
      defaultFocus: 'reject',
      acceptLabel: 'Oui je confirme',
      rejectLabel: 'Non',
      acceptButtonStyleClass: 'p-button-danger outlined p-button-sm',
      rejectButtonStyleClass: 'p-button-sm mr-2',
      accept: () => {
        this.loading = true;
        this.taskService.deleteTask(taskId).subscribe({
          next: (response) => {
            this.messageService.add({severity: 'success', summary: 'Succès', detail: 'Tâche supprimée avec succès'});
            this.getUserTasks(this.projectId, this.user.id);
          },
          error: (err) => {
            this.loading = false;
            this.messageService.add({severity: 'error', summary: 'Erreur', detail: err.message || 'Erreur lors de la suppression de la tâche'});
          }
        });
      }
    });
  }

  showNewTaskModal() {
    this.displayNewTaskModal = true;
    // Ici vous pourriez aussi charger la liste des utilisateurs si nécessaire
  }

  createNewTask() {
    if (this.newTaskForm!!.valid) {
      const newTaskData = this.newTaskForm!!.value;
      console.log ("Donnée saisi du formulaire",newTaskData)
      this.taskService.createTask(newTaskData).subscribe({
        next: (value: any) => {
          this.handleOk(value)
        },error: err => {
          this.processing = false;
          this.toastr.error(err.error?.message??err.message);
        }
      })
      this.displayNewTaskModal = false;
    }
  }
  private handleOk(value: any) {
    this.processing = false;
    this.displayNewTaskModal = false;
    this.newTaskForm!!.reset();
    this.getUserTasks(this.projectId, this.user.id);
    this.toastr.success("Tâche crée avec succès !");
  }
  private chargerFormulaireT() {
    this.taskUpdateForm!!.patchValue({
      title: this.selectedTask.title,
      description: this.selectedTask.description,
      plannedEndDate: this.selectedTask.plannedEndDate,
      actualEndDate: this.selectedTask.actualEndDate,

    })
  }

  private chargerFormulaire() {
    this.taskUpdateForm!!.patchValue({
      id: this.selectedTask.id,
      title: this.selectedTask.title,
      description: this.selectedTask.description,
      plannedEndDate: new Date(this.selectedTask.plannedEndDate),
      actualEndDate: this.selectedTask.actualEndDate ? new Date(this.selectedTask.actualEndDate) : null,
      status: this.selectedTask.status,
      priority: this.selectedTask.priority,
      actionPlanId: this.selectedTask.actionPlanId,
      authorId: this.selectedTask.authorId,
      isDelete: this.selectedTask.isDelete
    });
  }

  editTask(tache: any) {
    this.selectedTask = tache;
    console.log("tâche sélectionné:", this.selectedTask);
    this.editModal = true;
    this.chargerFormulaire();
  }



  private handleUpdateOk(value: any) {
    this.getUserTasks(this.projectId, this.user.id);
    this.editModal = false;
    this.taskUpdateForm!!.reset();
    this.processing = false;

    this.toastr.success("Tâche mis à jour avec succès !");
  }


  handleUpdateTask() {
    if (this.taskUpdateForm!!.valid) {
      this.processing = true;
      const taskUpdateForm = { ...this.taskUpdateForm!!.value };
      this.taskService.updateTask(this.selectedTask.id,taskUpdateForm).subscribe({
        next: (value: any) => {
          this.getUserTasks(this.projectId, this.user.id);

          this.handleUpdateOk(value)
        },error: err => {
          this.toastr.error(err.error?.message??err.message);
        }
      })
      console.log("Données du formulaire récupérées :", taskUpdateForm);
    } else {
      console.warn("Formulaire invalide !");
    }
  }




}






