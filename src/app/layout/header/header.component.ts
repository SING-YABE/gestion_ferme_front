import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatToolbar} from "@angular/material/toolbar";
import {MatIconButton} from "@angular/material/button";
import {AppService} from "../../@core/service/app.service";
import {AsyncPipe, NgIf} from "@angular/common";
import {ButtonDirective} from "primeng/button";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatIcon,
    MatToolbar,
    MatIconButton,
    NgIf,
    AsyncPipe,
    ButtonDirective
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  @Output()
  sidebarToggle: EventEmitter<any> = new EventEmitter<any>();
  user: any;

  constructor(
    public appService: AppService,
  ) {
  }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem(environment.sessionKey)!!)?.user;
  }

}
