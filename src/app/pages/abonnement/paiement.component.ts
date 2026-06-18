import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SubscriptionService, PlanPublicDTO } from '../../@core/service/subscription.service';

/**
 * Flux de paiement Orange Money — 3 étapes :
 *   Étape 1 : Choisir un plan
 *   Étape 2 : Instructions (envoyer le montant au 56239334)
 *   Étape 3 : Saisir l'OTP + numéro de téléphone
 */
@Component({
  selector: 'app-paiement',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './paiement.component.html',
  styleUrl: './paiement.component.scss',
})
export class PaiementComponent implements OnInit {

  step = 1;
  plans: PlanPublicDTO[] = [];
  selectedPlan: PlanPublicDTO | null = null;
  loadingPlans = true;
  processing   = false;
  successData: { endDate: string; refundAmount?: number } | null = null;
  errorMsg = '';

  form: FormGroup = this.fb.group({
    phoneNumber: new FormControl('', [Validators.required, Validators.pattern(/^\+?[0-9]{8,15}$/)]),
    otp:         new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]),
  });

  readonly ORANGE_MONEY_NUMBER = '56239334';

  constructor(
    private fb: FormBuilder,
    private subscriptionService: SubscriptionService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    // Lire le planId pré-sélectionné depuis l'URL (?planId=2)
    const paramPlanId = this.route.snapshot.queryParamMap.get('planId');
    const preselectedId = paramPlanId ? Number(paramPlanId) : null;

    this.subscriptionService.getPlansPublics().subscribe({
      next: plans => {
        this.plans = plans.filter(p => p.prixFcfa > 0);
        this.loadingPlans = false;

        // Pré-sélectionner le plan si un planId est passé en paramètre
        if (preselectedId) {
          const found = this.plans.find(p => p.id === preselectedId);
          if (found) {
            this.selectedPlan = found;
            this.step = 2; // Sauter directement aux instructions de paiement
          }
        }
      },
      error: () => { this.loadingPlans = false; this.toastr.error('Impossible de charger les plans'); }
    });
  }

  selectPlan(plan: PlanPublicDTO): void {
    this.selectedPlan = plan;
    this.step = 2;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToOtp(): void {
    this.step = 3;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  back(): void {
    if (this.step > 1) { this.step--; this.errorMsg = ''; }
  }

  submit(): void {
    if (this.form.invalid || !this.selectedPlan) return;

    this.processing = true;
    this.errorMsg   = '';

    this.subscriptionService.pay({
      planId:      this.selectedPlan.id,
      phoneNumber: this.form.value.phoneNumber,
      otp:         this.form.value.otp,
    }).subscribe({
      next: res => {
        this.processing = false;
        if (res.success) {
          this.successData = { endDate: res.endDate!, refundAmount: res.refundAmount ?? undefined };
          this.step = 4;
        } else {
          this.errorMsg = res.message;
        }
      },
      error: err => {
        this.processing = false;
        this.errorMsg = err.error?.message || 'Erreur lors de la vérification du paiement.';
      }
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  formatPrix(prix: number): string {
    return prix.toLocaleString('fr-FR');
  }

  formatDuree(days: number): string {
    if (days >= 360) return '1 an';
    if (days >= 85)  return `${Math.round(days / 30)} mois`;
    return `${days} jours`;
  }
}
