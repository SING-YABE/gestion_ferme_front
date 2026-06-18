import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonDirective } from 'primeng/button';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { AuthService, SessionData } from '../../@core/service/auth.service';
import { SubscriptionService, PlanPublicDTO } from '../../@core/service/subscription.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FlexModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonDirective,
    PasswordModule,
    CheckboxModule,
    FormsModule,
    RouterModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm: FormGroup = this.fb.group({
    username: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  processing = false;
  errorMsg   = '';
  plans: PlanPublicDTO[] = [];
  /** ID du plan surligné dans la grille de la landing */
  activePlanId: number | null = null;

  // ── Démo IA — messages scriptés ──────────────────────────────────────────
  chatMessages: { type: 'ai' | 'user'; text: string; actions?: string[] }[] = [];
  private readonly chatScript = [
    {
      type: 'ai' as const,
      text: 'Bonjour Ibrahim. La truie N°12 n\'a pas mangé depuis 48h. Son poids a baissé de 2,3 kg.',
      actions: ['Voir les recommandations', 'Ignorer']
    },
    { type: 'user' as const, text: 'Oui, montrez-moi les recommandations.' },
    {
      type: 'ai' as const,
      text: '3 actions recommandées :\n• Vérifier la température du box (18-22°C)\n• Administrer complément B12\n• Isoler si fièvre > 39,5°C',
      actions: ['Créer un bon de soin']
    },
  ];
  private chatIndex    = 0;
  private chatInterval: ReturnType<typeof setInterval> | null = null;

  private returnUrl = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private authService: AuthService,
    private subscriptionService: SubscriptionService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    const fromQuery = this.route.snapshot.queryParams['returnUrl'] || '';
    const INVALID   = ['/login', '/unauthorized', ''];
    this.returnUrl  = INVALID.includes(fromQuery) ? '/dashboard' : fromQuery;
    localStorage.removeItem('redirectUrl');

    // Charger les plans publics depuis le backend
    this.subscriptionService.getPlansPublics().subscribe({
      next:  plans => { this.plans = plans; this.cdr.markForCheck(); },
      error: ()    => { /* page reste fonctionnelle sans les plans */ }
    });

    this.startChatDemo();
  }

  ngOnDestroy(): void {
    if (this.chatInterval) clearInterval(this.chatInterval);
  }

  private startChatDemo(): void {
    this.chatMessages = [this.chatScript[0]];
    this.chatIndex    = 1;

    this.chatInterval = setInterval(() => {
      if (this.chatIndex < this.chatScript.length) {
        this.chatMessages = [...this.chatMessages, this.chatScript[this.chatIndex++]];
        this.cdr.markForCheck();
      } else {
        if (this.chatInterval) clearInterval(this.chatInterval);
        setTimeout(() => {
          this.chatMessages = [];
          this.chatIndex    = 0;
          this.startChatDemo();
        }, 4000);
      }
    }, 2200);
  }

  scrollToLogin(): void {
    document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  handleSubmit(): void {
    if (this.loginForm.invalid) {
      this.toastr.error('Veuillez remplir tous les champs correctement');
      return;
    }

    this.processing = true;
    this.errorMsg   = '';

    const email    = this.loginForm.get('username')?.value;
    const password = this.loginForm.get('password')?.value;

    this.authService.login(email, password).subscribe({
      next: (session: SessionData) => {
        this.processing = false;
        const target = session.profile.role === 'ROLE_SUPER_ADMIN'
          ? '/super-admin'
          : session.profile.mustChangePassword
            ? '/change-password'
            : this.returnUrl;

        this.router.navigateByUrl(target).then(() => {
          const nom = session.profile.prenom && session.profile.nom
            ? `${session.profile.prenom} ${session.profile.nom}`
            : session.profile.email;
          this.toastr.success(`Bienvenue ${nom}`, 'Connexion réussie', {
            timeOut: 5000, progressBar: true, positionClass: 'toast-bottom-left'
          });
        });
      },
      error: (err: any) => {
        this.processing = false;
        this.errorMsg = err.error?.error || 'Email ou mot de passe incorrect';
        this.toastr.error(this.errorMsg);
      }
    });
  }

  formatPrix(prix: number): string {
    return prix === 0 ? 'Gratuit' : prix.toLocaleString('fr-FR');
  }

  /** Retourne le plan le moins cher parmi les plans payants (pour badge "Populaire"). */
  getProPlan(): PlanPublicDTO | undefined {
    return this.plans.filter(p => p.prixFcfa > 0).sort((a, b) => a.prixFcfa - b.prixFcfa)[0];
  }

  formatDuree(days: number, trialDays: number): string {
    if (days === 0 && trialDays > 0) return `${trialDays}j d'essai`;
    if (days >= 360) return '/ an';
    if (days >= 85)  return `/ ${Math.round(days / 30)} mois`;
    return `/ ${days}j`;
  }

  /**
   * Navigue vers l'inscription avec le plan pré-sélectionné (plans dynamiques du backend).
   * Pour les plans gratuits (prixFcfa === 0), simple redirection sans planId.
   */
  choosePlan(plan: PlanPublicDTO): void {
    this.activePlanId = plan.id;  // surligne le plan cliqué
    if (plan.prixFcfa === 0) {
      sessionStorage.removeItem('selectedPlanId');
      sessionStorage.removeItem('selectedPlanNom');
      this.router.navigate(['/inscription']);
    } else {
      sessionStorage.setItem('selectedPlanId',  String(plan.id));
      sessionStorage.setItem('selectedPlanNom', plan.nom);
      this.router.navigate(['/inscription'], { queryParams: { planId: plan.id } });
    }
  }

  /**
   * Appelé par les cartes statiques (fallback quand le backend est offline).
   * On n'a pas de planId réel, on stocke juste le nom pour l'afficher sur l'inscription.
   * @param fakeId  Identifiant négatif unique pour surligner la carte (ex: -2, -3, -4)
   * @param nom     Nom du plan à afficher (null = essai gratuit)
   */
  chooseStaticPlan(fakeId: number | null, nom: string | null): void {
    this.activePlanId = fakeId;
    sessionStorage.removeItem('selectedPlanId');
    if (nom) {
      sessionStorage.setItem('selectedPlanNom', nom);
      this.router.navigate(['/inscription']);
    } else {
      sessionStorage.removeItem('selectedPlanNom');
      this.router.navigate(['/inscription']);
    }
  }
}
