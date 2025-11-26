import {Component, OnInit} from '@angular/core';
import {TableModule} from "primeng/table";
import {RouterLink} from "@angular/router";
import {ButtonDirective} from "primeng/button";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons/faPlus";
import {InputTextModule} from "primeng/inputtext";
import {FlexLayoutModule} from "@angular/flex-layout";
import {PartnerFormComponent} from "./partner-form/partner-form.component";

@Component({
  selector: 'app-partners-management',
  standalone: true,
  imports: [
    TableModule,
    RouterLink,
    ButtonDirective,
    FaIconComponent,
    InputTextModule,
    FlexLayoutModule,
    PartnerFormComponent
  ],
  templateUrl: './partners-management.component.html',
  styleUrl: './partners-management.component.scss'
})
export class PartnersManagementComponent implements OnInit{

  partners: any[] = [];

  ngOnInit(): void {
  }

  protected readonly faPlus = faPlus;
}
