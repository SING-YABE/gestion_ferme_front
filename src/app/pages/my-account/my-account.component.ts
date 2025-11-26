import { Component, OnInit } from '@angular/core';
import { AppService } from "../../@core/service/app.service";
import { AuthService } from '../../@core/service/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit {
  user: any = {};  
  userConnected: any = null;  

  constructor(
    private appService: AppService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.appService.setTitle('Mon compte');

    // 🔥 SIMPLIFICATION : Utiliser directement les données du user connecté
    const currentUser = this.authService.getCurrentUser();
    this.user = currentUser || {};  
    
    console.log("Information de l'utilisateur :", this.user);

    // 🔥 SIMPLIFICATION : Préparer les données pour l'affichage
    if (this.user) {
      this.userConnected = {
        nom: this.user.nom || 'Non défini',
        prenom: this.user.prenom || 'Non défini', 
        role: this.user.role || 'Utilisateur',
        email: this.user.username || this.user.email,
        nomComplet: `${this.user.nom || ''} ${this.user.prenom || ''}`.trim() || this.user.username,
        id: this.user.id
      };
      
      console.log("Informations formatées :", this.userConnected);
    }
  }

  // 🔥 SUPPRESSION : Pas besoin de gestion détaillée des rôles pour l'instant

  redirectToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}