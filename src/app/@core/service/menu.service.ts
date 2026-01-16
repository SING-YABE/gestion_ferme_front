import { Injectable } from '@angular/core';
import { IconDefinition } from "@fortawesome/free-regular-svg-icons";
import { 
  faChartLine,
  faGauge,            // Dashboard (plus moderne que faDashboard)
  faClipboardList,    // Fiches animaux
  faVenusMars,        // Reproduction (plus clair)
  faUtensils,         // Alimentation
  faKitMedical,       // Santé et soins
  faMoneyBillWave,    // Ventes
  faCircleDollarToSlot, // Charges
  faChartPie,         // Synthèses financières
  faUsers,            // Utilisateurs
  faUser,             // Mon compte
  faGears,            // Administration
  faCow,              // Type animaux
  faWarehouse,        // Bâtiment
  faHeartPulse,       // État de santé
  faWheatAwn,         // Type aliment
  faTruck,            // Fournisseur
  faCapsules,         // Traitement
  faDollarSign  ,
  faCarrot      // Type dépense
} from "@fortawesome/free-solid-svg-icons";

export interface ShamsyMenu {
  exact?: boolean;
  title: string;
  enabled?: boolean;
  icon?: IconDefinition;
  routerLink?: string;
  children?: ShamsyMenu[];
  permission?: any;
  queryParams?: { [ key: string]: any };
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  public mainMenu: ShamsyMenu[] = [
    {
      title: "Tableau de bord",
      icon: faGauge,
      routerLink: "/dashboard",
      exact: true
    },
    {
      title: 'Fiches Animaux',
      icon: faClipboardList,
      routerLink: '/fiches-animaux',
    },
    {
      title: 'Suivi reproduction',
      icon: faVenusMars,
      routerLink: '/suivi-reproduction',
    },
    {
      title: 'Alimentation',
      icon: faUtensils,
      routerLink: '/alimentation',
    },
    {
      title: 'Santé et soins',
      icon: faKitMedical,
      routerLink: '/sante-soins',
    },
    {
      title: 'Ventes',
      icon: faMoneyBillWave,
      routerLink: '/ventes', 
    },
    {
      title: 'Charges diverses',
      icon: faCircleDollarToSlot,
      routerLink: '/charges',
    },
    {
      title: 'Synthèses financières',
      icon: faChartPie,
      routerLink: '/syntheses-financieres',
    },
    {
      title: 'Utilisateurs',
      icon: faUsers,
      routerLink: '/gestion/utilisateurs',
    },
    {
      title: 'Modèle prévisionnel',
      icon: faChartLine,
      routerLink: '/predictions',
    },
    {
      title: 'Mon compte',
      icon: faUser,
      routerLink: '/profile',
    },

    {
      title: 'Administration',
      icon: faGears,
      children: [
        { title: 'Type Animaux', icon: faCow, routerLink: '/typeAnimaux' },
        { title: 'Bâtiment', icon: faWarehouse, routerLink: '/batiments' },
        { title: 'Stade', icon: faHeartPulse, routerLink: '/etatSante' },
        { title: 'Type Aliment', icon: faWheatAwn, routerLink: '/typeAliment' },
        { title: 'Fournisseur', icon: faTruck, routerLink: '/fournisseurs' },
        { title: 'Ingredient', icon: faCarrot, routerLink: '/ingredients' },
        { title: 'Traitement', icon: faCapsules, routerLink: '/traitement' },
        { title: 'Type de dépense', icon: faDollarSign, routerLink: '/typeDepense' },
        { title: 'Type de vente', icon: faDollarSign, routerLink: '/typeVente' },
      ]
    },
  ]; 

  constructor() { }
}
