import { Component, OnInit } from '@angular/core';
import { AppSettings } from '../../../models/app-settings.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { ParametrageService, ParametresEleveur } from '../../../@core/service/parametrage.service';
@Component({
  selector: 'app-parametrages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parametrages.component.html',
  styleUrl: './parametrages.component.scss'
})
export class ParametragesComponent implements OnInit {

  activeSection: 'ferme' | 'logo' | 'advisor' = 'ferme';

  settings: AppSettings = {
    id: 0,
    farmName: '',
    contactEmail: '',
    contactTel: '',
    slogan: '',
    logoPath: '',
  };
  parametresEleveur: ParametresEleveur = {
  seuilNesVivants: 7,
  nbMisesBasMax: 3,
  seuilOccupationBoxWarning: 0.85,
  seuilOccupationBoxCritique: 0.95
};
isLoadingAdvisor: boolean = false;
advisorSaved: boolean = false;

  selectedFile: File | null = null;
  selectedFileName: string = '';
  isLoading: boolean = false;

  constructor(private parametrageService: ParametrageService) {}

  ngOnInit(): void {
    this.loadSettings();
    this.loadParametresEleveur();
  }

  loadParametresEleveur(): void {
  this.parametrageService.getParametresEleveur().subscribe({
    next: (data) => this.parametresEleveur = data,
    error: (err) => console.error('Erreur chargement paramètres advisor', err)
  });
}

saveParametresEleveur(): void {
  this.isLoadingAdvisor = true;
  this.advisorSaved = false;
  this.parametrageService.saveParametresEleveur(this.parametresEleveur).subscribe({
    next: (res) => {
      this.parametresEleveur = res;
      this.isLoadingAdvisor = false;
      this.advisorSaved = true;
      setTimeout(() => this.advisorSaved = false, 3000);
    },
    error: (err) => {
      console.error('Erreur enregistrement paramètres advisor', err);
      this.isLoadingAdvisor = false;
    }
  });
}

  loadSettings(): void {
    this.isLoading = true;
    this.parametrageService.getSettings().subscribe({
      next: (data) => { this.settings = data; this.isLoading = false; },
      error: (err) => { console.error('Erreur chargement paramètres', err); this.isLoading = false; }
    });
  }

  saveSettings(): void {
    this.isLoading = true;
    // ✅ On envoie les 4 champs attendus par le backend
    this.parametrageService.updateSettings({
      farmName:     this.settings.farmName,
      contactEmail: this.settings.contactEmail,
      contactTel:   this.settings.contactTel,
      slogan:       this.settings.slogan
    }).subscribe({
      next: (res) => { this.settings = res; this.isLoading = false; },
      error: (err) => { console.error('Erreur enregistrement', err); this.isLoading = false; }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image'); return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('La taille du fichier ne doit pas dépasser 2 Mo'); return;
    }

    this.selectedFile = file;
    this.selectedFileName = file.name;
  }

  uploadLogo(): void {
    if (!this.selectedFile) return;
    this.isLoading = true;
    this.parametrageService.uploadLogo(this.selectedFile).subscribe({
      next: (res) => {
        this.settings = res;
        this.isLoading = false;
        this.selectedFile = null;
        this.selectedFileName = '';
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      },
      error: (err) => { console.error('Erreur upload', err); this.isLoading = false; }
    });
  }

  // ✅ Un seul return, pas de code mort
  get logoUrl(): string | null {
    if (!this.settings?.logoPath) return null;
    return `${environment.apiUrl}/uploads/logos/${this.settings.logoPath}`;
  }
}