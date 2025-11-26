import { Component, OnInit } from '@angular/core';
import { FlexModule } from "@angular/flex-layout";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { ButtonDirective } from "primeng/button";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";
import { CommonModule } from '@angular/common';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../@core/service/auth.service';

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
    FormsModule
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

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {}

  handleSubmit() {
    if (this.loginForm.invalid) {
      this.toastr.error('Veuillez remplir tous les champs correctement');
      return;
    }

    this.processing = true;
    this.errorMsg = '';
    
    // 🔥 Données pour ton backend Spring
    const email = this.loginForm.get('username')?.value;
    const password = this.loginForm.get('password')?.value;

    // 🔥 Appel direct au service d'authentification
    this.authService.login(email, password).subscribe({
      next: (response: any) => {
        this.processing = false;
        
        // 🔥 Stocker les données utilisateur
        this.authService.setCurrentUser(response);
        
        // 🔥 Stocker le token séparé si "se rappeler de moi"
        if (this.checked && response.token) {
          localStorage.setItem('token', response.token);
        }

        // 🔥 Redirection vers le dashboard
        const redirectUrl = localStorage.getItem('redirectUrl') || '/dashboard';
        this.router.navigateByUrl(redirectUrl).then(() => {
          const nomComplet = response.nom && response.prenom 
            ? `${response.nom} ${response.prenom}`
            : response.username;
            
          this.toastr.success(
            `Bienvenue ${nomComplet}`,
            'Connexion réussie',
            { timeOut: 10000, progressBar: true, positionClass: 'toast-bottom-left' }
          );
        });
      },
      error: (err: any) => {
        console.log(err);
        this.processing = false;
        this.errorMsg = err.error?.error || 'Email ou mot de passe incorrect';
        this.toastr.error(this.errorMsg);
      }
    });
  }
}