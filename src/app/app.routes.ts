import { Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app-layout/app-layout.component';
import { PaddedContainerComponent } from './partials/padded-container/padded-container.component';
import adminRoutes from './pages/admin/admin.routes';
import { intervenantsRoutes } from './pages/intervenant/intervenants.routes';
import { authGuard } from './@core/security/guard/auth.guard';
import { Roles } from './@core/security/roles.constants';
import { Permissions } from './@core/security/permissions.constants';
// note: SuperAdminComponent importé en lazy load ci-dessous

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],   // toutes les routes enfants nécessitent d'être connecté
    children: [
      {
        path: '',
        component: PaddedContainerComponent,
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

          // ─── Tableau de bord (tous les rôles) ─────────────────────────
          {
            title: 'GPE - Tableau de bord',
            path: 'dashboard',
            loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
          },

          // ─── Mon compte (tous les rôles) ──────────────────────────────
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

          // ─── Gestion utilisateurs (Admin seulement) ───────────────────
          {
            title: 'Gestion - Utilisateurs',
            path: 'gestion/utilisateurs',
            canActivate: [authGuard],
            data: { roles: [Roles.ADMINISTRATEUR] },
            loadComponent: () => import('./pages/utilisateurs/utilisateurs.component').then(m => m.UtilisateursComponent)
          },

          // ─── Animaux (tous les rôles connectés) ───────────────────────
          {
            title: 'Fiches Animaux',
            path: 'fiches-animaux',
            canActivate: [authGuard],
            data: { permissions: [Permissions.ANIMAL_READ] },
            loadComponent: () => import('./pages/fiches-animaux/fiches-animaux.component').then(m => m.FichesAnimauxComponent)
          },

          // ─── Déplacements (Responsable+) ──────────────────────────────
          {
            title: 'Déplacements',
            path: 'deplacements',
            canActivate: [authGuard],
            data: { permissions: [Permissions.DEPLACEMENT_READ] },
            loadComponent: () => import('./pages/deplacement/deplacement.component').then(m => m.DeplacementComponent)
          },

          // ─── Reproduction (Responsable+) ──────────────────────────────
          {
            title: 'Suivi Reproduction',
            path: 'suivi-reproduction',
            canActivate: [authGuard],
            data: { permissions: [Permissions.REPRODUCTION_READ] },
            loadComponent: () => import('./pages/suivi-reproduction/suivi-reproduction.component').then(m => m.SuiviReproductionComponent)
          },

          // ─── Alimentation (tous les rôles connectés) ──────────────────
          {
            title: 'Alimentation',
            path: 'alimentation',
            canActivate: [authGuard],
            data: { permissions: [Permissions.ALIMENTATION_READ] },
            loadComponent: () => import('./pages/alimentation/alimentation.component').then(m => m.AlimentationComponent)
          },

          // ─── Santé & Soins (tous les rôles connectés) ─────────────────
          {
            title: 'Santé & Soins',
            path: 'sante-soins',
            canActivate: [authGuard],
            data: { permissions: [Permissions.SOIN_READ] },
            loadComponent: () => import('./pages/sante-soins/sante-soins.component').then(m => m.SanteSoinsComponent)
          },

          // ─── Ventes (Responsable+) ────────────────────────────────────
          {
            title: 'Ventes',
            path: 'ventes',
            canActivate: [authGuard],
            data: { permissions: [Permissions.VENTE_READ] },
            loadComponent: () => import('./pages/ventes/ventes.component').then(m => m.VentesComponent)
          },

          // ─── Charges diverses (Responsable+) ──────────────────────────
          {
            title: 'Charges diverses',
            path: 'charges',
            canActivate: [authGuard],
            data: { permissions: [Permissions.CHARGE_READ] },
            loadComponent: () => import('./pages/chargesdiverses/chargesdiverses.component').then(m => m.ChargesdiversesComponent)
          },

          // ─── Synthèse financière (Responsable+) ───────────────────────
          {
            title: 'Synthèses financières',
            path: 'syntheses-financieres',
            canActivate: [authGuard],
            data: { permissions: [Permissions.SYNTHESE_READ] },
            loadComponent: () => import('./pages/syntheses-financieres/syntheses-financieres.component').then(m => m.SynthesesFinancieresComponent)
          },

          // ─── Prédictions (Responsable+) ───────────────────────────────
          {
            title: 'Prédictions',
            path: 'predictions',
            canActivate: [authGuard],
            data: { roles: [Roles.ADMINISTRATEUR, Roles.GERANT, Roles.RESPONSABLE] },
            loadComponent: () => import('./pages/predictions/predictions.component').then(m => m.PredictionsComponent)
          },

          // ─── Aide à la décision (Responsable+) ───────────────────────
          {
            title: 'Aide à la décision',
            path: 'aide-decision',
            canActivate: [authGuard],
            data: { roles: [Roles.ADMINISTRATEUR, Roles.GERANT, Roles.RESPONSABLE] },
            loadComponent: () => import('./pages/sad/sad.component').then(m => m.SadComponent)
          },

          // ─── Gestion des tâches (tous rôles connectés) ───────────────
          {
            title: 'Gestion des tâches',
            path: 'taches',
            canActivate: [authGuard],
            data: { permissions: [Permissions.TACHE_READ_OWN] },
            loadComponent: () => import('./pages/taches/taches.component').then(m => m.TachesComponent)
          },

          ...intervenantsRoutes,

          // ─── Abonnement (dans le layout principal) ──────────────────
          {
            path: 'abonnement',
            redirectTo: 'abonnement/statut',
            pathMatch: 'full'
          },
          {
            path: 'abonnement/statut',
            title: 'Mon abonnement',
            canActivate: [authGuard],
            data: { roles: [Roles.ADMINISTRATEUR] },
            loadComponent: () => import('./pages/abonnement/statut-abonnement.component').then(m => m.StatutAbonnementComponent)
          },
          {
            path: 'abonnement/payer',
            title: 'Souscrire un abonnement',
            canActivate: [authGuard],
            data: { roles: [Roles.ADMINISTRATEUR] },
            loadComponent: () => import('./pages/abonnement/paiement.component').then(m => m.PaiementComponent)
          },
        ]
      },

      // ─── Paramètres (Gérant + Admin) ────────────────────────────────
      {
        title: 'Paramètres',
        path: 'settings',
        canActivate: [authGuard],
        data: { roles: [Roles.ADMINISTRATEUR, Roles.GERANT] },
        loadComponent: () => import('./pages/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        children: adminRoutes
      },
    ],
  },

  // ─── Console Super Admin (route standalone, hors AppLayout) ────────
  {
    path: 'super-admin',
    title: 'Super Admin — PigFarm SaaS',
    canActivate: [authGuard],
    data: { roles: [Roles.SUPER_ADMIN] },
    loadComponent: () => import('./pages/super-admin/super-admin.component').then(m => m.SuperAdminComponent)
  },

  // ─── Changement de mot de passe obligatoire (après login direct) ──
  {
    path: 'change-password',
    title: 'Changer mon mot de passe',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/change-password/change-password.component').then(m => m.ChangePasswordComponent)
  },

  // ─── Pages publiques ──────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    title: 'Gestion de la ferme - Connexion'
  },
  {
    path: 'inscription',
    loadComponent: () => import('./pages/register-ferme/register-ferme.component').then(m => m.RegisterFermeComponent),
    title: 'Inscrire ma ferme'
  },
  {
    path: 'invitation',
    loadComponent: () => import('./pages/invitation/invitation.component').then(m => m.InvitationComponent),
    title: 'Activer mon compte'
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
    title: 'Accès refusé'
  },
  { path: '**', redirectTo: 'dashboard' }
];
