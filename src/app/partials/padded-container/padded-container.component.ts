import { Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-padded-container',
  standalone: true,
  imports: [
    RouterOutlet
  ],
  templateUrl: './padded-container.component.html',
  styleUrl: './padded-container.component.scss'
})
export class PaddedContainerComponent {

}
