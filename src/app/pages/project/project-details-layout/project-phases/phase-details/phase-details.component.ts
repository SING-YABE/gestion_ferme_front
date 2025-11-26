import { CommonModule, DatePipe, DecimalPipe, JsonPipe, NgForOf, NgIf } from "@angular/common";
import { Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faFolder } from "@fortawesome/free-solid-svg-icons";
import { saveAs } from "file-saver";
import { ToastrService } from "ngx-toastr";
import { AnimateModule } from "primeng/animate";
import { Button, ButtonDirective } from "primeng/button";
import { CalendarModule } from "primeng/calendar";
import { ChipsModule } from "primeng/chips";
import { DataViewModule } from "primeng/dataview";
import { DialogModule } from "primeng/dialog";
import { DividerModule } from "primeng/divider";
import { DropdownModule } from "primeng/dropdown";
import { InputTextareaModule } from "primeng/inputtextarea";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { SidebarModule } from "primeng/sidebar";
import { SplitterModule } from "primeng/splitter";
import { TableModule } from "primeng/table";
import { FormatFileSizePipe } from "../../../../../@core/pipe/bytes-to-mb-pipe.pipe";
import { HasPermissionDirective } from "../../../../../@core/security/directives/has-permission.directive";
import { PhaseService } from "../../../../../@core/service/phase.service";
import { DeliverableDetailComponent } from "../../../../../partials/deliverable-detail/deliverable-detail.component";
import { DeliverableItemComponent } from "../../../../../partials/deliverable-item/deliverable-item.component";
import { TooltipModule } from "primeng/tooltip";
import { AuthService } from "../../../../../@core/service/auth.service";
@Component({
  selector: 'app-phase-details',
  standalone: true,
  imports: [
    TooltipModule,
    ProgressSpinnerModule,
    DatePipe,
    ButtonDirective,
    DividerModule,
    DataViewModule,
    FaIconComponent,
    SplitterModule,
    TableModule,
    JsonPipe,
    NgIf,
    DeliverableItemComponent,
    DeliverableDetailComponent,
    OverlayPanelModule,
    ChipsModule,
    InputTextareaModule,
    ReactiveFormsModule,
    SidebarModule,
    NgForOf,
    Button,
    DialogModule,
    DecimalPipe,
    CalendarModule,
    DropdownModule,
    FormsModule,
    AnimateModule,
    FormatFileSizePipe,
    HasPermissionDirective,
    CommonModule
  ],
  templateUrl: './phase-details.component.html',
  styleUrl: './phase-details.component.scss'
})




export class PhaseDetailsComponent implements OnInit{
  @ViewChild('upload') upload!: ElementRef;

  decisionForm: FormGroup;

  filePreviewVisible: boolean = false;
  selectedItemFiles: any[] = [];
  isAwaitingApproval = false;

  selectDeliverable = signal<any>(undefined)
  phaseId: string = "";
  loading = false;
  phaseDetails: any;
  livrableFilesShow: boolean = false;
  deliverables: any = [];
  phases: any[] = [];
  currentLivrable: any;
  files: any[] = [];
  fileIsprocessing: boolean = false;
  fileTotalSize: number = 0;
  filesToUpload: any = [];
  displayable: boolean = false;
  phaseModalEditShow: boolean = false;
  displayModal: boolean = false;
  selectedDecision: string = '';
  livrableOk: boolean = false;
  showUpload: boolean = false;
  approvalRequestModal = false;
  approvalForm: FormGroup = this.fb.group({
  proposedDecision: [''],
  requestComment: ['']
});
  decisionOptions: Array<{ label: string, value: string }> = [
    { label: 'Go', value: 'GO' },
    { label: 'No Go', value: 'NO_GO' },
    { label: 'Go avec réserve', value: 'RESERVE_GO' }
  ];
  phaseEditForm = this.fb.group<any>({
    idPhase: "",
    // startDate: [null, [Validators.required]],
    startDate:[null],
    endDate: [null, [Validators.required]],
    negotiatedDate: [null],
    actualEndDate: [null, [Validators.required]] 
  });
style: any;
  constructor(
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private phaseService: PhaseService,
    private deliverableService: PhaseService,
    private authService: AuthService,
    private fb: FormBuilder,


  ) {
    this.decisionForm = this.fb.group({
        requestComment: ['', Validators.required]
    });
  }
  

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.phaseId = params['phaseId']
      this.loadData()
      this.checkLivrable()
    });

    this.initForm();

  }

  initForm() {
    this.decisionForm = this.fb.group({
      decision: ['', Validators.required],
      decisionComment: ['']
    });
  }

  showFilePreview(item: any) {
    
    this.selectedItemFiles = item.files; 
    this.filePreviewVisible = true;
    this.currentLivrable = item;
    this.getListFichiers();
  }

private loadData() {
    this.loading = true;

    this.phaseService.getById(this.phaseId).subscribe({
        next: (data: any) => {
            if (data.successful) {
                this.phaseDetails = data.data;
               
                console.log("Phase en attente approbation:", this.phaseDetails.isAwaitingApproval);
                this.loadLivrables();
                this.loadChecklists();
                console.log("Toutes les checklists cochées :", this.toutesChecklistsCochees());

            } else {
                this.toastr.error(data.message);
            }
            this.loading = false;
        },
        error: (error: any) => {
            this.toastr.error(error.error.message ?? error.message);
        }
    });
}
  loadLivrables() {
    this.loading = true;
    this.phaseService.getLivrables(this.phaseId).subscribe(livrables => {
      this.loading = false;
      this.deliverables = livrables?.data;
    })
  }
  loadChecklists() {
  this.phaseService.getChecklists(this.phaseId).subscribe({
    next: (response: any) => {
      if (response.successful) {
        
        this.phaseDetails.checklists = response.data;
         console.log("Checklists chargées :", this.phaseDetails.checklists);
        console.log("Toutes cochées ?", this.toutesChecklistsCochees());
      } else {
        this.toastr.error(response.message);
      }
    },
    error: (error: any) => {
      this.toastr.error(error.error?.message ?? error.message, 'Erreur chargement checklists');
    }
  });
  } 

toggleChecklist(checklist: any) {
  if (!checklist.id) {
    this.toastr.error("ID de checklist manquant", "Erreur");
    return;
  }

  const updatedChecklist = {
    id: checklist.id,               
    label: checklist.label,         
    gain: checklist.gain,           
    phaseId: checklist.phaseId || (checklist.phase ? checklist.phase.id : null), 
    checked: !checklist.checked    
  };

  this.phaseService.updateChecklistStatus(updatedChecklist).subscribe({
    next: (res: any) => {
      if (res.successful) {
        checklist.checked = res.data.checked;
        this.toastr.success("Checklist mise jour", "Succès");
      } else {
        this.toastr.error(res.message || "Erreur serveur", "Échec");
      }
    },
    error: () => {
      this.toastr.error("Impossible de mettre a jour", "Erreur");
    }
  });
}


  protected readonly faFolder = faFolder;

  handleSelect($event: any) {
    this.selectDeliverable.set($event);
  }


  showLivrableFiles(livrable: any) {
    this.livrableFilesShow = true;
    this.currentLivrable = livrable;
    // Ne pas appeler getListFichiers ici pour éviter d'afficher les fichiers en arrière-plan
  }

  handleDocumentsInit($event: any) {
    this.filesToUpload = Array.from($event.target.files);
    console.log(this.filesToUpload);
    this.fileTotalSize = this.files.reduce((total, file) => total + file.size, 0);
    this.displayable = true;
  }

  handleDocuments($event: any) {
    this.filesToUpload = Array.from($event.target.files);
    console.log(this.filesToUpload);
    this.fileTotalSize = this.filesToUpload.reduce((total: number, file: File) => total + file.size, 0);
    this.displayable = true;
}

  getListFichiers() {
    if (this.currentLivrable && this.currentLivrable.id) {
      this.deliverableService
        .listAttachments(this.currentLivrable.id)
        .subscribe(
          (files) => {
            this.files = files;
            this.fileTotalSize = files.reduce((total, file) => total + file.size, 0);
          },
          (error) => {
            this.toastr.error('Erreur lors du chargement des fichiers');
            console.log("Erreur survenue: ", error)
          }
        );
    }
  }


  downloadFiles(attachmentId: string, fileName: string) {
    this.deliverableService.downloadAttachment(this.currentLivrable.id, attachmentId).subscribe(
      (response) => {
        const blob = new Blob([response.body as Blob], { type: response.body?.type || 'application/octet-stream' });
        saveAs(blob, fileName);
      },
      (error) => {
        this.toastr.error('Erreur lors du téléchargement du fichier');
      }
    );
  }
  handleUploadFiles() {
    if (this.filesToUpload.length === 0) {
      this.toastr.error('Veuillez sélectionner au moins un fichier.', 'Erreur');
      return;
    }
    console.log("===================")
    console.log(this.currentLivrable.id)
    this.fileIsprocessing = true;
    this.deliverableService.attachFiles(this.currentLivrable.id, this.filesToUpload).subscribe({
      next: (event) => {
        console.log(event)
        this.toastr.success('Fichiers uploadés avec succès.', 'Succès');
        this.fileIsprocessing = false;
        this.displayable = false;
        this.getListFichiers();
        this.loadData();
        this.livrableFilesShow = false;
        setTimeout(() => {
          if (this.upload && this.upload.nativeElement) {
            this.upload.nativeElement.value = '';
          }
          this.filesToUpload = [];
        });
      },
      error: (error) => {
        console.error(error);
        this.toastr.error("Erreur lors de l'upload des fichiers.", "Erreur");
        this.fileIsprocessing = false;
      },
    });
  }

  showJalonEditModal(){
    if (this.phaseDetails.startDate !== undefined) {
      this.phaseEditForm.patchValue({
        startDate: new Date(this.phaseDetails.startDate),
        negotiatedDate: new Date(this.phaseDetails.negociateEndDate),
        endDate: new Date(this.phaseDetails.plannedEndDate),
        actualEndDate: this.phaseDetails.actualEndDate ? new Date(this.phaseDetails.actualEndDate) : null
      });
    }
    this.phaseModalEditShow = true;
  }

  computeFileSize(size: number) {

  }

  handleEditPhase(){
    let data = this.phaseEditForm.value as any;
    data.idPhase = this.phaseDetails.id;
    this.phaseService.editPhase(data).subscribe(data => {
      this.phaseModalEditShow = false;
      this.loadData()

    })
  }

  formatCreatedAt(createdAt: number[]): string {
    const date = new Date(
      createdAt[0], createdAt[1] - 1, createdAt[2],
      createdAt[3], createdAt[4], createdAt[5]
    );

    return date.toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).replace(',', '');
  }

  

  saveDecision1(){
    let data = {
      phaseId: this.phaseDetails.id,
      status: this.selectedDecision,
      //decisionComment: this.decisionComment
    }
    this.phaseService.prendreDecision(data).subscribe(response => {
      this.toastr.success('Décision effectuée !.', 'Succès');
      this.displayModal = false;
      this.loadData();
    })
  }

  onDecisionChange() {
    const decisionControl = this.decisionForm.get('decisionComment');

    if (decisionControl) {
      if (this.requiresComment()) {
        decisionControl.setValidators(Validators.required);
      } else {
        decisionControl.clearValidators();
      }

      decisionControl.updateValueAndValidity();
    }
  }

  requiresComment(): boolean {
    const decision = this.decisionForm.get('decision')?.value;
    return decision === 'NO_GO' || decision === 'RESERVE_GO';
  }


  saveDecision() {
    if (this.decisionForm.invalid) {
      this.decisionForm.markAllAsTouched();
      return;
    }

    const formValue = this.decisionForm.value;
    let data = {
      phaseId: this.phaseDetails.id,
      status: formValue.decision,
      decisionComment: this.requiresComment() ? formValue.decisionComment : null
    };

    this.phaseService.prendreDecision(data).subscribe(response => {
      this.toastr.success('Décision effectuée !', 'Succès');
      this.displayModal = false;
      this.loadData();
    });
  }



  checkLivrable(){
    this.phaseService.checkLivrable(this.phaseId).subscribe(data => {
      this.livrableOk = data.data;
    })
  }
requestApproval() {
    if (this.phaseDetails?.isAwaitingApproval) { 
        this.toastr.warning('Approbation est déjà en cours pour cette phase', '!!!');
        return;
    }

    if (this.approvalForm.invalid) {
        this.approvalForm.markAllAsTouched();
        return;
    }

    const formValue = this.approvalForm.value;
    const requestData = {
        phaseId: this.phaseDetails.id,
        requestComment: formValue.requestComment,
    };

    this.phaseService.createApprovalRequest(requestData).subscribe({
        next: () => {
            this.toastr.success('Demande approbation envoyée', 'Succès');
            this.approvalRequestModal = false;
            
            this.loadData();
        },
        error: (err: any) => {
            this.toastr.error(err.error.message || 'Erreur lors de la demande', 'Erreur');
        }
    });
}
 
desactiverBoutonApprobation(): boolean {
    return this.phaseDetails?.phaseStatusLabel !== 'En cours' ||
           !this.livrableOk ||
           this.phaseDetails?.isAwaitingApproval === true 
          //  !this.toutesChecklistsCochees();
}

obtenirTexteBoutonApprobation(): string {
    if (this.phaseDetails?.isAwaitingApproval) { 
        return 'Approbation en attente...';
    }
    return 'Demander approbation';
}

toutesChecklistsCochees(): boolean {
    console.log("Checklists :", this.phaseDetails?.checklists);
  return this.phaseDetails?.checklists?.every((c: any) => c.checked) ?? false;
}

messageBoutonDesactive(): string {
  // if (this.phaseDetails?.phaseStatusLabel !== 'En cours') {
  //   return "La phase n'est pas en cours.";
  // }
  // if (!this.livrableOk) {
  //   return "Tous les livrables doivent être prêts.";
  // }
  if (!this.toutesChecklistsCochees()) {
    return "";
  }
  if (this.phaseDetails?.isAwaitingApproval) {
    return "Une approbation est déjà en cours.";
  }
  return "";
}





 hasViewApprobation(): boolean {
    const tokenData = this.authService.getTokenData();
    return tokenData?.permissions?.includes('view_approbation');
  }

}


