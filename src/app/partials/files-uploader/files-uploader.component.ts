import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ButtonDirective} from "primeng/button";
import {DecimalPipe, registerLocaleData} from "@angular/common";
import {PrimeTemplate} from "primeng/api";
import {SidebarModule} from "primeng/sidebar";
import fr from "@angular/common/locales/fr"
import {DialogModule} from "primeng/dialog";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-files-uploader',
  standalone: true,
  imports: [
    ButtonDirective,
    DecimalPipe,
    PrimeTemplate,
    SidebarModule,
    DialogModule
  ],
  templateUrl: './files-uploader.component.html',
  styleUrl: './files-uploader.component.scss'
})
export class FilesUploaderComponent implements OnInit{

  @Input() mode: 'surface' | 'button' | 'custom' = 'surface';
  @Input() label = "Ajouter des fichiers";
  @Input() uploadUrl = "";

  @Output() uploadDone = new EventEmitter<any>();
  @Output() fileChange = new EventEmitter<File[]>();

  icon = "pi pi-file-upload";

  showFilesToUpload: boolean = false;
  processing = false;
  files: File[] = [];
  totalSize = 0;

  constructor(private http: HttpClient) {
  }

  ngOnInit() {
    registerLocaleData(fr)
  }

  handleFiles($event: any) {
    this.files = $event.target.files;

    let total = 0;
    for (const file of this.files) {
      total += file.size;
    }

    this.totalSize = total;
    this.showFilesToUpload = true;

    // Emit the files to the parent component
    this.fileChange.emit(this.files);
  }

  handleUploadFiles() {
    this.processing = true;

    const formData = new FormData();
    for (const file of this.files) {
      formData.append("files", file);
    }

    this.http.post(this.uploadUrl, formData).subscribe({
      next: (response: any) => {
        this.uploadDone.emit(response);
        this.processing = false;
        this.showFilesToUpload = false;
        this.files = [];
      },
      error: (error) => {
        console.error(error);
        this.processing = false;
      }
    });
  }
}
