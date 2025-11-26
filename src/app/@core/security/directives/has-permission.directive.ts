import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnChanges } from '@angular/core';
import { AuthService } from '../../service/auth.service';  // 🔥 Chemin corrigé

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnChanges {
  private requiredPermissions: string[] = [];

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) { }

  // 🔥 ADAPTATION : Accepte string ou string[]
  @Input()
  set appHasPermission(permissions: string | string[]) {
    if (typeof permissions === 'string') {
      this.requiredPermissions = [permissions];
    } else {
      this.requiredPermissions = permissions;
    }
    this.updateView();
  }

  ngOnInit(): void {
    this.updateView();
  }

  ngOnChanges(): void {
    this.updateView();
  }

  private updateView() {
    // 🔥 ADAPTATION : Ton backend utilise 'role' au lieu de 'permissions'
    const tokenData = this.authService.getTokenData();
    const userRole = tokenData?.role || '';
    
    // 🔥 Vérifier si l'utilisateur a le rôle requis
    const hasPermission = this.requiredPermissions.some(requiredRole => 
      userRole === requiredRole
    );

    if (hasPermission) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}