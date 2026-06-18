import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SubscriptionService, SubscriptionStatusDTO } from '../../@core/service/subscription.service';

/**
 * Bannière d'alerte flottante affichée dans le layout principal.
 * Visible uniquement si :
 *   - statut TRIAL et daysLeft <= 5
 *   - statut GRACE (toujours visible)
 *   - statut EXPIRED / SUSPENDED / CANCELLED
 *
 * La bannière est masquable par l'utilisateur (sessionStorage) sauf si
 * l'accès est bloqué (accessAutorise === false).
 */
@Component({
  selector: 'app-subscription-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscription-banner.component.html',
  styleUrl:    './subscription-banner.component.scss',
})
export class SubscriptionBannerComponent implements OnInit {

  status: SubscriptionStatusDTO | null = null;
  dismissed = false;

  constructor(
    private subscriptionService: SubscriptionService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.subscriptionService.getMySubscription().subscribe({
      next: s => {
        this.status = s;
        // Vérifier si l'utilisateur a déjà fermé la bannière ce session
        if (this.shouldShow && !this.isBlocking) {
          this.dismissed = sessionStorage.getItem('sub_banner_dismissed') === '1';
        }
      },
      error: () => { /* on n'affiche rien si l'appel échoue */ }
    });
  }

  /** Faut-il afficher la bannière ? */
  get shouldShow(): boolean {
    if (!this.status) return false;
    const { statut, daysLeft } = this.status;
    if (statut === 'TRIAL'  && (daysLeft ?? 99) <= 5) return true;
    if (statut === 'GRACE')     return true;
    if (statut === 'EXPIRED')   return true;
    if (statut === 'SUSPENDED') return true;
    if (statut === 'CANCELLED') return true;
    return false;
  }

  /** Accès totalement bloqué — bannière non masquable */
  get isBlocking(): boolean {
    return this.status ? !this.status.accessAutorise : false;
  }

  get visible(): boolean {
    return this.shouldShow && (!this.dismissed || this.isBlocking);
  }

  get bannerType(): 'warn' | 'danger' {
    const s = this.status?.statut;
    return (s === 'EXPIRED' || s === 'SUSPENDED' || s === 'CANCELLED') ? 'danger' : 'warn';
  }

  get message(): string {
    if (!this.status) return '';
    const { statut, daysLeft, planNom } = this.status;
    if (statut === 'TRIAL')     return `Votre essai gratuit expire dans ${daysLeft} jour(s). Souscrivez un plan pour continuer.`;
    if (statut === 'GRACE')     return `Votre abonnement a expiré. Vous avez encore ${daysLeft} jour(s) pour renouveler avant la suspension.`;
    if (statut === 'EXPIRED')   return `Votre abonnement "${planNom}" a expiré. Renouvelez pour continuer à utiliser FarmPro.`;
    if (statut === 'SUSPENDED') return `Votre compte est suspendu. Contactez le support ou renouvelez votre abonnement.`;
    if (statut === 'CANCELLED') return `Votre abonnement a été annulé. Souscrivez un nouveau plan pour réactiver votre compte.`;
    return '';
  }

  dismiss(): void {
    if (this.isBlocking) return;
    this.dismissed = true;
    sessionStorage.setItem('sub_banner_dismissed', '1');
  }

  goToPay(): void {
    this.router.navigate(['/abonnement/payer']);
  }

  goToStatut(): void {
    this.router.navigate(['/abonnement/statut']);
  }
}
