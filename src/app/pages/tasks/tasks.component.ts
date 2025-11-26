import {Component, OnInit} from '@angular/core';
import {AppService} from "../../@core/service/app.service";
import {DropdownModule} from "primeng/dropdown";
import {BadgeModule} from "primeng/badge";
import {faUpload} from "@fortawesome/free-solid-svg-icons/faUpload";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faCalendar, faFlag} from "@fortawesome/free-solid-svg-icons";
import {ProjectService} from "../../@core/service/project.service";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {ProjectMembershipService} from "../../@core/service/project-membership.service";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {HasPermissionDirective} from "../../@core/security/directives/has-permission.directive";

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    DropdownModule,
    BadgeModule,
    FaIconComponent,
    NgForOf,
    RouterLink,
    RouterOutlet,
    RouterLinkActive,
    DatePipe,
    NgIf,
    ProgressSpinnerModule,
    HasPermissionDirective
  ],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss'
})
export class TasksComponent implements OnInit {
  projects: any = [];
  userProjects: any = [];
  phases: any = [];
  isloading: boolean = false;
  constructor(
    private appService: AppService,
    private projectService: ProjectService,
    private memberShipService: ProjectMembershipService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.appService.setTitle('Mes taches');
    this.getAllProjects();
    this.getAllUserProjects();
    this.getAllMyTasks();

  }

  getAllProjects(): void {
    this.projectService.getAllWithoutPaginate().subscribe(projects => {
      this.projects = projects;
    })
  }

  getAllUserProjects(): void {
    this.projectService.getUserProjects().subscribe(projects => {
      this.userProjects = projects;
    })
  }

  getAllMyTasks(project: any = null): void {
    this.isloading = true;
    this.phases = [];
    this.memberShipService.getMyTasks(project?.id).subscribe(tasks => {
      this.phases = tasks.data;
      this.isloading = false;
      this.router.navigate(["tasks",this.phases[0]?.id])


    })
  }

  protected readonly faUpload = faUpload;
  protected readonly faFlag = faFlag;
  protected readonly faCalendar = faCalendar;
}
