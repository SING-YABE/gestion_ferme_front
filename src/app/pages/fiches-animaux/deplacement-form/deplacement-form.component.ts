import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ToastrService } from 'ngx-toastr';
import { DeplacementService, HistoriqueDeplacementResponseDTO } from '../../../@core/service/deplacement.service';
import { BoxService, BoxResponseDTO } from '../../../@core/service/box.service';
import { BatimentService, BatimentResponseDTO } from '../../../@core/service/batiment.service';
import { AnimalResponseDTO } from '../../../@core/service/animal.service';

@Component({
  selector: 'app-deplacement-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    ButtonModule, DialogModule, DropdownModule,
    InputTextareaModule, TableModule, TooltipModule
  ],
  templateUrl: './deplacement-form.component.html'
})
export class DeplacementFormComponent implements OnInit {
  @Input() animal!: AnimalResponseDTO;
  @Output() onUpdate = new EventEmitter<void>();

  showDeplacement = false;
  showHistorique = false;
  processing = false;

  form!: FormGroup;
  batiments: BatimentResponseDTO[] = [];
  boxesDisponibles: BoxResponseDTO[] = [];
  historique: HistoriqueDeplacementResponseDTO[] = [];
  loadingHistorique = false;

  constructor(
    private fb: FormBuilder,
    private deplacementService: DeplacementService,
    private boxService: BoxService,
    private batimentService: BatimentService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      batimentId: [null, Validators.required],
      nouvelleBoxId: [null, Validators.required],
      motif: ['']
    });

    this.batimentService.getAll().subscribe(data => this.batiments = data);

    this.form.get('batimentId')?.valueChanges.subscribe(batimentId => {
      this.boxesDisponibles = [];
      this.form.patchValue({ nouvelleBoxId: null });
      if (batimentId) {
        this.boxService.getByBatiment(batimentId).subscribe(boxes => {
          this.boxesDisponibles = boxes.filter(b => b.code !== this.animal.boxCode);
        });
      }
    });
  }

  ouvrirDeplacement(): void {
    this.form.reset();
    this.boxesDisponibles = [];
    this.showDeplacement = true;
  }

  ouvrirHistorique(): void {
    this.showHistorique = true;
    this.loadingHistorique = true;
    this.deplacementService.getHistoriqueByAnimal(this.animal.id).subscribe({
      next: data => { this.historique = data; this.loadingHistorique = false; },
      error: () => { this.toastr.error('Erreur chargement historique'); this.loadingHistorique = false; }
    });
  }

  handleSubmit(): void {
    if (this.form.invalid) return;
    this.processing = true;

    const dto = {
      animalId: this.animal.id,
      nouvelleBoxId: this.form.value.nouvelleBoxId,
      motif: this.form.value.motif || null
    };

    this.deplacementService.deplacerAnimal(dto).subscribe({
      next: () => {
        this.toastr.success(`${this.animal.codeAnimal} déplacé avec succès`);
        this.showDeplacement = false;
        this.processing = false;
        this.onUpdate.emit();
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Erreur lors du déplacement');
        this.processing = false;
      }
    });
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}