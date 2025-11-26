import { Routes } from '@angular/router';
import { AppLayoutComponent } from "./layout/app-layout/app-layout.component";
import { PaddedContainerComponent } from "./partials/padded-container/padded-container.component";
import adminRoutes from "./pages/admin/admin.routes";
import { intervenantsRoutes } from "./pages/intervenant/intervenants.routes";
import { AuthGuard } from "./@core/security/guard/auth.guard";

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    // canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: PaddedContainerComponent,
        // canActivate: [AuthGuard],
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'dashboard',
          },

          {
            title: 'GPE - Tableau de bord',
            path: 'dashboard',
            loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
          },

          {
            title: 'Mon compte',
            path: 'profile',
            loadComponent: () => import('./pages/my-account/my-account.component').then(m => m.MyAccountComponent)
          },
          {
            title: 'Mon compte',
            path: 'my-account',
            loadComponent: () => import('./pages/my-account/my-account.component').then(m => m.MyAccountComponent)
          },

          {
            title: 'Gestion - Utilisateurs',
            path: 'gestion/utilisateurs',
            loadComponent: () => import('./pages/utilisateurs/utilisateurs.component').then(m => m.UtilisateursComponent)
          },
          {
            title:'Fiches-Animaux',
            path:'fiches-animaux',
            loadComponent: () => import('./pages/fiches-animaux/fiches-animaux.component').then(m => m.FichesAnimauxComponent)
          },
            {
            title:'suivi-reproduction',
            path:'suivi-reproduction',
            loadComponent: () => import('./pages/suivi-reproduction/suivi-reproduction.component').then(m => m.SuiviReproductionComponent)
          },
 {
            title:'alimentation',
            path:'alimentation',
            loadComponent: () => import('./pages/alimentation/alimentation.component').then(m => m.AlimentationComponent)
          },
           {
            title:'sante-soins',
            path:'sante-soins',
            loadComponent: () => import('./pages/sante-soins/sante-soins.component').then(m => m.SanteSoinsComponent)
          },
          {
            title:'ventes',
            path:'ventes',
            loadComponent: () => import('./pages/ventes/ventes.component').then(m => m.VentesComponent)
          },
           {
            title:'charges',
            path:'charges',
            loadComponent: () => import('./pages/chargesdiverses/chargesdiverses.component').then(m => m.ChargesdiversesComponent)
          },
           {
            title:'syntheses-financieres',
            path: 'syntheses-financieres',
            loadComponent: () => import('./pages/syntheses-financieres/syntheses-financieres.component').then(m => m.SynthesesFinancieresComponent)
          },
          ...intervenantsRoutes
        ]
      },

      {
        title: 'Paramètres',
        path: 'settings',
        loadComponent: () => import('./pages/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        children: adminRoutes
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    title: 'Gestion de la ferme - Connexion'
  }
];


















