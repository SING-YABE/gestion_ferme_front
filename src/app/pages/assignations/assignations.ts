// src/app/pages/assignations/assignations.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { AuthService, LoginResponse } from '../../@core/service/auth.service';
import { ChoisirGestionnaireComponent } from '../choisir-gestionnaire/choisir-gestionnaire';
import { MesAssignationsComponent } from '../mes-assignations/mes-assignations';

@Component({
  selector: 'app-assignations',
  standalone: true,
  imports: [
    CommonModule,
    TagModule,
    ChoisirGestionnaireComponent,
    MesAssignationsComponent
  ],
  template: `
    <div class="card">
      <!-- En-tête commune -->
      <div class="flex justify-content-between align-items-center mb-4">
        <h2>Gestion des Assignations</h2>
        <div *ngIf="utilisateurConnecte" class="flex align-items-center gap-2 text-color-secondary">
          <i class="pi pi-user"></i>
          <span class="text-sm">{{ utilisateurConnecte.prenom }} {{ utilisateurConnecte.nom }}</span>
          <p-tag 
            [value]="getRoleDisplayName()" 
            [severity]="getRoleSeverity()">
          </p-tag>
        </div>
      </div>

      <!-- Dernier approbateur voit les assignations sans gestionnaire -->
      <app-choisir-gestionnaire 
        *ngIf="estDernierApprobateur">
      </app-choisir-gestionnaire>

      <!-- Gestionnaire voit ses assignations -->
      <app-mes-assignations 
        *ngIf="estGestionnaire">
      </app-mes-assignations>

      <!-- Message si aucun rôle approprié -->
      <div *ngIf="!estDernierApprobateur && !estGestionnaire" class="text-center p-4">
        <i class="pi pi-info-circle text-color-secondary" style="font-size: 3rem"></i>
        <h3 class="mt-3 mb-2">Accès non autorisé</h3>
        <p class="text-color-secondary">
          Vous n'avez pas les permissions nécessaires pour accéder à la gestion des assignations.
        </p>
        <p class="text-sm text-color-secondary mt-2">
          Cette fonctionnalité est réservée aux gestionnaires et au dernier approbateur.
        </p>
      </div>
    </div>
  `
})
export class AssignationsComponent implements OnInit {
  utilisateurConnecte: LoginResponse | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.utilisateurConnecte = this.authService.getCurrentUser();
  }

  get estDernierApprobateur(): boolean {
    const role = this.utilisateurConnecte?.role?.toUpperCase();
    return role === 'DERNIER_APPROBATEUR' || role === 'APPROBATEUR';
  }

  get estGestionnaire(): boolean {
    const role = this.utilisateurConnecte?.role?.toUpperCase();
    return role === 'GESTIONNAIRE';
  }

  getRoleDisplayName(): string {
    const role = this.utilisateurConnecte?.role;
    if (!role) return 'Utilisateur';
    
    switch(role.toUpperCase()) {
      case 'DERNIER_APPROBATEUR': return 'Dernier Approbateur';
      case 'APPROBATEUR': return 'Approbateur';
      case 'GESTIONNAIRE': return 'Gestionnaire';
      default: return role;
    }
  }

  getRoleSeverity(): "success" | "info" | "warning" | "danger" | "secondary" {
    const role = this.utilisateurConnecte?.role?.toUpperCase();
    if (role === 'DERNIER_APPROBATEUR' || role === 'APPROBATEUR') return "warning";
    if (role === 'GESTIONNAIRE') return "info";
    return "secondary";
  }
}