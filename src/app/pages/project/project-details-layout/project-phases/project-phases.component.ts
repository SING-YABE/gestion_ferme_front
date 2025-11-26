import {Component, OnInit} from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {ProjectService} from "../../../../@core/service/project.service";
import {PageResponse} from "../../../../@core/model/page-response.model";
import {NgClass, NgIf} from "@angular/common";

@Component({
  selector: 'app-project-phases',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgClass,
    NgIf
  ],
  templateUrl: './project-phases.component.html',
  styleUrl: './project-phases.component.scss'
})
export class ProjectPhasesComponent implements OnInit {

  projectId: string = '';
  projectDetails: any;

  constructor(
    private router: Router,
    private projectService: ProjectService,
  ) {
  }

  ngOnInit() {
    this.projectService.currentProjectId$.subscribe({
      next: (value: string) => {
        this.projectId = value;
      },
      error: (e) => {}
    });


    this.projectService.currentProjectDetails$.subscribe({
      next: (value: string) => {
        this.projectDetails = value;
      }
    })
    this.goToProjectDetails()
  }
  sortByOrderNumber(phases: any[]): any[] {
    return phases.sort((a, b) => a.orderNumber - b.orderNumber);
  }

  goToProjectDetails(): void {
    this.router.navigate(['/projects/details',this.projectId,'phases', this.sortByOrderNumber(this.projectDetails.phases)[0].id]);
  }

  trackByPhaseId(index: number, phase: any): number {
    return phase.id;
  }

  isLastPhase(index: number): boolean {
    return index === this.projectDetails.phases.length - 1;
  }

}
