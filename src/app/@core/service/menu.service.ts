import { Injectable } from '@angular/core';
import { IconDefinition } from "@fortawesome/free-regular-svg-icons";
import {
  faChartLine, faGauge, faClipboardList, faVenusMars, faUtensils,
  faKitMedical, faMoneyBillWave, faCircleDollarToSlot, faChartPie,
  faUsers, faUser, faGears, faCow, faWarehouse, faHeartPulse,
  faWheatAwn, faTruck, faCapsules, faDollarSign, faCarrot, faBrain,
  faListCheck, faCreditCard
} from "@fortawesome/free-solid-svg-icons";
import { AuthService } from './auth.service';
import { Roles } from '../security/roles.constants';

export interface ShamsyMenu {
  exact?: boolean;
  title: string;
  enabled?: boolean;
  icon?: IconDefinition;
  routerLink?: string;
  children?: ShamsyMenu[];
  permission?: any;
  /** Si défini, seuls les rôles listés voient cet item */
  roles?: string[];
  queryParams?: { [key: string]: any };
}

/** Définition complète du menu — tous rôles */
const ALL_MENU: ShamsyMenu[] = [
  {
    title: 'Tableau de bord',
    icon: faGauge,
    routerLink: '/dashboard',
    exact: true
    // visible par tous
  },
  {
    title: 'Fiches Animaux',
    icon: faClipboardList,
    routerLink: '/fiches-animaux',
    // Ouvrier peut voir les animaux (ANIMAL_READ + ANIMAL_WRITE)
  },
  {
    title: 'Déplacements',
    icon: faTruck,
    routerLink: '/deplacements',
    roles: [Roles.ADMINISTRATEUR, Roles.GERANT, Roles.RESPONSABLE]
  },
  {
    title: 'Suivi reproduction',
    icon: faVenusMars,
    routerLink: '/suivi-reproduction'
    // visible par tous
  },
  {
    title: 'Alimentation',
    icon: faUtensils,
    routerLink: '/alimentation'
    // visible par tous
  },
  {
    title: 'Santé et soins',
    icon: faKitMedical,
    routerLink: '/sante-soins'
    // visible par tous
  },
  {
    title: 'Ventes',
    icon: faMoneyBillWave,
    routerLink: '/ventes',
    roles: [Roles.ADMINISTRATEUR, Roles.GERANT, Roles.RESPONSABLE]
  },
  {
    title: 'Charges diverses',
    icon: faCircleDollarToSlot,
    routerLink: '/charges'
    // visible par tous
  },
  {
    title: 'Synthèses financières',
    icon: faChartPie,
    routerLink: '/syntheses-financieres',
    roles: [Roles.ADMINISTRATEUR, Roles.GERANT, Roles.RESPONSABLE]
  },
  {
    title: 'Utilisateurs',
    icon: faUsers,
    routerLink: '/gestion/utilisateurs',
    roles: [Roles.ADMINISTRATEUR]  // Seul l'administrateur gère les utilisateurs
  },
  {
    title: 'Modèle prévisionnel',
    icon: faChartLine,
    routerLink: '/predictions',
    roles: [Roles.ADMINISTRATEUR, Roles.GERANT, Roles.RESPONSABLE]
  },
  {
    title: 'Aide à la décision',
    icon: faBrain,
    routerLink: '/aide-decision',
    roles: [Roles.ADMINISTRATEUR, Roles.GERANT, Roles.RESPONSABLE]
  },
  {
    title: 'Gestion des tâches',
    icon: faClipboardList,
    routerLink: '/taches',
    roles: [Roles.ADMINISTRATEUR, Roles.GERANT, Roles.RESPONSABLE]
  },
  {
    title: 'Mes tâches',
    icon: faListCheck,
    routerLink: '/taches'
    // visible par tous
  },
  {
    title: 'Mon compte',
    icon: faUser,
    routerLink: '/profile'
    // visible par tous
  },
  {
    title: 'Mon abonnement',
    icon: faCreditCard,
    routerLink: '/abonnement/statut',
    roles: [Roles.ADMINISTRATEUR]  // Seul l'admin ferme gère et paie l'abonnement
  },
  {
    title: 'Administration',
    icon: faGears,
    roles: [Roles.ADMINISTRATEUR, Roles.GERANT, Roles.RESPONSABLE],
    children: [
      { title: 'Gestion des tâches', icon: faListCheck, routerLink: '/taches' },
      { title: 'Type Animaux',    icon: faCow,       routerLink: '/typeAnimaux' },
      { title: 'Bâtiment',        icon: faWarehouse, routerLink: '/batiments' },
      { title: 'Box',             icon: faWarehouse, routerLink: '/box' },
      { title: 'Etat de santé',   icon: faHeartPulse,routerLink: '/etatSante' },
      { title: 'Stade',           icon: faHeartPulse,routerLink: '/stade' },
      { title: 'Type Aliment',    icon: faWheatAwn,  routerLink: '/typeAliment' },
      { title: 'Fournisseur',     icon: faTruck,     routerLink: '/fournisseurs' },
      { title: 'Ingrédient',      icon: faCarrot,    routerLink: '/ingredients' },
      { title: 'Traitement',      icon: faCapsules,  routerLink: '/traitement' },
      { title: 'Paramétrage',     icon: faGears,     routerLink: '/parametrage' },
      { title: 'Type de dépense', icon: faDollarSign,routerLink: '/typeDepense' },
      { title: 'Type de vente',   icon: faDollarSign,routerLink: '/typeVente' },
      
    ]
  },
];

@Injectable({ providedIn: 'root' })
export class MenuService {

  constructor(private authService: AuthService) {}

  /** Menu filtré selon le rôle de l'utilisateur connecté */
  get mainMenu(): ShamsyMenu[] {
    const role = this.authService.getRole() ?? '';
    return ALL_MENU.filter(item => {
      if (!item.roles || item.roles.length === 0) return true; // visible par tous
      return item.roles.includes(role);
    });
  }
}
