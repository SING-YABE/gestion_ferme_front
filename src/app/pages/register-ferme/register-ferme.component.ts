import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TenantService } from '../../@core/service/tenant.service';

/** Validateur personnalisé : les deux mots de passe doivent être identiques */
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password    = control.get('adminPassword')?.value;
  const confirm     = control.get('confirmPassword')?.value;
  return password && confirm && password !== confirm
    ? { passwordMismatch: true }
    : null;
}

/** Validateur : code ferme alphanumérique + underscore uniquement */
function slugValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value ?? '';
  return /^[a-zA-Z0-9_]{3,50}$/.test(value) ? null : { invalidSlug: true };
}

/**
 * Page d'inscription d'une nouvelle ferme (tenant SaaS).
 * Route publique : /inscription
 *
 * Formulaire en 2 sections :
 *   1. Informations de la ferme (nomFerme, fermeCode auto-généré)
 *   2. Compte administrateur (prénom, nom, email, mot de passe)
 *
 * Après succès → redirection vers /login avec le code ferme affiché.
 */
@Component({
  selector: 'app-register-ferme',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './register-ferme.component.html',
  styleUrl: './register-ferme.component.scss'
})
export class RegisterFermeComponent implements OnInit {

  /** Plan pré-sélectionné depuis la landing (null = essai gratuit) */
  selectedPlanId: number | null = null;
  selectedPlanNom: string | null = null;

  form: FormGroup = this.fb.group({
    // ── Section 1 : Ferme ──────────────────────────────────────────────
    nomFerme:  new FormControl('', [Validators.required, Validators.minLength(3)]),
    fermeCode: new FormControl('', [Validators.required, slugValidator]),

    // ── Section 2 : Administrateur ────────────────────────────────────
    adminPrenom:  new FormControl('', [Validators.required]),
    adminNom:     new FormControl('', [Validators.required]),
    adminEmail:   new FormControl('', [Validators.required, Validators.email]),
    adminPassword:   new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
  }, { validators: passwordMatchValidator });

  processing   = false;
  successCode  = '';   // Code affiché après inscription réussie
  errorMsg     = '';

  constructor(
    private fb: FormBuilder,
    private tenantService: TenantService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    // Auto-génère le fermeCode à partir du nom de la ferme
    this.form.get('nomFerme')!.valueChanges.subscribe((nom: string) => {
      if (nom && !this._codeEdited) {
        const slug = this._toSlug(nom);
        this.form.get('fermeCode')!.setValue(slug, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    // Lire le planId depuis l'URL (?planId=2) ou le sessionStorage (depuis la landing)
    const paramId  = this.route.snapshot.queryParamMap.get('planId');
    const storedId = sessionStorage.getItem('selectedPlanId');
    const planId   = paramId ?? storedId;

    if (planId && Number(planId) > 0) {
      // Plan dynamique (backend en ligne) — on a l'ID et le nom
      this.selectedPlanId  = Number(planId);
      this.selectedPlanNom = sessionStorage.getItem('selectedPlanNom') ?? `Plan #${this.selectedPlanId}`;
    } else {
      // Plan statique (backend offline) — on a seulement le nom stocké
      const nomStored = sessionStorage.getItem('selectedPlanNom');
      if (nomStored) {
        this.selectedPlanId  = null;   // pas d'ID réel
        this.selectedPlanNom = nomStored;
      }
    }
  }

  // Méthodes conservées pour rétro-compatibilité (code désormais en lecture seule)
  private _codeEdited = false;
  onCodeChange(): void { this._codeEdited = true; }
  resetCodeEdit(): void {
    this._codeEdited = false;
    const slug = this._toSlug(this.form.get('nomFerme')?.value ?? '');
    this.form.get('fermeCode')!.setValue(slug);
  }

  handleSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.processing = true;
    this.errorMsg   = '';

    const { nomFerme, fermeCode, adminPrenom, adminNom, adminEmail, adminPassword } = this.form.value;

    this.tenantService.registerFerme({
      fermeCode:    fermeCode.toLowerCase(),
      nomFerme,
      adminEmail,
      adminPassword,
      adminNom,
      adminPrenom,
    }).subscribe({
      next: (res) => {
        this.processing = false;
        this.successCode = res.fermeCode;
        this.toastr.success(
          `Ferme "${nomFerme}" créée avec succès !`,
          'Inscription réussie',
          { timeOut: 6000, progressBar: true, positionClass: 'toast-bottom-left' }
        );
        // Nettoyer le sessionStorage du plan sélectionné
        sessionStorage.removeItem('selectedPlanId');
        sessionStorage.removeItem('selectedPlanNom');
      },
      error: (err) => {
        this.processing = false;
        this.errorMsg = err.error?.error ?? 'Une erreur est survenue. Veuillez réessayer.';
        this.toastr.error(this.errorMsg, 'Erreur d\'inscription');
      }
    });
  }

  /** Après inscription réussie : paiement si plan choisi, sinon login */
  goToLogin(): void {
    if (this.selectedPlanId) {
      this.router.navigate(['/login'], {
        queryParams: { planId: this.selectedPlanId, returnUrl: `/abonnement/payer?planId=${this.selectedPlanId}` }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  /** Convertit un texte en slug valide pour PostgreSQL schema name */
  private _toSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')  // supprime les accents
      .replace(/[^a-z0-9_]/g, '_')   // remplace tout ce qui n'est pas alphanum/_ par _
      .replace(/_+/g, '_')            // fusionne les _ consécutifs
      .replace(/^_|_$/g, '')          // supprime _ en début/fin
      .substring(0, 50);
  }

  // Raccourcis pour les validations dans le template
  field(name: string) { return this.form.get(name); }
  isInvalid(name: string) {
    const f = this.field(name);
    return f?.invalid && f?.touched;
  }
}
