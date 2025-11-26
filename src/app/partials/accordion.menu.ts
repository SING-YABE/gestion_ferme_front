// accordion.component.ts
import {Component, Input, OnInit} from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import {ShamsyMenu} from "../@core/service/menu.service";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {NavigationEnd, Router, RouterLink, RouterLinkActive} from "@angular/router";
import {HasPermissionDirective} from "../@core/security/directives/has-permission.directive";


@Component({
  selector: 'app-accordion-menu',
  standalone: true,
  template: `
    <div class="accordion">
      <div class="accordion-item">
        <div
          class="accordion-header side-title"
          (click)="toggleItem()"
          [class.active]="isOpen">
          {{ menuItem?.title }}
          <span class="arrow" [@rotateArrow]="isOpen ? 'open' : 'closed'">▼</span>
        </div>
        <div
          class="accordion-content"
          [@expandCollapse]="isOpen ? 'expanded' : 'collapsed'"
          (@expandCollapse.done)="onAnimationEnd($event)">
          <ul>
            @for (menu of menuItem?.children; track $index){
              <!-- <li *appHasPermission="[menu.permission]"> -->
              <li>
                <a [routerLink]="menu.routerLink" routerLinkActive="active" [routerLinkActiveOptions]="{exact: menu.exact??false}">
                  @if(menu.icon){
                    <fa-icon [icon]="menu.icon"></fa-icon>
                  }
                  <span class="side-title">
                    {{ menu.title }}
                  </span>
                </a>
              </li>
            }
          </ul>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .accordion {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
    }
    .side-title{
      font-size: 0.8rem !important;
    }

    .accordion-header {
      padding: 10px 20px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #FFFFFF;
      gap: 15px;
      text-decoration: none;
      position: relative;
      transition: 600ms;
      font-size: 15px;
      background: transparent;
    }

    .accordion-header:hover {
    }

    .accordion-header.active {
    }

    .accordion-content {
      background: #161717;
    }

    .arrow {
      font-size: 12px;
    }
  `],
  imports: [
    FaIconComponent,
    RouterLinkActive,
    RouterLink,
    HasPermissionDirective
  ],
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({
        height: '0',
        padding: '0',
        overflow: 'hidden'
      })),
      state('expanded', style({
        height: '*',
        paddingBlock: '*'
      })),
      transition('collapsed <=> expanded', [
        animate('200ms ease-out')
      ])
    ]),
    trigger('rotateArrow', [
      state('closed', style({
        transform: 'rotate(0deg)'
      })),
      state('open', style({
        transform: 'rotate(180deg)'
      })),
      transition('closed <=> open', [
        animate('200ms')
      ])
    ])
  ]
})
export class AccordionComponent implements OnInit {

  @Input()
  menuItem: ShamsyMenu | undefined;
  @Input() isOpen = false;

  onAnimationEnd(event: any) {
    // Optional: Handle animation completion
  }

  toggleItem() {
    this.isOpen = !this.isOpen;
  }

  constructor(private router: Router) {
  }

  ngOnInit(): void {

    this.isOpen = this.menuItem?.children?.findIndex(el => el.routerLink == this.router.url) != -1

    this.router.events.subscribe({
      next: (data: any) => {
        if (data instanceof NavigationEnd){
          this.isOpen = this.menuItem?.children?.findIndex(el => el.routerLink == data.url) != -1
        }
      }
    });
  }
}
