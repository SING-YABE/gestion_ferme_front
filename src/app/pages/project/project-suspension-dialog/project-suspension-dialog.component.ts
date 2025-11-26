import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProjectService } from '../../../@core/service/project.service';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TooltipModule } from 'primeng/tooltip';
import { ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-project-suspension-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextareaModule,
    TooltipModule
  ],
  templateUrl: './project-suspension-dialog.component.html',
  styleUrl: './project-suspension-dialog.component.scss'
})
export class ProjectSuspensionDialogComponent {

 suspensionForm: FormGroup = {} as FormGroup;
 loading = false;
 projectId: number = 0;
 isSuspended: boolean = false;
 dialogTitle: string = '';
 actionButtonText: string = '';
 actionButtonClass: string = '';

 constructor(
   private fb: FormBuilder,
   private projectService: ProjectService,
   private toastr: ToastrService,
   private config: DynamicDialogConfig,
   private ref: DynamicDialogRef
 ) {

  this.isSuspended = this.config.data?.isSuspended || false;
    

   
   this.actionButtonText = this.isSuspended ? 'Réactiver' : 'Suspendre';
   this.actionButtonClass = this.isSuspended ? 'p-button-success' : 'p-button-danger';
   
   // Init le formulaire
   this.suspensionForm = this.fb.group({
     comment: ['', [Validators.required, Validators.minLength(10)]]
   });
  }

 ngOnInit(): void {
   this.projectId = this.config.data.projectId;
   this.isSuspended = this.config.data.isSuspended;
   
   // dialogue 

   if (this.isSuspended) {
     this.dialogTitle = "";
     this.actionButtonText = "Réactiver le projet";
     this.actionButtonClass = "p-button-success";
   } else {
     this.dialogTitle = "";
     this.actionButtonText = "Suspendre le projet";
     this.actionButtonClass = "p-button-warning";
   }
   
   this.suspensionForm = this.fb.group({
     projectId: [this.projectId],
     comment: ['', [Validators.required, Validators.minLength(10)]]
   });
 }

 onSubmit(): void {
   if (this.suspensionForm.invalid) {
     this.toastr.warning('Veuillez remplir tous les champs');
     return;
   }

   this.loading = true;
   const suspensionComment = this.suspensionForm.value;
   
   this.projectService.updateProjectSuspensionStatus(suspensionComment).subscribe({
     next: (response: any) => {
       this.loading = false;
       this.toastr.success(response.message || 'Opération réussie');
       this.ref.close(true);
     },
     error: (err:any) => {
       this.loading = false;
       this.toastr.error(err.error.message || 'Une erreur est survenue lors de l\'opération');
     }
   });
 }

 cancel(): void {
   this.ref.close(false);
 }
}

