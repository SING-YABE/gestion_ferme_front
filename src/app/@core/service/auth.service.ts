import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';

export interface LoginResponse {
  token: string;
  role?: string;
  username: string;
  id?: number;
  nom?: string;
  prenom?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/login';
  private helper = new JwtHelperService();

  // Initialisation à partir du localStorage
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(this.loadUserFromStorage());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private loadUserFromStorage(): LoginResponse | null {
    const userData = localStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, { email, password }).pipe(
      tap((res) => {
        this.setCurrentUser(res);
        console.log('✅ Utilisateur connecté :', res);
      })
    );
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  isLoggedIn(): boolean {
    const user = this.getCurrentUser();
    return !!user?.token;
  }

  getCurrentUser(): LoginResponse | null {
    const user = this.currentUserSubject.value;
    if (!user) return this.loadUserFromStorage();
    return user;
  }

  // Méthode publique pour mettre à jour le user
  setCurrentUser(user: LoginResponse) {
    this.currentUserSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Méthode pour vérifier les autorisations
  hasRole(role: string): boolean {
    const userRole = this.getRole();
    return userRole === role;
  }
   // 🔥 AJOUT : Méthode pour récupérer les données du token
  getTokenData(): any {
    const user = this.getCurrentUser();
    if (!user?.token) return null;
    
    try {
      return this.helper.decodeToken(user.token);
    } catch (error) {
      console.error('Erreur décodage token:', error);
      return null;
    }
  }
  
}