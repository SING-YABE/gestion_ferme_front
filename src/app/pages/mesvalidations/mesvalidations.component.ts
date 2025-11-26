import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PhaseApprovalService } from '../../@core/service/phase-approval.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { BadgeModule } from 'primeng/badge';
import {DatePipe, NgClass, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {ButtonDirective} from "primeng/button";
import { PhaseService } from '../../@core/service/phase.service';
import { HttpResponse } from '@angular/common/http';
import {Ripple} from "primeng/ripple";

@Component({
  selector: 'app-mesvalidations',
  standalone: true,
  imports: [
    NgForOf,
    InputTextModule,
    DatePipe,
    RouterLinkActive,
    RouterLink,
    RouterOutlet,
    ProgressSpinnerModule,
    NgIf,
    NgOptimizedImage,
    PaginatorModule,
    FormsModule,
    ButtonDirective,
    NgClass,
    BadgeModule,
    TableModule,
    ButtonModule,
    RouterModule,
    DialogModule,
    FormsModule,
    CommonModule,
    InputTextModule,
    ProgressSpinnerModule,
    PaginatorModule,
    TooltipModule,
    InputTextareaModule,
    Ripple
  ],
  templateUrl: './mesvalidations.component.html',
  styleUrl: './mesvalidations.component.scss'
})
export class MesvalidationsComponent implements OnInit {
  deliverables: any[] = [];
  selectedDeliverable: any = null;
  files: any[] = [];
  loadingDeliverables = false;

  loading = true;
  approvalRequests: any[] = [];
  filteredRequests: any[] = [];
  paginatedRequests: any[] = [];
  selectedRequest: any = null;
  processModal = false;
  approvalComment = '';

  // Sidebar and search
  isSidebarCollapsed = false;
  searchTerm = '';
  selectedStatus = 'PENDING';

  // Pagination
  first = 0;
  rows = 10;
  totalRecords = 0;

  constructor(
    private approvalService: PhaseApprovalService,
    private toastr: ToastrService,
    private router: Router,
    private phaseService:PhaseService
  ) {}

  ngOnInit(): void {
    this.loadMyValidationRequests();
  }
 

  loadMyValidationRequests() {
    this.loading = true;

    if (this.selectedStatus === 'PENDING') {
      this.approvalService.getPendingApprovalRequests().subscribe({
        next: (response) => {
          this.approvalRequests = response.data || [];
          this.applyFilters();
          this.loading = false;

          if (this.selectedRequest) {
            this.reselectCurrentRequest();
          }
        },
        error: (err) => {
          this.toastr.error('Erreur lors du chargement des demandes', 'Erreur');
          this.loading = false;
        }
      });
    } else {
      // V/Rejet API par statut
      this.approvalService.getByStatus(this.selectedStatus).subscribe({
        next: (response) => {
          this.approvalRequests = response.data || [];
          this.applyFilters();
          this.loading = false;

          if (this.selectedRequest) {
            this.reselectCurrentRequest();
          }
        },
        error: (err) => {
          this.toastr.error('Erreur lors du chargement des demandes', 'Erreur');
          this.loading = false;
        }
      });
    }
  }

  reselectCurrentRequest() {
    if (this.selectedRequest && this.selectedRequest.id) {
      const updatedRequest = this.approvalRequests.find(request => request.id === this.selectedRequest.id);
      if (updatedRequest) {
        this.selectedRequest = { ...updatedRequest };
      }
    }
  }

  applyFilters() {
    if (this.selectedStatus === 'ALL') {
      this.filteredRequests = [...this.approvalRequests];
    } else {
      this.filteredRequests = this.approvalRequests.filter(request =>
        request.status === this.selectedStatus
      );
    }

    this.onSearch();
    console.log('STATUTS dispo :', this.approvalRequests.map(r => r.status));
  }

  filterByStatus(status: string) {
    this.selectedStatus = status;
    this.first = 0;
    this.selectedRequest = null;

    // statut sélectionné
    this.loadMyValidationRequests();
  }

  onSearch() {
    let filtered = [...this.filteredRequests];

    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(request =>
        request.phaseName?.toLowerCase().includes(searchLower) ||
        request.projectName?.toLowerCase().includes(searchLower) ||
        request.requestedBy?.toLowerCase().includes(searchLower) ||
        request.proposedDecision?.toLowerCase().includes(searchLower)
      );
    }

    this.totalRecords = filtered.length;
    this.updatePaginatedRequests(filtered);
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.updatePaginatedRequests(this.filteredRequests);
  }

  updatePaginatedRequests(requests: any[]) {
    const start = this.first;
    const end = start + this.rows;
    this.paginatedRequests = requests.slice(start, end);
  }

  selectRequest(request: any) {
    this.selectedRequest = { ...request };
    
    this.selectedRequest.requestDate = this.convertArrayToDate(this.selectedRequest.requestDate);
  this.selectedRequest.approvalDate = this.convertArrayToDate(this.selectedRequest.approvalDate);
    // livrables de la phase
   if (request.phaseId) {
    this.loadDeliverables(request.phaseId);
   }
    setTimeout(() => {
      // reevaluer les bindings
      this.selectedRequest = { ...this.selectedRequest };
    }, 0);
  }

  openProcessModal() {
    if (this.selectedRequest) {
      this.processModal = true;
      this.approvalComment = '';
    }
  }

  processRequest(approved: boolean) {
    if (!this.selectedRequest) return;

    const requestData = {
      approvalRequestId: this.selectedRequest.id,
      approved: approved,
      approvalComment: this.approvalComment
    };

    this.approvalService.processApprovalRequest(requestData).subscribe({
      next: (response) => {
        if (response.successful) {
          this.toastr.success('Demande traitée avec succès', 'Succès');
          this.processModal = false;

      //Charge et reinitialise
          this.loadMyValidationRequests();
          this.selectedRequest = null;
        }
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'Erreur lors du traitement', 'Erreur');
      }
    });
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'En cours';
      case 'APPROVED': return 'Validé';
      case 'REJECTED': return 'Rejeté';
      default: return status;
    }
  }

  getStatusCount(status: string): string {
    const count = this.approvalRequests.filter(request => request.status === status).length;
    return count > 0 ? count.toString() : '';
  }



  loadDeliverables(phaseId: string) {
  this.loadingDeliverables = true;
  this.deliverables = [];
  this.selectedDeliverable = null;
  this.files = [];

  this.phaseService.getLivrables(phaseId).subscribe({
    next: (response: any) => {
      this.deliverables = response.data || [];
      this.loadingDeliverables = false;
    },
    error: (err) => {
      this.loadingDeliverables = false;
      console.error('Erreur lors du chargement des livrables:', err);
    }
  });
}

selectDeliverable(deliverable: any) {
  this.selectedDeliverable = deliverable;
  this.getListFichiers();
}

getListFichiers() {
  if (!this.selectedDeliverable) return;

  this.phaseService.listAttachments(this.selectedDeliverable.id).subscribe({
    next: (response: any) => {
      this.files = response.data || response || [];
    },
    error: (err) => {
      console.error('Erreur chargement fichier:', err);
      this.files = [];
    }
  });
}

downloadFiles(attachmentId: string, fileName: string) {
  if (!this.selectedDeliverable) return;

  this.phaseService.downloadAttachment(this.selectedDeliverable.id, attachmentId).subscribe({
    next: (response: HttpResponse<Blob>) => {
      const blob = response.body;
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    },
    error: (err) => {
      this.toastr.error('Erreur lors du téléchargement', 'Erreur');
    }
  });
}

formatCreatedAt(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR');
}

convertArrayToDate(array: any): Date | null {
  if (!array || array.length < 7) return null;
  return new Date(array[0], array[1] - 1, array[2], array[3], array[4], array[5], Math.floor(array[6] / 1000000));
}

}
