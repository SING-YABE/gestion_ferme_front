import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { NgIf } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { BoxService, BoxDTO, BoxResponseDTO } from '../../../../@core/service/box.service';
import { BatimentResponseDTO } from '../../../../@core/service/batiment.service';

@Component({
  selector: 'app-box-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule, InputTextModule, ButtonModule, DropdownModule, NgIf],
  templateUrl: './box-form.component.html',
  styleUrls: ['./box-form.component.scss']
})
export class BoxFormComponent implements OnInit, OnChanges {
  @Input() target?: BoxResponseDTO;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() batiments: BatimentResponseDTO[] = [];
  @Output() onUpdate = new EventEmitter<void>();

  form: FormGroup;
  showForm = false;
  processing = false;
  apercuCode = '';

  constructor(
    private fb: FormBuilder,
    private service: BoxService,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      batimentId: [null, Validators.required],
      numero: [null, [Validators.required, Validators.min(1)]],
      capaciteMax: [null, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    // Aperçu du code en live
    this.form.valueChanges.subscribe(() => this.genererApercuCode());
  }

  ngOnChanges(): void {
    if (this.mode === 'edit' && this.target) {
      this.form.patchValue({
        batimentId: this.target.batimentId,
        numero: this.target.numero,
        capaciteMax: this.target.capaciteMax
      });
      this.apercuCode = this.target.code;
    }
  }

  private genererApercuCode(): void {
    const batimentId = this.form.value.batimentId;
    const numero = this.form.value.numero;
    if (batimentId && numero) {
      const batiment = this.batiments.find(b => b.id === batimentId);
      if (batiment) {
        const prefix = batiment.nom.toUpperCase().replace(' ', '-').substring(0, 6);
        const num = String(numero).padStart(2, '0');
        this.apercuCode = `${prefix}-${num}`;
      }
    } else {
      this.apercuCode = '';
    }
  }

  handleShow(): void {
    this.showForm = true;
    if (this.mode === 'create') {
      this.form.reset();
      this.apercuCode = '';
    }
  }

  handleSubmit(): void {
    if (this.form.invalid) return;
    this.processing = true;
    const dto: BoxDTO = this.form.value;

    const req$ = this.mode === 'create'
      ? this.service.create(dto)
      : this.service.update(this.target!.id, dto);

    req$.subscribe({
      next: () => {
        this.toastr.success(this.mode === 'create' ? 'Box créée' : 'Box mise à jour');
        this.onUpdate.emit();
        this.showForm = false;
        this.form.reset();
        this.apercuCode = '';
        this.processing = false;
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Erreur');
        this.processing = false;
      }
    });
  }
}