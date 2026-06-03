import { Directive, Input, OnInit, OnChanges, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AuthService } from '../../service/auth.service';

/**
 * Directive structurelle basée sur les PERMISSIONS.
 *
 * Affiche l'élément uniquement si l'utilisateur possède la/les permission(s).
 * Pour plusieurs permissions, toutes doivent être présentes (logique AND).
 *
 * Usage :
 *   <button *appHasPermission="'VENTE_WRITE'">Créer vente</button>
 *   <div *appHasPermission="['ANIMAL_WRITE', 'ANIMAL_DELETE']">...</div>
 */
@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnChanges {

  private permissions: string[] = [];

  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  @Input()
  set appHasPermission(value: string | string[]) {
    this.permissions = Array.isArray(value) ? value : [value];
    this.updateView();
  }

  ngOnInit(): void { this.updateView(); }
  ngOnChanges(): void { this.updateView(); }

  private updateView(): void {
    const hasAccess = this.permissions.every(p => this.authService.hasPermission(p));
    this.viewContainer.clear();
    if (hasAccess) this.viewContainer.createEmbeddedView(this.templateRef);
  }
}

/**
 * Directive structurelle basée sur le RÔLE.
 *
 * Affiche l'élément uniquement si le rôle correspond (au moins un).
 *
 * Usage :
 *   <nav *appHasRole="'ROLE_GERANT'">Menu gérant</nav>
 *   <div *appHasRole="['ROLE_GERANT', 'ROLE_ADMINISTRATEUR']">...</div>
 */
@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective implements OnInit, OnChanges {

  private roles: string[] = [];

  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  @Input()
  set appHasRole(value: string | string[]) {
    this.roles = Array.isArray(value) ? value : [value];
    this.updateView();
  }

  ngOnInit(): void { this.updateView(); }
  ngOnChanges(): void { this.updateView(); }

  private updateView(): void {
    const hasAccess = this.authService.hasAnyRole(this.roles);
    this.viewContainer.clear();
    if (hasAccess) this.viewContainer.createEmbeddedView(this.templateRef);
  }
}
