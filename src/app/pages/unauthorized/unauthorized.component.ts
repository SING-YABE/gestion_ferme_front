import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../@core/service/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; height: 100vh; gap: 16px;
      font-family: sans-serif; text-align: center; padding: 24px;
    ">
      <div style="font-size: 64px;">🔒</div>
      <h1 style="color: #e53e3e; margin: 0;">Accès refusé</h1>
      <p style="color: #666; max-width: 400px;">
        Vous n'avez pas les permissions nécessaires pour accéder à cette section.
      </p>
      <div style="display: flex; gap: 12px; margin-top: 8px;">
        <button
          (click)="goHome()"
          style="padding: 10px 24px; background: #2d8a4e; color: white;
                 border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
          Retour à l'accueil
        </button>
        <button
          (click)="logout()"
          style="padding: 10px 24px; background: #e53e3e; color: white;
                 border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
          Se déconnecter
        </button>
      </div>
    </div>
  `
})
export class UnauthorizedComponent {
  constructor(private router: Router, private authService: AuthService) {}

  goHome() { this.router.navigate(['/dashboard']); }
  logout()  { this.authService.logout(); }
}
