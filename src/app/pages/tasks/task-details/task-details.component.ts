import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {ButtonDirective} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {InputTextareaModule} from "primeng/inputtextarea";
import {DropdownModule} from "primeng/dropdown";
import {CalendarModule} from "primeng/calendar";
import {InputTextModule} from "primeng/inputtext";
import {TagModule} from "primeng/tag";
import {DatePipe, NgIf} from "@angular/common";
import {SidebarModule} from "primeng/sidebar";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {faUser} from "@fortawesome/free-solid-svg-icons";
import {BadgeModule} from "primeng/badge";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {UserService} from "../../../@core/service/user.service";
import {MultiSelectModule} from "primeng/multiselect";
import {TaskService} from "../../../@core/service/task.service";
import {ToastrService} from "ngx-toastr";
import {SelectButtonModule} from "primeng/selectbutton";
import {ChipModule} from "primeng/chip";
import {FilesUploaderComponent} from "../../../partials/files-uploader/files-uploader.component";
import {environment} from "../../../../environments/environment";
import {MediaObjectService} from "../../../@core/service/media-object.service";

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [
    ButtonDirective,
    DialogModule,
    ReactiveFormsModule,
    InputTextareaModule,
    DropdownModule,
    CalendarModule,
    InputTextModule,
    TagModule,
    NgIf,
    DatePipe,
    FormsModule,
    SidebarModule,
    OverlayPanelModule,
    BadgeModule,
    FaIconComponent,
    MultiSelectModule,
    SelectButtonModule,
    ChipModule,
    FilesUploaderComponent
  ],
  templateUrl: './task-details.component.html',
  styleUrl: './task-details.component.scss'
})
export class TaskDetailsComponent implements OnInit, OnChanges {

  @Output() taskUpdated = new EventEmitter<any>();
  @Input() task: any = {title: '',};
  @Input() mode: 'button' | 'preview' = 'preview';

  statuses: any[] = [];
  showDialog = false;
  taskForm: FormGroup<any> | undefined;
  dates: any = [];
  endTime = "00:00";
  loading = false;

  downloadBaseURL = "";


  protected readonly faUser = faUser;
  users: any[]              = [];
  processing: boolean       = false;
  attachments: any[]        = [];

  constructor(private fb: FormBuilder,
              private us: UserService,
              private taskService: TaskService,
              private toastr: ToastrService,
              private ms: MediaObjectService
  ) {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {

    this.filesUploadUrl   = `${environment.apiUrl}/api/v1/tasks/attach-files/${this.task.id}`;
    this.downloadBaseURL  = `${environment.apiUrl}/api/v1/tasks/download-attachment/${this.task.id}`;

    this.selectDefaultExecutor();

    this.initForm();
  }

  ngOnInit(): void {

    this.selectDefaultExecutor();

    if (this.selectedExecutor == undefined){
      this.findUser("DICKO");
    }

  }

  handleSave() {

    const task = {
      ...this.taskForm?.value,
      title: this.task.title,
      executorsIds: this.selectedExecutor != undefined ? [this.selectedExecutor.cuid] : []
    };

    this.processing = true;

    this.taskService.updateTask(this.task.id, task).subscribe({
      next: (response: any) => {
        this.processing = false;
        this.showDialog = false;
        this.toastr.success("Tâche mise à jour avec succès");
        this.taskUpdated.emit(response);
      },
      error: err => {
        this.processing = false;
        this.toastr.error(err.error.message??'Une erreur est survenue');
      }
    })

  }

  handleSelectDate() {

    const endDate: Date = this.dates[1]??null;

    const time = this.endTime.split(":");
    if (endDate != null) endDate.setHours(+time[0], +time[1], 0, 0);

    this.taskForm!.patchValue({
      dates: [this.dates[0], endDate],
      startDate: this.dates[0],
      plannedEndDate: this.dates[1]
    });

  }

  private initForm() {

    this.dates = [];

    if (this.task.startDate != null) {
      this.dates.push(this.task.startDate);
    }
    if (this.task.plannedEndDate != null) {
      this.dates.push(this.task.plannedEndDate);
    }

    this.taskForm = this.fb.group({
      title: [this.task?.title ?? '', Validators.required],
      description: [this.task?.description] ?? '',
      status: [this.task?.status ?? 'PLANNED', Validators.required],
      plannedEndDate: [this.task?.plannedEndDate, Validators.required],
      startDate: [this.task?.startDate ?? null, Validators.required]
    });
  }

  handleFilter($event: any) {
    this.findUser($event.target.value);
  }

  private findUser(query: string) {
    this.loading = true;
    this.us.searchUserFromLdap(query).subscribe({
      next: (data: any) => {
        if (this.selectedExecutor != undefined){
          this.users = this.removeDuplicatesByIdMap([...data, this.selectedExecutor], 'cuid');
        }else {
          this.users = data;
        }
        this.loading = false;
      }
    });
  }


  removeDuplicatesByIdMap = (array: any[], key: string) => {
    const map = new Map(array.map(item => [item[key], item]));
    return Array.from(map.values());
  };
  statusOptions: any[] = [
    {label: 'En attente', value: 'PLANNED'},
    {label: 'En cours', value: 'IN_PROGRESS'},
    {label: 'Terminée', value: 'COMPLETED'},
    {label: 'Bloqué', value: 'BLOCKED'}
  ];
  filesUploadUrl = "";
  selectedExecutor: any;

  handleChangeStatus() {
    this.taskForm?.patchValue({status: this.task.status});
    this.handleSave();
  }

  handleFiles($event: any) {
  }

  loadTaskAttachments() {
    this.ms.taskAttachments(this.task.id).subscribe({
      next: (response: any) => {
        this.attachments = response.data
      }
    });
  }

  showTask() {
    this.showDialog = true;
    this.loadTaskAttachments();
  }

  private selectDefaultExecutor() {
    if (this.task.executors.length > 0) {
      this.selectedExecutor = {
        cuid: this.task.executors[0]?.user.cuid,
        displayname: this.task.executors[0]?.user.displayName
      }
      this.users = [this.selectedExecutor];
    }
  }
}
