import {Component, Input, OnInit} from '@angular/core';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {Router, RouterLink, RouterLinkActive} from "@angular/router";
import {faPowerOff} from "@fortawesome/free-solid-svg-icons/faPowerOff";
import {MenuService} from "../../@core/service/menu.service";
import {TagModule} from "primeng/tag";
import {environment} from "../../../environments/environment";
import {ButtonDirective} from "primeng/button";
import {AccordionComponent} from "../../partials/accordion.menu";
import {Menu, MenuItemContent, MenuModule} from "primeng/menu";
import {ConfirmationService, MenuItem} from "primeng/api";
import {AuthService} from "../../@core/service/auth.service";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import { CommonModule } from '@angular/common';
import { HasPermissionDirective } from '../../@core/security/directives/has-permission.directive';


@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports:[
    CommonModule,
    FaIconComponent,
    RouterLink,
    RouterLinkActive,
    TagModule,
    ButtonDirective,
    AccordionComponent,
    MenuModule,
    ConfirmDialogModule,
    HasPermissionDirective
  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
  providers: [ConfirmationService]
})

export class SidenavComponent implements OnInit{
  appName = environment.appName;
  appVersion = environment.appVersion;
  appSession: any;
  menuItems: MenuItem[] = [
    {
      label: 'Mon compte',
      icon: 'pi pi-fw pi-home',
      routerLink: '/my-account'
    },
    {
      label: 'Déconnexion',
      icon: 'pi pi-fw pi-power-off',
      command: () => {
        this.cs.confirm({
          header: 'Déconnexion',
          message: 'Voulez-vous vraiment vous déconnecter ?',
          acceptLabel: 'Oui je confirme',
          rejectLabel: 'Non',
          acceptButtonStyleClass: 'p-button-danger',
          rejectButtonStyleClass: 'p-button-outlined mr-2',
          defaultFocus: 'reject',
          accept: () => {
            this.authService.logout();
          }
        });
      }
    }
  ];

  constructor(
    public menuService: MenuService,
    private router: Router,
    private authService: AuthService,
    private cs: ConfirmationService
  ) {
    this.appSession = JSON.parse(localStorage.getItem(environment.sessionKey)??'{}');
  }

  
  ngOnInit(): void {
    const tokenData = this.authService.getTokenData();  // Récupérer les données du token décodé
    //console.log('Token décodé:', tokenData); // Afficher le token décodé dans la console
  
    if (tokenData) {
      //console.log('Permissions de l\'utilisateur:', tokenData.permissions); // Afficher les permissions dans la console
    }
  }

trackByFn(index: number, item: any): any {
    return item.title;  // Assure-toi que `item` a une propriété unique, comme `title` ou `id`
  }
  

  protected readonly faPowerOff = faPowerOff;
}
