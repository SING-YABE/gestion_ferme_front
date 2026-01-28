import { Component, OnInit } from '@angular/core';
import { AppSettings } from '../../../models/app-settings.model';
import { ParametrageService } from '../../../@core/service/parametrage.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-parametrages',
  standalone: true,
  imports: [ 
  CommonModule,
  FormsModule
  ],
  templateUrl: './parametrages.component.html',
  styleUrl: './parametrages.component.scss'
})





// export class ParametragesComponent {

//  settings!: AppSettings;
//   selectedFile: File | null = null;
// selectedFileName: string = ''

//   constructor(private parametrageService: ParametrageService) {}

//   ngOnInit(): void {
//     this.loadSettings();
//   }

//   loadSettings() {
//     this.parametrageService.getSettings()
//       .subscribe(data => this.settings = data);
//   }

//   saveSettings() {
//     this.parametrageService.updateSettings({
//       farmName: this.settings.farmName,
//       contactEmail: this.settings.contactEmail
//     }).subscribe(res => this.settings = res);
//   }


// onFileSelected(event: any) {
//   const file = event.target.files[0];
//   if (file) {
//     this.selectedFile = file;
//     this.selectedFileName = file.name;
//   }
// }
//   uploadLogo() {
//     if (!this.selectedFile) return;

//     this.parametrageService.uploadLogo(this.selectedFile)
//       .subscribe(res => this.settings = res);
//   }

//   get logoUrl(): string | null {
//     if (!this.settings?.logoPath) return null;
//     return `http://localhost:8080/uploads/logos/${this.settings.logoPath}`;
//   }
// }


export class ParametragesComponent implements OnInit {
  settings: AppSettings = {
      id: 0,          
    farmName: '',
    contactEmail: '',
    logoPath: '',
  };
  
  selectedFile: File | null = null;
  selectedFileName: string = '';
  isLoading: boolean = false;

  constructor(private parametrageService: ParametrageService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings() {
    this.isLoading = true;
    this.parametrageService.getSettings()
      .subscribe({
        next: (data) => {
          this.settings = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des paramètres', err);
          this.isLoading = false;
        }
      });
  }

  saveSettings() {
    this.isLoading = true;
    this.parametrageService.updateSettings({
      farmName: this.settings.farmName,
      contactEmail: this.settings.contactEmail
    }).subscribe({
      next: (res) => {
        this.settings = res;
        this.isLoading = false;
        alert('Paramètres enregistrés avec succès !');
      },
      error: (err) => {
        console.error('Erreur lors de l\'enregistrement', err);
        this.isLoading = false;
        alert('Erreur lors de l\'enregistrement');
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        alert('La taille du fichier ne doit pas dépasser 2 Mo');
        return;
      }
      
      this.selectedFile = file;
      this.selectedFileName = file.name;
    }
  }

  uploadLogo() {
    if (!this.selectedFile) return;
    
    this.isLoading = true;
    this.parametrageService.uploadLogo(this.selectedFile)
      .subscribe({
        next: (res) => {
          this.settings = res;
          this.isLoading = false;
          this.selectedFile = null;
          this.selectedFileName = '';
          const fileInput = document.getElementById('fileInput') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
          alert('Logo uploadé avec succès !');
        },
        error: (err) => {
          console.error('Erreur lors de l\'upload', err);
          this.isLoading = false;
          alert('Erreur lors de l\'upload du logo');
        }
      });
  }

  get logoUrl(): string | null {
    if (!this.settings?.logoPath) return null;
    return `${environment.apiUrl}/uploads/logos/${this.settings.logoPath}`;
        return `http://localhost:8080/uploads/logos/${this.settings.logoPath}`;

  }
}