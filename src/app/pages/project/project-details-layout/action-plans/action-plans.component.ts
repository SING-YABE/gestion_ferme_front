import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../../../@core/service/project.service';
import { ActionPlansService } from '../../../../@core/service/action-plans.service';
import { ToastrService } from 'ngx-toastr';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import {faBuilding, faMoneyBills} from "@fortawesome/free-solid-svg-icons";
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmationService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {InputTextareaModule} from "primeng/inputtextarea";
import {CalendarModule} from "primeng/calendar";
import{InputNumberModule} from "primeng/inputnumber";
import {BudgetFormComponent} from "../project-budget/budget-form/budget-form.component";
import {HasPermissionDirective} from "../../../../@core/security/directives/has-permission.directive";
import { BudgetService } from '../../../../@core/service/budget.service';
@Component({
  selector: 'app-project-action-plans',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    FormsModule,
    InputNumberModule,
    ReactiveFormsModule,
    RouterLink,
    InputTextareaModule,
    CalendarModule,
    BudgetFormComponent,
    RouterLinkActive,
    HasPermissionDirective
  ],
  templateUrl: './action-plans.component.html',
  styleUrl: './action-plans.component.scss'
})
export class ActionPlansComponent implements OnInit {
  showExpenseFields: boolean = false;
  budgetLines: any[] = [];
  actionPlans: any[] = [];
  projectRisks: any[] = [];
  projectId: string = '';
  selectedActionPlan: any = null;
  showDialog = false;
  actionPlanForm: FormGroup;
  confirmationVisible = false;
  actionPlanToDelete: any = null;
  dialogMode: 'create' | 'edit' = 'create';

  loading: boolean = false;
  saving: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private actionPlansService: ActionPlansService,
    private projectService: ProjectService,
    private toastr: ToastrService,
    private budgetService: BudgetService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.actionPlanForm = this.fb.group({
      title: [null, [Validators.required, Validators.minLength(3)]],
      description: [null],
      deadLine: [null, Validators.required],
      risk: [null, Validators.required],
      depense: this.fb.group({
        amount: [null],
        label: [null],
        description: [null],
        dateDepense: [new Date()],
        annualBudgetId: [null]
      })
    });
  }

  ngOnInit(): void {
    // recup id du projet
    this.projectService.currentProjectId$
      .pipe(takeUntil(this.destroy$))
      .subscribe(projectId => {
        if (projectId) {
          this.projectId = projectId;
          this.loadActionPlans();
          this.loadProjectRisks();
        } else {
          this.toastr.warning('Aucun projet sélectionné');
        }
      });
      this.loadBudgetLines();
  }

  //  les lignes budgétaires
  loadBudgetLines() {
    this.budgetService.getAllAnnualBudgetWithoutPaginate()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (Array.isArray(response)) {
            this.budgetLines = response;
          } else if (response && Array.isArray(response.data)) {
            this.budgetLines = response.data;
          } else {
            this.budgetLines = [];
            console.error("Format de réponse inattendu:", response);
          }
        },
        error: (error: any) => {
          this.budgetLines = [];
          this.toastr.error('Erreur lors du chargement des lignes budgétaires');
        }
      });
  }

  toggleExpenseFields() {
    this.showExpenseFields = !this.showExpenseFields;

    const depenseGroup = this.actionPlanForm.get('depense') as FormGroup;

    if (this.showExpenseFields) {

      const amountControl = depenseGroup?.get('amount');
      const labelControl = depenseGroup?.get('label');
      const budgetIdControl = depenseGroup?.get('annualBudgetId');

      if (amountControl) amountControl.setValidators([Validators.required]);
      if (labelControl) labelControl.setValidators([Validators.required]);
      if (budgetIdControl) budgetIdControl.setValidators([Validators.required]);

      // MAJ les contrôles
      if (amountControl) amountControl.updateValueAndValidity();
      if (labelControl) labelControl.updateValueAndValidity();
      if (budgetIdControl) budgetIdControl.updateValueAndValidity();
    } else {
      // Sécu l'accès aux contrôles
      const amountControl = depenseGroup?.get('amount');
      const labelControl = depenseGroup?.get('label');
      const budgetIdControl = depenseGroup?.get('annualBudgetId');

      if (amountControl) {
        amountControl.clearValidators();
        amountControl.updateValueAndValidity();
      }

      if (labelControl) {
        labelControl.clearValidators();
        labelControl.updateValueAndValidity();
      }

      if (budgetIdControl) {
        budgetIdControl.clearValidators();
        budgetIdControl.updateValueAndValidity();
      }
    }
  }


  loadProjectRisks() {
    if (!this.projectId) {
      this.toastr.error('ID de projet non disponible');
      return;
    }

    this.projectService.getProjectRisks(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (Array.isArray(response)) {
            this.projectRisks = response;
          } else if (response && Array.isArray(response.data)) {
            this.projectRisks = response.data;
          } else {
            this.projectRisks = [];
            console.error("Format de réponse inattendu:", response);
          }
        },
        error: (error:any) => {
          this.projectRisks = [];
          this.toastr.error(error.message || 'Erreur lors du chargement des risques');
        }
      });
  }

  loadActionPlans() {
    this.loading = true;
    if (!this.projectId) {
      this.toastr.error('ID de projet non disponible');
      return;
    }

    this.actionPlansService.getActionPlansByProject(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (Array.isArray(response)) {
            this.actionPlans = response;
          } else if (response && Array.isArray(response.data)) {
            this.actionPlans = response.data;
          } else {
            this.actionPlans = [];
            console.error("Format de réponse inattendu:", response);
          }
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.actionPlans = [];
          this.toastr.error(error.message || 'Erreur lors du chargement des plans d\'action');
        }
      });
  }
  openCreateDialog() {
    this.dialogMode = 'create';
    this.selectedActionPlan = null;
    this.showExpenseFields = false;
    this.actionPlanForm.reset({
      startedAt: new Date().toISOString().split('T')[0],
      deadLine: null
    });
    this.showDialog = true;
  }

  openEditDialog(actionPlan: any) {
    this.dialogMode = 'edit';
    this.selectedActionPlan = actionPlan;

    // SI LE PA a une dépense associée
    this.showExpenseFields = !!actionPlan.depense;
    this.actionPlanForm.patchValue({
      ...actionPlan,
      startedAt: actionPlan.startedAt ? new Date(actionPlan.startedAt).toISOString().split('T')[0] : null,
      deadLine: actionPlan.deadLine ? new Date(actionPlan.deadLine).toISOString().split('T')[0] : null,
      risk: actionPlan.risk ? actionPlan.risk.id : null,

      depense: actionPlan.depense ? {
        amount: actionPlan.depense.amount,
        label: actionPlan.depense.label,
        description: actionPlan.depense.description,
        dateDepense: actionPlan.depense.dateDepense ? new Date(actionPlan.depense.dateDepense) : new Date(),
        annualBudgetId: actionPlan.depense.annualBudgetId
      } : {
        dateDepense: new Date()
      }
    });
    this.toggleExpenseFields();
    this.showDialog = true;
  }


  submitActionPlan() {
    this.saving = true;
    if (this.actionPlanForm.invalid) {
      this.toastr.warning('Veuillez remplir tous les champs obligatoires');
      return;
    }

    //  l'objet risk complet
    let riskObject = null;
    if (this.actionPlanForm.value.risk) {
      const selectedRisk = this.projectRisks.find(r => r.id === this.actionPlanForm.value.risk);
      if (selectedRisk) {
        riskObject = {
          id: selectedRisk.id,
          name: selectedRisk.name,
          description: selectedRisk.description,
          type: selectedRisk.type,
          probability: selectedRisk.probability,
          impact: selectedRisk.impact,
          mitigationPlan: selectedRisk.mitigationPlan,
          status: selectedRisk.status,
          projectId: selectedRisk.projectId,
          riskTypeId: selectedRisk.riskTypeId,
        };
      }
    }

    const formData = {
      ...this.actionPlanForm.value,
      projectId: this.projectId,
      risk: riskObject
    };

      // Ne pas envoyer les données de dépense
      //SI MASQUE
      if (!this.showExpenseFields) {
        delete formData.depense;
      }
   // Validation des dates
   if (new Date(formData.startedAt) > new Date(formData.deadLine)) {
    this.toastr.error('La date de début doit être antérieure à la date de fin');
    return;
  }

  const actionMethod = this.dialogMode === 'create'
    ? this.actionPlansService.create(formData)
    : this.actionPlansService.updateActionPlan(this.selectedActionPlan.id, formData);

  actionMethod
    .pipe(takeUntil(this.destroy$))
    .subscribe({
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
      }
    });

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  confirmDeleteActionPlan(actionPlan: any) {
    this.actionPlanToDelete = actionPlan;
    this.confirmationVisible = true;
  }

  countNotDeleted(tasks: any[]): number {
    return tasks.filter(task => !task.isDelete).length;
  }
  deleteActionPlan() {
    if (this.actionPlanToDelete) {
      this.actionPlansService.deleteActionPlan(this.actionPlanToDelete.id).subscribe(
        () => {
          this.actionPlans = this.actionPlans.filter(
            plan => plan.id !== this.actionPlanToDelete.id
          );
          this.confirmationVisible = false;
          this.actionPlanToDelete = null;
        },
        error => {
          console.error('Erreur lors de la suppression', error);
          this.confirmationVisible = false;
        }
      );
    }
  }

  openTaskDialog(actionPlan: any) {
    this.projectService.setCurrentActionPlanId(actionPlan.id);

  }


}
