// validation-flow.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { faBuilding } from '@fortawesome/free-solid-svg-icons';
import { DirectionService } from '../../../@core/service/direction.service';
import { UserService } from '../../../@core/service/user.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-validation-flow',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
     TableModule,
    DialogModule,
    ConfirmDialogModule,
    DropdownModule,
    ButtonModule,
    InputTextModule,
  ],
  templateUrl: './validation-flow.component.html',
  styleUrls: ['./validation-flow.component.scss'],
  providers: [ConfirmationService],
})


export class ValidationFlowComponent implements OnInit {
  
  // Icons
  faBuilding = faBuilding;
  
  // Data
  directions: any = { content: [], totalElements: 0 };
  allDirections: any[] = [];
  validators: any[] = [];
  selectedDirection: any = null;
  // UI State
  loading = false;
  showValidatorDialog = false;
  searchQuery = '';
  pageSize = 10;
  currentPage = 0;
  
  // Form
  validatorForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private directionService: DirectionService,
    private userService: UserService,
    private toastr: ToastrService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {
    this.validatorForm = this.fb.group({
      directionId: [''],
      validatorId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDirectionsWithValidators();
    this.loadValidators();
  }

  loadDirectionsWithValidators() {
    this.loading = true;
    this.directionService.getAllWithValidators().subscribe({
      next: (response) => {
        if (response.successful) {
          //ttes les directions
          this.allDirections = response.data || [];
          
          this.applyPaginationAndSearch();
        }
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error('Erreur lors du chargement des directions', 'Erreur');
        this.loading = false;
        console.error('Erreur:', err);
      }
    });
  }

  applyPaginationAndSearch() {
    let filteredDirections = [...this.allDirections];
    
    //filtre
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filteredDirections = filteredDirections.filter((dir: any) => 
        dir.description?.toLowerCase().includes(query) || 
        dir.name?.toLowerCase().includes(query)
      );
    }

    // pagination
    const totalElements = filteredDirections.length;
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const paginatedContent = filteredDirections.slice(startIndex, endIndex);

    // donnee paginée
    this.directions = {
      content: paginatedContent,
      totalElements: totalElements,
      totalPages: Math.ceil(totalElements / this.pageSize),
      page: this.currentPage,
      size: this.pageSize
    };
  }

loadValidators() {
  this.userService.getUsers(0, 1000).subscribe({
    next: (response: any) => {
      if (response && response.content) {
        this.validators = response.content.map((item: any) => {
          const user = item.user || item; 
          return {
            id: item.id, 
            displayName: user.displayName || 
                        (user.firstname && user.lastname ? `${user.firstname} ${user.lastname}` : '') ||
                        user.username || 
                        user.email,
            email: user.email,
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname
          };
        });
      }
    },
    error: (err) => {
      console.error('Erreur lors du chargement des validateurs:', err);
      this.toastr.error('Erreur lors du chargement des validateurs', 'Erreur');
    }
  });
}

  onSearch(event: any) {
    this.searchQuery = event.target.value;
    this.currentPage = 0; 
    this.applyPaginationAndSearch();
  }

  searchDirections() {
    this.currentPage = 0; 
    this.applyPaginationAndSearch();
  }

  handleNext(event: any) {
    this.currentPage = event.first / event.rows;
    this.pageSize = event.rows;
    this.applyPaginationAndSearch(); 
  }

  openNewValidatorDialog() {
    this.selectedDirection = null;
    this.validatorForm.patchValue({
      directionId: '',
      validatorId: ''
    });
    this.showValidatorDialog = true;
  }

  assignValidator(direction: any) {
    this.selectedDirection = direction;
    this.validatorForm.patchValue({
      directionId: direction.id,
      validatorId: ''
    });
    this.showValidatorDialog = true;
  }

  editValidator(direction: any) {
    this.selectedDirection = direction;
    this.validatorForm.patchValue({
      directionId: direction.id,
      validatorId: direction.validator?.id || ''
    });
    this.showValidatorDialog = true;
  }

  confirmRemoveValidator(direction: any) {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer le validateur de la direction "${direction.description}" ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.removeValidator(direction.id);
      }
    });
  }

  removeValidator(directionId: string) {
    this.loading = true;
    this.directionService.removeValidator(directionId).subscribe({
      next: () => {
        this.toastr.success('Validateur supprimé avec succès', 'Succès');
        this.loadDirectionsWithValidators();
      },
      error: (err) => {
        this.toastr.error('Erreur lors de la suppression', 'Erreur');
        this.loading = false;
      }
    });
  }

  saveValidator() {
    if (this.validatorForm.invalid) return;
    
    this.loading = true;
    const formValue = this.validatorForm.value;
    const dto = {
      directionId: this.selectedDirection ? this.selectedDirection.id : formValue.directionId,
      validatorId: formValue.validatorId
    };
    
    this.directionService.setValidator(dto).subscribe({
      next: () => {
        this.toastr.success('Validateur assigné avec succès', 'Succès');
        this.closeValidatorDialog();
        this.loadDirectionsWithValidators();
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Erreur lors de assignation', 'Erreur');
        this.loading = false;
      }
    });
  }

  navigateToNewValidator() {
    this.router.navigate(['/validators/new']);
  }

  closeValidatorDialog() {
    this.showValidatorDialog = false;
    this.selectedDirection = null;
    this.validatorForm.reset();
    this.loading = false;
  }
  
}







