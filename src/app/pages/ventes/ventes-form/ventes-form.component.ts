import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { NgIf } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Vente, VenteService } from '../../../@core/service/vente.service';

@Component({
  selector: 'app-ventes-form',
  standalone: true,
  imports: [DialogModule, ReactiveFormsModule, InputTextModule, ButtonModule, CalendarModule, NgIf],
  templateUrl: './ventes-form.component.html',
  styleUrls: ['./ventes-form.component.scss']
})
export class VentesFormComponent implements OnInit {

  @Input() target: Vente | null = null;
  @Input() mode: 'create' | 'edit' = 'create';
  @Output() onUpdate = new EventEmitter();

  showForm = false;
  processing = false;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private venteService: VenteService,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      dateVente: ['', Validators.required],
      type: ['', Validators.required],
      quantite: ['', Validators.required],
      poidsTotal: ['', Validators.required],
      prixUnitaire: ['', Validators.required],
      client: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.mode === 'edit' && this.target) {
      this.form.patchValue(this.target);
    }
  }

  handleShow() {
    this.showForm = true;
  }

  handleSubmit() {
    if (this.form.invalid) return;

    this.processing = true;
    const data: Vente = this.form.value;

    if (this.mode === 'create') {
      this.venteService.create(data).subscribe({
        next: (res) => {
          this.toastr.success('Vente ajoutée');
          this.onUpdate.emit(res);
          this.showForm = false;
          this.form.reset();
        },
        error: () => this.toastr.error('Erreur lors de la création'),
        complete: () => (this.processing = false)
      });

    } else {
      this.venteService.update(this.target!.id!, data).subscribe({
        next: (res) => {
          this.toastr.success('Vente mise à jour');
          this.onUpdate.emit(res);
          this.showForm = false;
        },
        error: () => this.toastr.error('Erreur lors de la mise à jour'),
        complete: () => (this.processing = false)
      });
    }
  }
}
