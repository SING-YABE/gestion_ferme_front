import { Routes } from "@angular/router";
import { AuthGuard } from "../../@core/security/guard/auth.guard";

export const intervenantsRoutes: Routes = [
  {
    path: 'users',
    data: { permissions: 'create_user' },
    canActivate: [AuthGuard],
    loadComponent: () => import('./users-management/users-management.component').then(m => m.UsersManagementComponent)
  },

  {
    path: 'typeAnimaux',
    loadComponent: () => import("./type-animaux/type-animaux.component").then(value => value.TypeAnimalComponent)
  },
  {
    path: 'batiments',
    loadComponent: () => import("./batiment/batiment.component").then(value => value.BatimentComponent)
  },
  {
    path: 'typeVente',
    loadComponent: () => import("./typevente/typevente.component").then(value => value.TypeventeComponent)
  },
  {
    path: 'etatSante',
    loadComponent: () => import("./etat-sante/etat-sante.component").then(value => value.EtatSanteComponent)
  },
  {
    path: 'typeAliment',
    loadComponent: () => import("./type-aliment/type-aliment.component").then(value => value.TypeAlimentComponent)

  },
  {
    path: 'fournisseurs',
    loadComponent: () => import("./fournisseur/fournisseur.component").then(value => value.FournisseurComponent)
  },
  {
    path: 'ingredients',
    loadComponent: () => import("./ingredients/ingredients.component").then(value => value.IngredientsComponent)
  },
  {
    path: 'traitement',
    loadComponent: () => import("./traitement/traitement.component").then(value => value.TraitementComponent)
  },
  {
    path: 'typeDepense',
    loadComponent: () => import("./type-depense/type-depense.component").then(value => value.TypeDepenseComponent)
  },
  {
    path: 'chargesDiverses',
    loadComponent: () => import("./chargesdiverses/chargesdiverses.component").then(value => value.ChargesdiversesComponent)
  },
]
