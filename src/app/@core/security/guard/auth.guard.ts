import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from "../../service/auth.service"; // 🔥 Chemin corrigé

@Injectable({ providedIn: 'root' })
export class AuthGuard  {
    constructor(
        private router: Router,
        private authService: AuthService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

      // 🔥 ADAPTATION : Utiliser isLoggedIn() au lieu de isAuthenticated()
      if (this.authService.isLoggedIn()) {
        const tokenData = this.authService.getTokenData();
        
        // 🔥 ADAPTATION : Ton backend utilise 'role' au lieu de 'permissions'
        const userRole = tokenData?.role || '';

        // 🔥 ADAPTATION : Vérifier les rôles au lieu des permissions
        if (route.data['roles'] !== undefined) {
          const requiredRoles = route.data['roles'];
          
          // Si requiredRoles est un tableau
          if (Array.isArray(requiredRoles)) {
            if (requiredRoles.includes(userRole)) {
              return true;
            } else {
              this.router.navigate(['/unauthorized']); // 🔥 Optionnel
              return false;
            }
          } 
          // Si requiredRoles est une string simple
          else if (userRole === requiredRoles) {
            return true;
          } else {
            this.router.navigate(['/unauthorized']); // 🔥 Optionnel
            return false;
          }
        }
        
        // Si aucune restriction de rôle, l'accès est autorisé
        return true;
      }

      // 🔥 ADAPTATION : Utiliser localStorage pour la cohérence
      localStorage.setItem('redirectUrl', state.url);
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
}