import { Component, OnInit } from '@angular/core';
import { DirectionService } from '../../../../@core/service/direction.service';
import { UserService } from '../../../../@core/service/user.service';
import { ToastrService } from 'ngx-toastr';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-flow-form',
  standalone: true,
  imports: [
    DropdownModule, 
    FormsModule, 
    ReactiveFormsModule, 
    ButtonModule,
    CommonModule
  ],
  templateUrl: './flow-form.component.html',
  styleUrl: './flow-form.component.scss'
})
export class FlowFormComponent implements OnInit {
  form: FormGroup;
  directions: any[] = [];
  validators: any[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private directionService: DirectionService,
    private userService: UserService,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      directionId: ['', Validators.required],
      validatorId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDirections();
    this.loadPotentialValidators();
  }

  loadDirections() {
    this.directionService.getAll().subscribe({
      next: (data: any) => {
        if (data.successful && data.data) {
          this.directions = data.data.content || [];
        } else {
          this.directions = [];
        }
        console.log('Directions chargées:', this.directions);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des directions:', err);
        this.directions = [];
        this.toastr.error('Erreur lors du chargement des directions', 'Erreur');
      }
    });
  }
  
  back() {
    window.history.back();
  }

  loadPotentialValidators() {
    this.userService.getUsers(0, 1000).subscribe({
      next: (response: any) => {
        if (response && response.content) {
          this.validators = response.content || [];
        } else {
          this.validators = [];
        }
        console.log('Validateurs chargés:', this.validators);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des validateurs:', err);
        this.validators = [];
        this.toastr.error('Erreur lors du chargement des validateurs', 'Erreur');
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    
    this.loading = true;
    const dto = {
      directionId: this.form.value.directionId,
      validatorId: this.form.value.validatorId 
    };
    
    this.directionService.setValidator(dto).subscribe({
      next: () => {
        this.toastr.success('Validateur assigné avec succès', 'Succès');
        this.loading = false;
        this.back();
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Erreur asignation', 'Erreur');
        this.loading = false;
      }
    });
  }
}