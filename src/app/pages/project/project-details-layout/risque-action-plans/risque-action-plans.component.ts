import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { RisqueService } from '../../../../@core/service/risque.service';
import{ActionPlansService} from '../../../../@core/service/action-plans.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { BudgetService } from '../../../../@core/service/budget.service';
import { HasPermissionDirective } from '../../../../@core/security/directives/has-permission.directive';
import { ProjectService } from '../../../../@core/service/project.service';
@Component({
  selector: 'app-risque-action-plans',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputTextareaModule,
    CalendarModule,
    DropdownModule,
    InputNumberModule,
    ReactiveFormsModule,
    ConfirmDialogModule,
    HasPermissionDirective,
    RouterModule
  ],
  providers: [ConfirmationService],
  templateUrl: './risque-action-plans.component.html',
  styleUrl: './risque-action-plans.component.scss'
})
export class RisqueActionPlansComponent implements OnInit {
  actionPlans: any[] = [];
  loading: boolean = false;
  risk: any = null;
  riskId: string = '';
  projectId: string = '';
  // PA en cours
  actionPlanToEdit: any = null;
  destroy$ = new Subject<void>();

  // Dialog properties
  showDialog: boolean = false;
  dialogMode: 'create' | 'edit' = 'create';
  actionPlanForm: FormGroup;
  saving: boolean = false;

  confirmationVisible: boolean = false;
  actionPlanToDelete: any = null;
  loadingBudgetLines: boolean = false;
  budgetLines: any[] = [];
  showExpenseFields: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private risqueService: RisqueService,
    private actionPlansService: ActionPlansService,
    private confirmationService: ConfirmationService,
    private toastr: ToastrService,
    private budgetService: BudgetService,
    private ps: ProjectService
  ) {
    this.actionPlanForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      deadLine: [null, Validators.required],
      risk: [null, Validators.required],
      depense: this.fb.group({
        amount: [null],
        dateDepense: [null],
        label: [''],
        description: [''],
        annualBudgetId: [null]
      })
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.riskId = params['risqueId'];

      this.ps.currentProjectId$.subscribe(projectId => {
        this.projectId = projectId;

        if (this.riskId && this.projectId) {

          this.loadActionPlans();
        }
      });
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRisk() {
    this.loading = true;
    this.risqueService.getProjectRiskById(this.riskId, this.projectId).subscribe({
      next: (response: any) => {
        this.risk = response.data;
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error('Erreur lors du chargement du risque');
        console.error('Erreur lors du chargement du risque:', error);
        this.loading = false;
      }
    });
  }

  loadActionPlans() {
    this.loading = true;
    this.actionPlansService.getActionPlansByRisk(this.riskId).subscribe({
      next: (response: any) => {
        this.actionPlans = response.data;
        this.loading = false;
      },
      error: (error:any) => {
        this.toastr.error('Erreur lors du chargement des plans d\'action');
        console.error('Erreur lors du chargement des plans d\'action:', error);
        this.loading = false;
      }
    });
  }

  openCreateDialog() {
    this.dialogMode = 'create';
    this.actionPlanForm.reset();

    // objet risk
    if (this.risk) {
      this.actionPlanForm.patchValue({
        risk: this.risk,
        title: '',
        description: '',
        deadLine: null,
        depense: {
          amount: null,
          dateDepense: null,
          label: '',
          description: '',
          annualBudgetId: null
        }
      });
    } else {
      this.actionPlanForm.patchValue({
        risk: { id: this.riskId },
        title: '',
        description: '',
        deadLine: null
      });
    }

    this.showExpenseFields = false;
    this.showDialog = true;
  }

  openEditDialog(actionPlan: any) {
    this.dialogMode = 'edit';
    this.actionPlanForm.reset();
    // action plan à éditer
    this.actionPlanToEdit = actionPlan;

    this.showExpenseFields = !!actionPlan.depense;

    this.actionPlanForm.patchValue({
      title: actionPlan.title,
      description: actionPlan.description,
      deadLine: actionPlan.deadLine ? new Date(actionPlan.deadLine) : null,
      risk: actionPlan.risk?.id || this.riskId,
      depense: actionPlan.depense ? {
        amount: actionPlan.depense.amount,
        dateDepense: actionPlan.depense.dateDepense ? new Date(actionPlan.depense.dateDepense) : null,
        label: actionPlan.depense.label,
        description: actionPlan.depense.description,
        annualBudgetId: actionPlan.depense.annualBudgetId
      } : {}
    });

    this.actionPlanToDelete = actionPlan;
    this.showDialog = true;
  }



  toggleExpenseFields() {
    this.showExpenseFields = !this.showExpenseFields;
        if (this.showExpenseFields && this.budgetLines.length === 0) {
      this.loadBudgetLines();
    }
  }

  submitActionPlan() {
    this.saving = true;
    if (this.actionPlanForm.invalid) {
      this.toastr.warning('Veuillez remplir tous les champs obligatoires');
      return;
    }

    interface FormDataType {
      title: string;
      description: string;
      deadLine: any;
      projectId: string;
      riskId: string;
      depense?: any;
    }

    let riskId = '';
    if (typeof this.actionPlanForm.value.risk === 'object' && this.actionPlanForm.value.risk !== null) {
      riskId = this.actionPlanForm.value.risk.id;
    } else if (typeof this.actionPlanForm.value.risk === 'string') {
      riskId = this.actionPlanForm.value.risk;
    } else {
      riskId = this.riskId;
    }

    const formData: FormDataType = {
      title: this.actionPlanForm.value.title,
      description: this.actionPlanForm.value.description,
      deadLine: this.actionPlanForm.value.deadLine,
      projectId: this.projectId,
      riskId: riskId
    };

    if (this.showExpenseFields) {
      formData.depense = this.actionPlanForm.value.depense;
    }

    // Validation des dates
    if (this.actionPlanForm.value.startedAt &&
        new Date(this.actionPlanForm.value.startedAt) > new Date(this.actionPlanForm.value.deadLine)) {
      this.toastr.error('La date de début doit être antérieure à la date de fin');
      this.saving = false;
      return;
    }

    console.log('Données envoyées:', formData);

    const actionMethod = this.dialogMode === 'create'
      ? this.actionPlansService.create(formData)
      : this.actionPlansService.updateActionPlan(this.actionPlanToEdit.id, formData);

    actionMethod.subscribe({
      next: () => {
        const successMessage = this.dialogMode === 'create'
          ? 'Plan d\'action créé avec succès'
          : 'Plan d\'action mis à jour avec succès';

        this.toastr.success(successMessage);
        this.showDialog = false;
        this.saving = false;
        this.loadActionPlans();
      },
      error: (error) => {
        const errorMessage = this.dialogMode === 'create'
          ? 'Erreur lors de la création du plan d\'action'
          : 'Erreur lors de la mise à jour du plan d\'action';
        this.saving = false;
        this.toastr.error(error.message || errorMessage);
        console.error('Erreur détaillée:', error);
      }
    });
  }

  confirmDeleteActionPlan(actionPlan: any) {
    this.actionPlanToDelete = actionPlan;
    this.confirmationVisible = true;
  }

  deleteActionPlan() {
    if (!this.actionPlanToDelete) return;

    this.loading = true;
    this.actionPlansService.deleteActionPlan(this.actionPlanToDelete.id).subscribe({
      next: () => {
        this.confirmationVisible = false;
        this.toastr.success('Plan d\'action supprimé avec succès');
        this.loadActionPlans();
      },

      error: (error) => {
        this.loading = false;
        this.toastr.error('Erreur lors de la suppression du plan d\'action');
        console.error('Erreur:', error);
      }
    });
  }

  // goToTasks(actionPlanId: string) {
  //   this.router.navigate(['action-plans-task', actionPlanId], { relativeTo: this.route });
  // }

  goToTasks(actionPlanId: string) {
   this.router.navigate(['action-plans-task', actionPlanId], { relativeTo: this.route });
    this.router.navigate([
      '/projects/details',
      this.projectId,
      'risques',
      'risque-action-plans',
      this.riskId,
      'tasks',
      actionPlanId
    ], {
      queryParams: {
        risqueId: this.riskId,
        projectId: this.projectId
      }
    }).then(
      success => console.log('Navigation OK'),
      error => console.error('Erreurnavigation:', error)
    );
  }



  // Méthode pour charger les lignes budgétaires
  loadBudgetLines() {
    this.loadingBudgetLines = true;
    this.budgetService.getAllBudgetLines(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.budgetLines = response.data || [];
          this.loadingBudgetLines = false;
        },
        error: (error:any) => {
          this.toastr.error('Erreur lors du chargement des lignes budgétaires');
          console.error('Erreur lors du chargement des lignes budgétaires:', error);
          this.loadingBudgetLines = false;
        }
      });
  }
}
