import { TimelineModule } from 'primeng/timeline';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DatePipe, DecimalPipe, NgIf, registerLocaleData } from "@angular/common"
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PrimeTemplate } from 'primeng/api';
import { ProjectService } from '../../../../@core/service/project.service';
import { ProjectEventPaginationRequest, ProjectEventService } from '../../../../@core/service/project-event.service';
import { Scroller, ScrollerModule } from 'primeng/scroller';
import { PanelModule } from 'primeng/panel';
import { SkeletonModule } from 'primeng/skeleton'
import { DropdownFilterOptions, DropdownModule } from 'primeng/dropdown'
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';



@Component({
  selector: 'app-project-events',
  standalone: true,
  imports: [
    TableModule,
    TagModule,
    DatePipe,
    PrimeTemplate,
    ButtonModule,
    TimelineModule,
    CardModule,
    NgIf,
    ScrollerModule,
    PanelModule,
    SkeletonModule,
    DropdownModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule
  ],
  templateUrl: './project-events.component.html',
  styleUrl: './project-events.component.scss'
})
export class ProjectEventsComponent implements OnInit, AfterViewInit {

  loading: boolean = false;
  projectId: string = "projet"
  events: any[] = []
  filteredEvents: any[] = []
  icon: string = "pi pi-check"
  currentPage = 0
  totalPage = 0
  perPage = 10
  loader = false
  scrollEnd = false

  eventTypes: any[] = []
  eventType: string = ""
  eventTypeTags: any[] = []
  eventTypeTag: string = ""
  eventTypeFilterValue: string = ""
  @ViewChild('scroller') scroller!: Scroller;

  constructor(
    public ps: ProjectService,
    public es: ProjectEventService
  ) {

    ps.currentProjectId$.subscribe(response => {
      this.projectId = response
    })

  }

  ngAfterViewInit(): void {
    this.scroller.onScrollIndexChange.subscribe(event => {
      this.loadData(event)
    })
    this.scroller.itemSize = 50
  }

  ngOnInit(): void {
    this.getAllProjectForProject()
    this.getAllEventType()
  }


  loadData(event: any) {
    console.log(event);
    if (this.currentPage < this.totalPage) {
      this.getAllProjectForProject()
    } else {
      this.scroller.onScrollIndexChange.unsubscribe()
      this.scroller.itemSize = 0
      this.scrollEnd = true
    }
  }
  onScroll(event: any) {
    console.log(event);
  }

  isPaired(index: number) {
    return index % 2 === 0
  }

  getAllProjectForProject(eventType?: any) {
    this.loader = false
    var request: ProjectEventPaginationRequest = {
       pageNumber: this.currentPage,
       pageSize: this.perPage,
       projectId: this.projectId,
       type: eventType
    }
    this.es.getAllForProject(request).subscribe({
      next: (response: any) => {
        var event = response.content

        //Gestion des icones
        this.events = [...this.events, ...this.eventSupplementDatas(event)]
        console.log(this.events.length);

        this.loader = true
        this.currentPage += 1
        this.totalPage = response.totalPages

        if (this.totalPage === this.currentPage) {
          this.events[this.events.length - 1].scrollEnd = true
        }

        this.filteredEvents = this.events
      },

      error: (err: any) => {
        console.log(err)
      }
    })
  }


  eventSupplementDatas(events: any[]) {
    events.forEach((item, index) => {
      item.index = index + 1
      //Colors
      if (item.typeAction === "CREATE") {
        item.color = "#007822"
      }
      else if (item.typeAction === "UPDATE") {
        item.color = "#ff821b"
      }
      else if (item.typeAction === "DELETE") {
        item.color = "#c50000"
      }
      else if (item.typeAction === "SUSPENSION") {
        item.color = "#ff821b"
      }
      else if (item.typeAction === "ACTIVATION") {
        item.color = "#007822"
      }
      else {
        item.color = "#000"
      }

      //Icones
      if (item.type === "PROJECT_CREATION") {
        item.icon = "pi-file-plus"
      }
      else if (item.type === "PROJECT_UPDATE") {
        item.icon = "pi-sync"
      }
      else if (item.type === "PROJECT_SUSPENSION") {
        item.icon = "pi-pause"
      }
      else if (item.type === "PROJECT_ACTIVATION") {
        item.icon = "pi-play"
      }
      else if (item.type === "PHASE") {
        item.icon = "pi-list-check"
      }
      else if (item.type === "DEPENSE") {
        item.icon = "pi-money-bill"
      }
      else if (item.type === "LIGNE_BUDGETAIRE") {
        item.icon = "pi-dollar"
      }
      else if (item.type === "PRODUCT_ORDER") {
        item.icon = "pi-shopping-cart"
      }
      else if (item.type === "PROCES_VERBAL") {
        item.icon = "pi-shopping-cart"
      }
      else if (item.type === "MEMBERSHIP") {
        item.icon = "pi-users"
      }
      else if (item.type === "TASK") {
        item.icon = "pi-check-square"
      }
      else if (item.type === "RISK") {
        item.icon = "pi-exclamation-triangle"
      }
      else if (item.type === "ACTION_PLAN") {
        item.icon = "pi-chart-bar"
      }
    })

    return events
  }


  getAllEventType() {
    this.es.getAllProjectEventType().subscribe({
      next: (response: any) => {
        console.log(response);
        this.eventTypes = response
        this.eventTypeSupplementDatas()
      },
      error: (err:any) => {
        console.log(err)
      }
    })
  }

  eventTypeSupplementDatas() {
    this.eventTypes.forEach((item, index) => {
      //Icones
      if (item.id === "PROJECT_CREATION") {
        item.icon = "pi-file-plus"
      }
      else if (item.id === "PROJECT_UPDATE") {
        item.icon = "pi-sync"
      }
      else if (item.id === "PROJECT_SUSPENSION") {
        item.icon = "pi-pause"
      }
      else if (item.id === "PROJECT_ACTIVATION") {
        item.icon = "pi-play"
      }
      else if (item.id === "PHASE") {
        item.icon = "pi-list-check"
      }
      else if (item.id === "DEPENSE") {
        item.icon = "pi-money-bill"
      }
      else if (item.id === "LIGNE_BUDGETAIRE") {
        item.icon = "pi-dollar"
      }
      else if (item.id === "PRODUCT_ORDER") {
        item.icon = "pi-shopping-cart"
      }
      else if (item.id === "PROCES_VERBAL") {
        item.icon = "pi-shopping-cart"
      }
      else if (item.id === "MEMBERSHIP") {
        item.icon = "pi-users"
      }
      else if (item.id === "TASK") {
        item.icon = "pi-check-square"
      }
      else if (item.id === "RISK") {
        item.icon = "pi-exclamation-triangle"
      }
      else if (item.id === "ACTION_PLAN") {
        item.icon = "pi-chart-bar"
      }
    })

  }


  customFilterFunction(event: KeyboardEvent, options: DropdownFilterOptions) {
    options.filter!!(event);
  }


  resetFunction(options: DropdownFilterOptions){
    options.reset!!()
    this.eventTypeFilterValue = ""
    this.eventType = ""
    this.filteredEvents = this.events
  }


  eventTypeChange(event: any){
    console.log(event);
    var val = {type: event.value.id, projectId:this.projectId}
    this.es.filterByType(val).subscribe({
      next: (response:any)=>{
        console.log(response);
        this.filteredEvents = this.eventSupplementDatas(response)
      },
      error:(err: any) =>{
        console.log(err);
      }
    })
  }


}
