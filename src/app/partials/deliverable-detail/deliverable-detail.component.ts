import {Component, Input, OnInit, SimpleChanges} from '@angular/core';
import {CommonModule, DecimalPipe, JsonPipe, registerLocaleData} from "@angular/common";
import {SidebarModule} from "primeng/sidebar";
import {ButtonDirective} from "primeng/button";
import fr from "@angular/common/locales/fr"
import {ToastrService} from "ngx-toastr";
import {PhaseService} from "../../@core/service/phase.service";
import { saveAs } from "file-saver";

@Component({
  selector: 'app-deliverable-detail',
  standalone: true,
  imports: [
    JsonPipe,
    SidebarModule,
    ButtonDirective,
    DecimalPipe,
    CommonModule
  ],
  templateUrl: './deliverable-detail.component.html',
  styleUrl: './deliverable-detail.component.scss'
})
export class DeliverableDetailComponent implements OnInit{

  @Input() deliverable: any;
  processing = false;
  showFilesToUpload: boolean = false;
  totalSize = 0;
  files: any[] = [];

  constructor(
    private deliverableService: PhaseService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    registerLocaleData(fr);
    // this.getListFichiers();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['deliverable'] && this.deliverable?.id) {
      this.getListFichiers();
    }
  }

  handleDocuments($event: any) {
    this.files = Array.from($event.target.files);
    this.showFilesToUpload = true;

    this.totalSize = this.files.reduce((total, file) => total + file.size, 0);
  }

  getListFichiers() {
    if (this.deliverable && this.deliverable.id) {
      this.deliverableService
        .listAttachments(this.deliverable.id)
        .subscribe(
          (files) => {
            this.files = files;
            this.totalSize = files.reduce((total, file) => total + file.size, 0);
          },
          (error) => {
            this.toastr.error('Erreur lors du chargement des fichiers');
          }
        );
    }
  }


  downloadFiles(attachmentId: string, fileName: string) {
    this.deliverableService.downloadAttachment(this.deliverable.id, attachmentId).subscribe(
      (response) => {
        const blob = new Blob([response.body as Blob], { type: response.body?.type || 'application/octet-stream' });

        // Sauvegarde du fichier avec son nom d'origine
        saveAs(blob, fileName);
      },
      (error) => {
        this.toastr.error('Erreur lors du téléchargement du fichier');
      }
    );
  }

  handleUploadFiles() {
    if (this.files.length === 0) {
      this.toastr.error('Veuillez sélectionner au moins un fichier.', 'Erreur');
      return;
    }
    console.log("===================")
    console.log(this.deliverable.id)
    this.processing = true;
    this.deliverableService.attachFiles(this.deliverable.id, this.files).subscribe({
      next: (event) => {
        console.log(event)
        this.toastr.success('Fichiers uploadés avec succès.', 'Succès');
        console.log("donneeeeeeeeeeeeee:", this.files)
        this.processing = false;
        this.showFilesToUpload = false;
      },
      error: (error) => {
        console.error(error);
        this.toastr.error("Erreur lors de l'upload des fichiers.", "Erreur");
        this.processing = false;
      },
    });
  }


}
