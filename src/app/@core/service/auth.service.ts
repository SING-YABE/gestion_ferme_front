import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, switchMap } from 'rxjs';
import { PermissionType } from '../security/permissions.constants';
import { RoleType } from '../security/roles.constants';
import { environment } from '../../../environments/environment';

const BASE_URL = environment.apiUrl;

/** Réponse du backend au login */
export interface LoginResponse {
  token: string;
  role?: string;
  username: string;
}

/** Profil complet retourné par GET /api/me */
export interface UserProfile {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  poste: string;
  role: string;
  permissions: string[];   // permissions effectives (rôle + overrides)
}

/** Données stockées en session */
export interface SessionData {
  token: string;
  profile: UserProfile;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private sessionSubject = new BehaviorSubject<SessionData | null>(this.loadSession());
  session$ = this.sessionSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Vérifie l'expiration du token toutes les 30 secondes.
    // Si le token est expiré, déconnecte l'utilisateur immédiatement
    // sans attendre une prochaine requête API.
    setInterval(() => {
      if (this.sessionSubject.value && !this.isLoggedIn()) {
        this.logout();
      }
    }, 30_000);
  }

  // ─── Authentification ────────────────────────────────────────────────────

  /**
   * Login en deux étapes :
   * 1. POST /login → obtient le token
   * 2. GET /api/me → récupère le profil complet avec permissions
   */
  login(email: string, password: string): Observable<SessionData> {
    return this.http
      .post<LoginResponse>(`${BASE_URL}/login`, { email, password })
      .pipe(
        switchMap((loginRes) => {
          // Sauvegarde le token en session avant d'appeler /api/me
          this.saveSession({ token: loginRes.token, profile: null as any });

          // Super Admin → endpoint dédié ; utilisateur normal → /api/me
          const meUrl = loginRes.role === 'ROLE_SUPER_ADMIN'
            ? `${BASE_URL}/api/super-admin/me`
            : `${BASE_URL}/api/me`;

          return this.http.get<UserProfile>(meUrl).pipe(
            tap((profile) => {
              this.saveSession({ token: loginRes.token, profile });
            })
          );
        }),
        switchMap((_profile) => {
          const session = this.sessionSubject.value!;
          return new Observable<SessionData>(obs => { obs.next(session); obs.complete(); });
        })
      );
  }

  logout(): void {
    localStorage.removeItem('session');
    this.sessionSubject.next(null);
    this.router.navigate(['/login']);
  }

  // ─── Accès à la session ───────────────────────────────────────────────────

  isLoggedIn(): boolean {
    const token = this.sessionSubject.value?.token;
    if (!token) return false;
    return !this._isTokenExpired(token);
  }

  /** Décode le JWT et vérifie si le champ `exp` est dépassé. */
  private _isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // `exp` est en secondes Unix, Date.now() en millisecondes
      return payload.exp * 1000 < Date.now();
    } catch {
      // Token malformé → considéré expiré
      return true;
    }
  }

  getToken(): string | null {
    return this.sessionSubject.value?.token ?? null;
  }

  getProfile(): UserProfile | null {
    return this.sessionSubject.value?.profile ?? null;
  }

  getRole(): string | null {
    return this.getProfile()?.role ?? null;
  }

  getPermissions(): string[] {
    return this.getProfile()?.permissions ?? [];
  }

  // ─── Vérifications d'accès ────────────────────────────────────────────────

  /** Vérifie si l'utilisateur a un rôle donné */
  hasRole(role: RoleType | string): boolean {
    return this.getRole() === role;
  }

  /** Vérifie si l'utilisateur a AU MOINS UN des rôles donnés */
  hasAnyRole(roles: (RoleType | string)[]): boolean {
    const current = this.getRole();
    return current ? roles.includes(current) : false;
  }

  /** Vérifie si l'utilisateur possède une permission spécifique */
  hasPermission(permission: PermissionType | string): boolean {
    return this.getPermissions().includes(permission);
  }

  /** Vérifie si l'utilisateur possède TOUTES les permissions listées */
  hasAllPermissions(permissions: (PermissionType | string)[]): boolean {
    const current = this.getPermissions();
    return permissions.every(p => current.includes(p));
  }

  /** Vérifie si l'utilisateur possède AU MOINS UNE des permissions listées */
  hasAnyPermission(permissions: (PermissionType | string)[]): boolean {
    const current = this.getPermissions();
    return permissions.some(p => current.includes(p));
  }

  // ─── Rafraîchir le profil (après modification d'override) ────────────────

  /**
   * Recharge le profil depuis /api/me.
   * À appeler après qu'un admin a modifié les permissions d'un utilisateur.
   */
  refreshProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${BASE_URL}/api/me`).pipe(
      tap((profile) => {
        const current = this.sessionSubject.value;
        if (current) {
          const updated: SessionData = { ...current, profile };
          this.saveSession(updated);
        }
      })
    );
  }

  // ─── Rétro-compatibilité (anciens composants) ────────────────────────────

  /** @deprecated Utiliser getProfile() */
  getCurrentUser(): UserProfile | null {
    return this.getProfile();
  }

  /** @deprecated La session est déjà sauvegardée automatiquement au login */
  setCurrentUser(_user: any): void {
    // no-op : la session est gérée par login() via /api/me
  }

  /** @deprecated Utiliser getProfile() pour décoder les infos du token */
  getTokenData(): any {
    return this.getProfile();
  }

  // ─── Stockage ─────────────────────────────────────────────────────────────

  private saveSession(session: SessionData): void {
    this.sessionSubject.next(session);
    localStorage.setItem('session', JSON.stringify(session));
  }

  private loadSession(): SessionData | null {
    try {
      const raw = localStorage.getItem('session');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
