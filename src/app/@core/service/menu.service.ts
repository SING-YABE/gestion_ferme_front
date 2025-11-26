import { Injectable } from '@angular/core';
import { IconDefinition } from "@fortawesome/free-regular-svg-icons";
import { 
  faChartLine,
  faDashboard, 
  faLightbulb, 
  faDesktop, 
  faUsers, 
  faFileAlt,
  faCow, 
  faPaw, 
  faHeartbeat, 
  faWheatAwn, 
  faPills,
  faBox,
  faBuilding,
  faCogs,
  faMapMarkerAlt,
  faMapMarker,
  faTruck,
  faExclamationTriangle,
  faFolder,
  faMoneyBill,
  faProjectDiagram,
  faTasks,
  faUserAlt,
  faTags,
  faUserCheck,
  faMoneyBillTransfer,
  faInbox,
  faUsersCog,
  faTabletButton
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
      icon: faDashboard,
      routerLink: "/dashboard",
      exact: true
    },
    {
      title: 'Fiches Animaux',
      icon: faPaw, 
      routerLink: '/fiches-animaux',
    },
    {
      title: 'Suivi réproduction',
      icon: faHeartbeat, 
      routerLink: '/suivi-reproduction',
    },
    {
      title: 'Alimentation',
      icon: faWheatAwn,
      routerLink: '/alimentation',
    },
    {
      title: 'Santé et soins',
      icon: faHeartbeat,
      routerLink: '/sante-soins',
    },
    {
      title: 'Ventes',
      icon: faMoneyBill,
      routerLink: '/ventes', 
    },
    {
      title: 'Charges diverses',
      icon: faMoneyBillTransfer,
      routerLink: '/charges',
    },
    {
      title: 'Synthèses financière',
      icon: faProjectDiagram,
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
      // routerLink: '',
    },
   
    {
      title: 'Mon compte',
      icon: faUserAlt,
      routerLink: '/profile',
    },
    {
      title: 'Administration',
      icon: faCogs,
      children: [
        {
          title: 'Type Animaux',
          icon: faCow,
          routerLink: '/typeAnimaux',
        },
        {
          title: 'bâtiment',
          icon: faBuilding,
          routerLink: '/batiments'
        },
        {
          title: 'État de santé',
          icon: faHeartbeat,
          routerLink: '/etatSante'
        },
        {
          title: 'Type Aliment',
          icon: faWheatAwn,
          routerLink: '/typeAliment'
        },
        {
          title: 'Fournisseur',
          icon: faTruck,
          routerLink: '/fournisseurs'
        },
        {
          title: 'Traitement',
          icon: faPills,
          routerLink: '/traitement'
        },
        {
          title: 'Type de dépense',
          icon: faMoneyBill,
          routerLink: '/typeDepense'
        }
      ]
    },
  ];

  constructor() { }
}