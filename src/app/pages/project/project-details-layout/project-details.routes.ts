import {Routes} from "@angular/router";
import { RisqueActionPlansComponent } from "./risque-action-plans/risque-action-plans.component";

const projectDetailsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./project-overview/project-overview.component').then(value => value.ProjectOverviewComponent)
  },
  {
    path: 'phases',
    loadComponent: () => import('./project-phases/project-phases.component').then(value => value.ProjectPhasesComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./project-phases/phases-overview/phases-overview.component').then(value => value.PhasesOverviewComponent),
      },
      {
        path: ':phaseId',
        loadComponent: () => import('./project-phases/phase-details/phase-details.component').then(value => value.PhaseDetailsComponent),
      }
    ]
  },
  {
    path: 'events',
    loadComponent: () => import('./project-events/project-events.component').then(value => value.ProjectEventsComponent)
  },
  {
    path: 'budget',
    loadComponent: () => import('./project-budget/project-budget.component').then(value => value.ProjectBudgetComponent)
  },
  {
    path: 'product-orders',
    loadComponent: () => import('./project-po/project-po.component').then(value => value.ProjectPoComponent)
  },
  {
    path: 'pv',
    loadComponent: () => import('./project-pv/project-pv.component').then(value => value.ProjectPvComponent)
  },
  {
    path: 'intervenants',
    loadComponent: () => import('./project-intervenants/project-intervenants.component').then(value => value.ProjectIntervenantsComponent)
  },
  {
    path: 'risques',
    loadComponent: () => import('./project-risques/project-risques.component').then(value => value.ProjectRisquesComponent)
  },
  {
    path: 'taches',
    loadComponent: () => import('./project-user-tasks/project-user-tasks.component').then(value => value.ProjectUserTasksComponent)
  },

  {
    title: 'Plans d\'action du projet',
    path: 'action-plans',
    loadComponent: () => import('./action-plans/action-plans.component').then(m => m.ActionPlansComponent)
  },
  {
    path: 'risques/risque-action-plans/:risqueId/tasks/:actionPlanId',
    loadComponent: () => import('./project-tasks/project-tasks.component').then(value => value.ProjectTasksComponent)
  },

  {
    path: 'risques/risque-action-plans/:risqueId',
    loadComponent: () => import('./risque-action-plans/risque-action-plans.component').then(value => value.RisqueActionPlansComponent)
  },

];


export default projectDetailsRoutes;
