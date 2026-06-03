import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AppService } from '../../@core/service/app.service';
import { AuthService, UserProfile } from '../../@core/service/auth.service';

@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit {

  profile: UserProfile | null = null;

  constructor(
    private appService: AppService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.appService.setTitle('Mon compte');
    this.profile = this.authService.getProfile();
  }

  // ── Helpers d'affichage ──────────────────────────────────────────────────

  get initiales(): string {
    if (!this.profile) return '?';
    const p = (this.profile.prenom?.[0] ?? '').toUpperCase();
    const n = (this.profile.nom?.[0] ?? '').toUpperCase();
    return `${p}${n}` || '?';
  }

  get roleLabel(): string {
    const map: Record<string, string> = {
      'ROLE_ADMINISTRATEUR': 'Administrateur',
      'ROLE_GERANT':         'Gérant',
      'ROLE_RESPONSABLE':    'Responsable',
      'ROLE_OUVRIER':        'Ouvrier',
    };
    return map[this.profile?.role ?? ''] ?? this.profile?.role ?? '—';
  }

  get roleCssClass(): string {
    const map: Record<string, string> = {
      'ROLE_ADMINISTRATEUR': 'role-admin',
      'ROLE_GERANT':         'role-gerant',
      'ROLE_RESPONSABLE':    'role-responsable',
      'ROLE_OUVRIER':        'role-ouvrier',
    };
    return map[this.profile?.role ?? ''] ?? '';
  }

  redirectToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
