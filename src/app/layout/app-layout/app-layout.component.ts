import { Component } from '@angular/core';
import {FooterComponent} from "../footer/footer.component";
import {RouterOutlet} from "@angular/router";
import {SidenavComponent} from "../sidenav/sidenav.component";
import {MatDrawer, MatDrawerContainer, MatDrawerContent} from "@angular/material/sidenav";
import {HeaderComponent} from "../header/header.component";
import {AppService} from "../../@core/service/app.service";
import {AsyncPipe, NgIf} from "@angular/common";
import {SubscriptionBannerComponent} from "../../partials/subscription-banner/subscription-banner.component";

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [
    FooterComponent,
    RouterOutlet,
    SidenavComponent,
    MatDrawerContainer,
    HeaderComponent,
    MatDrawer,
    MatDrawerContent,
    AsyncPipe,
    NgIf,
    SubscriptionBannerComponent,
  ],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss'
})
export class AppLayoutComponent {

  opened = true;
  hideHeader = false;

  constructor(
    private as: AppService
  ) {

    this.as.hideHeader.subscribe({
      next: value => {
        this.hideHeader = value;
      }
    })

  }

}
