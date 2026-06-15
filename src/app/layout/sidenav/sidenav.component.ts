import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faPowerOff } from '@fortawesome/free-solid-svg-icons/faPowerOff';

import { MenuService } from '../../@core/service/menu.service';
import { AuthService } from '../../@core/service/auth.service';
import { ParametrageService } from '../../@core/service/parametrage.service';

import { TagModule } from 'primeng/tag';
import { ButtonDirective } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MenuItem } from 'primeng/api';

import { AccordionComponent } from '../../partials/accordion.menu';
import { HasPermissionDirective } from '../../@core/security/directives/has-permission.directive';

import { environment } from '../../../environments/environment';
import { AppSettings } from '../../models/app-settings.model';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
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
export class SidenavComponent implements OnInit {

  // 🔹 AJOUT MINIMAL (pour le template)
  settings!: AppSettings;
  logoUrl = '';

  // 🔹 EXISTANT (inchangé)
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

  protected readonly faPowerOff = faPowerOff;

  constructor(
    public menuService: MenuService,
    private router: Router,
    private authService: AuthService,
    private cs: ConfirmationService,
    private parametrageService: ParametrageService   // 🔹 AJOUT
  ) {
    this.appSession = JSON.parse(
      localStorage.getItem(environment.sessionKey) ?? '{}'
    );
  }

  ngOnInit(): void {
    this.loadSettings(); // 🔹 AJOUT MINIMAL

    // Profil disponible via authService.getProfile() si nécessaire
  }

  // 🔹 AJOUT MINIMAL
private loadSettings(): void {
  this.parametrageService.getSettings().subscribe({
    next: (data) => {
      this.settings = data;

      // ✅ URL LOGO CORRIGÉE (API)
    this.logoUrl = data.logoPath
  ? `${environment.apiUrl}/uploads/logos/${data.logoPath}`
  : 'assets/default-logo.png';

    }
  });
}


  trackByFn(index: number, item: any): any {
    return item.title;
  }
}
