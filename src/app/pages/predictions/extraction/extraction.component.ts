import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Service
import { PredictionService } from '../../../@core/service/prediction.service';

@Component({
  selector: 'app-extraction',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    FileUploadModule,
    MessageModule,
    ProgressSpinnerModule,
    TableModule,
    TagModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './extraction.component.html',
  styleUrl: './extraction.component.scss'
})
export class ExtractionComponent {

  @Output() extracted = new EventEmitter<void>();

  // Upload
  selectedFile: File | null = null;
  uploading = false;
  uploadProgress = 0;

  // Résultats
  extractionResult: any = null;
  showResult = false;

  // Historique récent
  recentExtractions: any[] = [];
  loadingHistory = false;

  constructor(
    private predictionService: PredictionService,
    private messageService: MessageService
  ) {
    this.loadRecentExtractions();
  }

  /**
   * Gère la sélection de fichier
   */
  onFileSelect(event: any): void {
    const file = event.files[0];
    
    if (!file) return;

    // Vérifier l'extension
    if (!file.name.toLowerCase().endsWith('.txt')) {
      this.showError('Seuls les fichiers .txt sont acceptés');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.showError('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    this.selectedFile = file;
    this.showSuccess('Fichier sélectionné : ' + file.name);
  }

  /**
   * Upload et extraction
   */
  uploadAndExtract(): void {
    if (!this.selectedFile) {
      this.showError('Veuillez sélectionner un fichier');
      return;
    }

    this.uploading = true;
    this.uploadProgress = 0;
    this.showResult = false;

    // Simuler progression (optionnel)
    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress += 10;
      }
    }, 200);

    this.predictionService.extractPrices(this.selectedFile).subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;
        this.uploading = false;
        this.extractionResult = response;
        this.showResult = true;
        this.showSuccess('Extraction réussie !');
        this.extracted.emit();
        
        // Rafraîchir historique
        setTimeout(() => {
          this.loadRecentExtractions();
        }, 500);

        // Reset file
        this.selectedFile = null;
      },
      error: (err) => {
        clearInterval(progressInterval);
        this.uploading = false;
        this.uploadProgress = 0;
        const message = err.error?.detail || 'Erreur lors de l\'extraction';
        this.showError(message);
        this.selectedFile = null;
      }
    });
  }

  /**
   * Charge les extractions récentes
   */
  loadRecentExtractions(): void {
    this.loadingHistory = true;

    this.predictionService.getAllExtractions(0, 10).subscribe({
      next: (data) => {
        this.recentExtractions = data;
        this.loadingHistory = false;
      },
      error: () => {
        this.loadingHistory = false;
      }
    });
  }

  /**
   * Annule la sélection
   */
  cancelSelection(): void {
    this.selectedFile = null;
    this.showResult = false;
  }

  /**
   * Formate la taille de fichier
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Formate un nombre
   */
  formatNumber(value: number): string {
    if (!value) return '0';
    return new Intl.NumberFormat('fr-FR').format(value);
  }

  /**
   * Formate une date
   */
  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Retourne la sévérité du tag action
   */
  getActionSeverity(action: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined {
    if (action === 'vente') return 'success';
    if (action === 'achat') return 'info';
    return 'secondary';
  }

  /**
   * Affiche un message de succès
   */
  showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Succès',
      detail: message,
      life: 3000
    });
  }

  /**
   * Affiche un message d'erreur
   */
  showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: message,
      life: 5000
    });
  }

  /**
   * Retourne les clés d'un objet
   */
  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
}