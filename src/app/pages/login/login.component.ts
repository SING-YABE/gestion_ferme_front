import { Component, OnInit } from '@angular/core';
import { FlexModule } from "@angular/flex-layout";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { ButtonDirective } from "primeng/button";
import { ToastrService } from "ngx-toastr";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { CommonModule } from '@angular/common';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { AuthService, SessionData } from '../../@core/service/auth.service';

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
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup = this.formBuilder.group({
    username: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  processing = false;
  checked = false;
  errorMsg = '';
  private returnUrl = '/dashboard';

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    // Si déjà connecté → dashboard directement
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    // Récupère l'URL de retour depuis les queryParams (mis par le guard)
    const fromQuery = this.route.snapshot.queryParams['returnUrl'] || '';
    const INVALID = ['/login', '/unauthorized', ''];
    this.returnUrl = INVALID.includes(fromQuery) ? '/dashboard' : fromQuery;

    // Nettoyer le stale localStorage de l'ancien guard
    localStorage.removeItem('redirectUrl');
  }

  handleSubmit() {
    if (this.loginForm.invalid) {
      this.toastr.error('Veuillez remplir tous les champs correctement');
      return;
    }

    this.processing = true;
    this.errorMsg = '';

    const email    = this.loginForm.get('username')?.value;
    const password = this.loginForm.get('password')?.value;

    this.authService.login(email, password).subscribe({
      next: (session: SessionData) => {
        this.processing = false;
        // Priorité : super admin → console, mustChangePassword → changer mdp, sinon → returnUrl
        const target = session.profile.role === 'ROLE_SUPER_ADMIN'
          ? '/super-admin'
          : session.profile.mustChangePassword
            ? '/change-password'
            : this.returnUrl;

        this.router.navigateByUrl(target).then(() => {
          const nomComplet = session.profile.prenom && session.profile.nom
            ? `${session.profile.prenom} ${session.profile.nom}`
            : session.profile.email;

          this.toastr.success(
            `Bienvenue ${nomComplet}`,
            'Connexion réussie',
            { timeOut: 5000, progressBar: true, positionClass: 'toast-bottom-left' }
          );
        });
      },
      error: (err: any) => {
        this.processing = false;
        this.errorMsg = err.error?.error || 'Email ou mot de passe incorrect';
        this.toastr.error(this.errorMsg);
      }
    });
  }
}
