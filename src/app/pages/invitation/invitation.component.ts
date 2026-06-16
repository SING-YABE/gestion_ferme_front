import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PasswordModule } from 'primeng/password';
import { ButtonDirective } from 'primeng/button';
import { ToastrService } from 'ngx-toastr';
import { InvitationService } from '../../@core/service/invitation.service';
import { AuthService } from '../../@core/service/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const p = control.get('newPassword')?.value;
  const c = control.get('confirmPassword')?.value;
  return p && c && p !== c ? { mismatch: true } : null;
}

/**
 * Page d'activation du compte via lien d'invitation.
 * Route publique : /invitation?token=xxx
 *
 * Flux :
 *   1. Lit le token depuis l'URL
 *   2. L'utilisateur choisit son mot de passe
 *   3. POST /api/invitations/validate → reçoit JWT
 *   4. Stocke la session + redirige vers /dashboard
 */
@Component({
  selector: 'app-invitation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PasswordModule, ButtonDirective],
  templateUrl: './invitation.component.html',
  styleUrl: './invitation.component.scss'
})
export class InvitationComponent implements OnInit {

  token = '';
  processing = false;
  tokenInvalid = false;   // true si le token est absent de l'URL
  errorMsg = '';

  form: FormGroup = this.fb.group({
    newPassword:     new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
  }, { validators: passwordMatchValidator });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private invitationService: InvitationService,
    private authService: AuthService,
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.tokenInvalid = true;
    }
  }

  handleSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.processing = true;
    this.errorMsg = '';

    this.invitationService.validateInvitation({
      token: this.token,
      newPassword: this.form.value.newPassword
    }).subscribe({
      next: (res) => {
        // Stocker le token JWT et récupérer le profil complet via /api/me
        // On réutilise le mécanisme existant de AuthService
        const tempSession = { token: res.token, profile: null as any };
        (this.authService as any).saveSession(tempSession);

        this.http.get<any>(`${environment.apiUrl}/api/me`).subscribe({
          next: (profile) => {
            (this.authService as any).saveSession({ token: res.token, profile });
            (this.authService as any).sessionSubject.next({ token: res.token, profile });

            this.toastr.success(
              `Bienvenue dans ${res.nomFerme} !`,
              'Compte activé',
              { timeOut: 5000, progressBar: true }
            );
            this.router.navigate(['/dashboard']);
          },
          error: () => {
            // Fallback : on redirige quand même
            this.router.navigate(['/dashboard']);
          }
        });
      },
      error: (err) => {
        this.processing = false;
        this.errorMsg = err.error?.error ?? 'Lien invalide ou expiré.';
      }
    });
  }

  field(name: string) { return this.form.get(name); }
  isInvalid(name: string) {
    const f = this.field(name);
    return f?.invalid && f?.touched;
  }
}
