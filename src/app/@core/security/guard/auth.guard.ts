import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../service/auth.service';

/**
 * Guard fonctionnel (Angular 15+).
 *
 * Usage dans les routes :
 *   canActivate: [authGuard]
 *   data: { roles: ['ROLE_GERANT', 'ROLE_ADMINISTRATEUR'] }
 *   data: { permissions: ['VENTE_WRITE'] }
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Vérification des rôles requis
  const requiredRoles: string[] = route.data?.['roles'] ?? [];
  if (requiredRoles.length > 0 && !authService.hasAnyRole(requiredRoles)) {
    router.navigate(['/unauthorized']);
    return false;
  }

  // Vérification des permissions requises
  const requiredPermissions: string[] = route.data?.['permissions'] ?? [];
  if (requiredPermissions.length > 0 && !authService.hasAllPermissions(requiredPermissions)) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};

/**
 * Classe conservée pour la rétro-compatibilité avec les anciens imports.
 * Préférer authGuard (fonction) dans les nouvelles routes.
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    const requiredRoles: string[] = route.data?.['roles'] ?? [];
    if (requiredRoles.length > 0 && !this.authService.hasAnyRole(requiredRoles)) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    const requiredPermissions: string[] = route.data?.['permissions'] ?? [];
    if (requiredPermissions.length > 0 && !this.authService.hasAllPermissions(requiredPermissions)) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }
}
