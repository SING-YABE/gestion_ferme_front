import {Component, Input} from '@angular/core';
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {ProgressBarModule} from "primeng/progressbar";

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [
    ProgressSpinnerModule,
    ProgressBarModule
  ],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss'
})
export class LoadingComponent {

  @Input() message: string = "Chargement en cours...";
  @Input() mode: 'progressbar' | 'spinner' = 'spinner';
  @Input() color = 'primary';

  constructor() {
  }

}
