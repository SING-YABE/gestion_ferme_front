import { Component } from '@angular/core';
import {faPlus} from "@fortawesome/free-solid-svg-icons/faPlus";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {DialogModule} from "primeng/dialog";
import {ButtonDirective} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";

@Component({
  selector: 'app-partner-form',
  standalone: true,
  imports: [
    FaIconComponent,
    DialogModule,
    ButtonDirective,
    InputTextModule
  ],
  templateUrl: './partner-form.component.html',
  styleUrl: './partner-form.component.scss'
})
export class PartnerFormComponent {

  protected readonly faPlus = faPlus;
  showDialog = false;
}
