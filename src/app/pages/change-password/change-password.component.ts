import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../@core/service/auth.service';

/**
 * Page de changement de mot de passe obligatoire.
 *
 * Affichée automatiquement après login si mustChangePassword = true.
 * L'utilisateur ne peut pas accéder au reste de l'app tant qu'il n'a pas
 * défini un nouveau mot de passe.
 */
@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cp-page">
      <div class="cp-card">

        <!-- Icône -->
        <div class="cp-icon">
          <i class="pi pi-lock"></i>
        </div>

        <h2>Définissez votre mot de passe</h2>
        <p class="cp-subtitle">
          Pour des raisons de sécurité, vous devez changer le mot de passe
          temporaire qui vous a été communiqué.
        </p>

        <!-- Erreur -->
        <div *ngIf="errorMsg" class="cp-error">
          <i class="pi pi-exclamation-triangle"></i> {{ errorMsg }}
        </div>

        <!-- Succès -->
        <div *ngIf="successMsg" class="cp-success">
          <i class="pi pi-check-circle"></i> {{ successMsg }}
        </div>

        <form (ngSubmit)="submit()" class="cp-form">
          <!-- Mot de passe actuel -->
          <div class="cp-field">
            <label>Mot de passe temporaire actuel</label>
            <div class="input-wrapper">
              <input [type]="showCurrent ? 'text' : 'password'"
                     [(ngModel)]="currentPassword" name="current"
                     placeholder="Mot de passe communiqué par votre admin" required />
              <button type="button" class="toggle-eye" (click)="showCurrent = !showCurrent">
                <i [class]="showCurrent ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
              </button>
            </div>
          </div>

          <!-- Nouveau mot de passe -->
          <div class="cp-field">
            <label>Nouveau mot de passe</label>
            <div class="input-wrapper">
              <input [type]="showNew ? 'text' : 'password'"
                     [(ngModel)]="newPassword" name="new"
                     placeholder="Minimum 6 caractères" required />
              <button type="button" class="toggle-eye" (click)="showNew = !showNew">
                <i [class]="showNew ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
              </button>
            </div>
          </div>

          <!-- Confirmation -->
          <div class="cp-field">
            <label>Confirmer le nouveau mot de passe</label>
            <div class="input-wrapper">
              <input [type]="showConfirm ? 'text' : 'password'"
                     [(ngModel)]="confirmPassword" name="confirm"
                     placeholder="Répétez le nouveau mot de passe" required />
              <button type="button" class="toggle-eye" (click)="showConfirm = !showConfirm">
                <i [class]="showConfirm ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
              </button>
            </div>
            <span *ngIf="newPassword && confirmPassword && newPassword !== confirmPassword"
                  class="mismatch">Les mots de passe ne correspondent pas</span>
          </div>

          <button type="submit" class="cp-submit"
            [disabled]="loading || !currentPassword || !newPassword || !confirmPassword
                        || newPassword !== confirmPassword || newPassword.length < 6">
            <span *ngIf="!loading"><i class="pi pi-check"></i> Valider</span>
            <span *ngIf="loading"><i class="pi pi-spin pi-spinner"></i> En cours…</span>
          </button>
        </form>

      </div>
    </div>
  `,
  styles: [`
    .cp-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a3a0a 0%, #2d5016 50%, #3d6b1f 100%);
      padding: 24px;
    }

    .cp-card {
      background: #fff;
      border-radius: 16px;
      padding: 40px 36px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .cp-icon {
      width: 64px; height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2d5016, #4a7c2c);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 20px;
      i { color: white; font-size: 1.8rem; }
    }

    h2 { margin: 0 0 8px; font-size: 1.3rem; font-weight: 700; color: #111827; text-align: center; }

    .cp-subtitle {
      font-size: 0.875rem; color: #6b7280; text-align: center;
      margin: 0 0 24px; line-height: 1.5;
    }

    .cp-error {
      width: 100%; padding: 10px 14px; border-radius: 8px;
      background: #fef2f2; border: 1px solid #fca5a5;
      color: #dc2626; font-size: 0.85rem; margin-bottom: 16px;
      display: flex; align-items: center; gap: 8px;
    }

    .cp-success {
      width: 100%; padding: 10px 14px; border-radius: 8px;
      background: #f0f7eb; border: 1px solid #4a7c2c;
      color: #2d5016; font-size: 0.85rem; margin-bottom: 16px;
      display: flex; align-items: center; gap: 8px;
    }

    .cp-form { width: 100%; display: flex; flex-direction: column; gap: 18px; }

    .cp-field {
      display: flex; flex-direction: column; gap: 6px;
      label { font-size: 0.875rem; font-weight: 600; color: #374151; }
    }

    .input-wrapper {
      position: relative;
      input {
        width: 100%; height: 46px; padding: 0 44px 0 14px;
        border: 1px solid #d1d5db; border-radius: 8px;
        font-size: 0.95rem; box-sizing: border-box;
        &:focus { outline: none; border-color: #4a7c2c; box-shadow: 0 0 0 3px rgba(74,124,44,0.15); }
      }
    }

    .toggle-eye {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; color: #9ca3af;
      padding: 0; display: flex; align-items: center;
      &:hover { color: #374151; }
    }

    .mismatch { font-size: 0.8rem; color: #dc2626; }

    .cp-submit {
      width: 100%; height: 48px; border: none; border-radius: 8px;
      background: linear-gradient(135deg, #2d5016, #4a7c2c);
      color: white; font-size: 1rem; font-weight: 600; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: opacity 0.2s;
      i { font-size: 1rem; }
      &:hover:not(:disabled) { opacity: 0.9; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
  `]
})
export class ChangePasswordComponent {
  currentPassword = '';
  newPassword     = '';
  confirmPassword = '';

  showCurrent = false;
  showNew     = false;
  showConfirm = false;

  loading    = false;
  errorMsg   = '';
  successMsg = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  submit() {
    if (this.newPassword !== this.confirmPassword) return;
    if (this.newPassword.length < 6) return;

    this.loading  = true;
    this.errorMsg = '';

    this.http.post<{ message: string }>(
      `${environment.apiUrl}/api/me/change-password`,
      { currentPassword: this.currentPassword, newPassword: this.newPassword }
    ).subscribe({
      next: (res) => {
        this.loading    = false;
        this.successMsg = res.message;

        // Mettre à jour le profil en session (mustChangePassword → false)
        this.authService.refreshProfile().subscribe({
          next: () => setTimeout(() => this.router.navigateByUrl('/dashboard'), 1500),
          error: () => setTimeout(() => this.router.navigateByUrl('/dashboard'), 1500)
        });
      },
      error: (err) => {
        this.loading  = false;
        this.errorMsg = err.error?.error ?? 'Erreur lors du changement de mot de passe';
      }
    });
  }
}
