import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SubscriptionService, SubscriptionStatusDTO } from '../../@core/service/subscription.service';

/**
 * Page de statut de l'abonnement en cours.
 * Affiche : plan actif, dates, limites, fonctionnalités, et un CTA pour payer/renouveler.
 */
@Component({
  selector: 'app-statut-abonnement',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './statut-abonnement.component.html',
  styleUrl: './statut-abonnement.component.scss',
})
export class StatutAbonnementComponent implements OnInit {

  status: SubscriptionStatusDTO | null = null;
  loading = true;
  error = '';

  constructor(
    private subscriptionService: SubscriptionService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.subscriptionService.getMySubscription().subscribe({
      next:  s  => { this.status = s;  this.loading = false; },
      error: () => { this.error = 'Impossible de charger votre abonnement.'; this.loading = false; }
    });
  }

  goToPay(): void {
    this.router.navigate(['/abonnement/payer']);
  }

  /** Libellé lisible du statut */
  statutLabel(statut: string): string {
    const map: Record<string, string> = {
      TRIAL:     'Essai gratuit',
      ACTIVE:    'Actif',
      GRACE:     'Période de grâce',
      EXPIRED:   'Expiré',
      SUSPENDED: 'Suspendu',
      CANCELLED: 'Annulé',
    };
    return map[statut] ?? statut;
  }

  /** Couleur CSS du badge de statut */
  statutColor(statut: string): string {
    const map: Record<string, string> = {
      TRIAL:     'trial',
      ACTIVE:    'active',
      GRACE:     'grace',
      EXPIRED:   'expired',
      SUSPENDED: 'suspended',
      CANCELLED: 'cancelled',
    };
    return map[statut] ?? 'muted';
  }

  /** Afficher le CTA "Payer / Renouveler" */
  showPayCta(statut: string): boolean {
    return ['TRIAL', 'GRACE', 'EXPIRED', 'SUSPENDED', 'CANCELLED'].includes(statut);
  }

  formatLimit(val: number): string {
    return val === -1 ? '∞' : String(val);
  }
}
