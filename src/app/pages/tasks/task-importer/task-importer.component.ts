import {Component, OnInit} from '@angular/core';
import {TaskService} from "../../../@core/service/task.service";
import {ButtonDirective} from "primeng/button";
import {SidebarModule} from "primeng/sidebar";
import {faUpload} from "@fortawesome/free-solid-svg-icons/faUpload";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import * as XLSX from "xlsx";
import {InputTextModule} from "primeng/inputtext";
import {CalendarModule} from "primeng/calendar";
import {DropdownModule} from "primeng/dropdown";
import {InputTextareaModule} from "primeng/inputtextarea";
import {FormsModule} from "@angular/forms";
import {AppService} from "../../../@core/service/app.service";
import {faUser} from "@fortawesome/free-solid-svg-icons";
import {BadgeModule} from "primeng/badge";
import {UserService} from "../../../@core/service/user.service";
import {UserFilterComponent} from "../../../partials/user-filter/user-filter.component";

@Component({
  selector: 'app-task-importer',
  standalone: true,
  imports: [
    ButtonDirective,
    SidebarModule,
    FaIconComponent,
    InputTextModule,
    CalendarModule,
    DropdownModule,
    InputTextareaModule,
    FormsModule,
    BadgeModule,
    UserFilterComponent
  ],
  templateUrl: './task-importer.component.html',
  styleUrl: './task-importer.component.scss'
})
export class TaskImporterComponent implements OnInit{

  showUploadTasks: boolean = false;
  protected readonly faUpload = faUpload;

  tasks: any[] = [];
  statuses = [
    { label: 'En attente', value: 'PLANNED' },
    { label: 'En cours', value: 'IN_PROGRESS' },
    { label: 'Terminé', value: 'COMPLETED' },
    { label: 'Annuler', value: 'CANCELED' }
  ];
  users: any[] = [];


  constructor(
    private ts: TaskService,
    private as: AppService,
    private us: UserService
  ) {
  }

  ngOnInit(): void {
  }

  handleFilter($event: any) {
    this.findUser($event.target.value);
  }

  private findUser(query: string) {
    this.us.searchUserFromLdap(query).subscribe({
      next: (data: any) => {
        this.users = data;
      }
    });
  }

  handleFile($event: any) {

    const file = $event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      // Read the first sheet
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convert to JSON
      this.tasks  = XLSX.utils.sheet_to_json(sheet).map((task: any) => {
        console.log(task);
        const startDate = task['Date de debut'];
        const plannedEndDate = task['Date de fin'];
        return {
          title: task['Action'],
          description: task['Description'],
          status: task['Statut actuel'],
          startDate: startDate ? this.as.excelDateToJSDate(task['Date de debut']) : null,
          plannedEndDate: plannedEndDate ? this.as.excelDateToJSDate(task['Date de fin']) : null,
          executorCuid: null
        }
      });
      console.log(this.tasks);
    };

    reader.readAsArrayBuffer(file);
  }

  protected readonly faUser = faUser;
  processing: boolean = false;

  handleAddTask() {
    this.tasks.push({
      title: '',
      description: '',
      status: 'PLANNED',
      startDate: new Date(),
      plannedEndDate: null,
      executorCuid: null
    })
  }

  handleSaveTasks() {
    this.processing = true;
    console.log(this.tasks);
  }
}
