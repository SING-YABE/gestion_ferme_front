import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {

  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  // ========== EXTRACTION ==========
  
  extractPrices(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/extract`, formData);
  }

  getAllExtractions(skip: number = 0, limit: number = 100, animalType?: string): Observable<any> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    
    if (animalType) {
      params = params.set('animal_type', animalType);
    }
    
    return this.http.get<any>(`${this.apiUrl}/extractions`, { params });
  }

  getExtractionsByAnimal(animalType: string, limit: number = 50): Observable<any> {
    const params = new HttpParams()
      .set('animal_type', animalType)
      .set('limit', limit.toString());
    
    return this.http.get<any>(`${this.apiUrl}/extractions`, { params });
  }

  // ========== STATISTICS ==========
  
  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  getTrends(animalType: string, days: number = 30): Observable<any> {
    const params = new HttpParams()
      .set('animal_type', animalType)
      .set('days', days.toString());
    
    return this.http.get<any>(`${this.apiUrl}/trends`, { params });
  }

  getPriceEvolution(animalType: string, period: string = 'week'): Observable<any> {
    const params = new HttpParams()
      .set('animal_type', animalType)
      .set('period', period);
    
    return this.http.get<any>(`${this.apiUrl}/evolution`, { params });
  }

  // ========== ML ANIMAUX ==========
  
  trainAnimalModel(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/train`, {});
  }

  predictAnimalPrice(animalType: string, predictionDate: string): Observable<any> {
    const params = new HttpParams()
      .set('animal_type', animalType)
      .set('prediction_date', predictionDate);
    
    return this.http.get<any>(`${this.apiUrl}/predict`, { params });
  }

  predictAnimalFuture(animalType: string, months: number = 3): Observable<any> {
    const params = new HttpParams()
      .set('animal_type', animalType)
      .set('months', months.toString());
    
    return this.http.get<any>(`${this.apiUrl}/predict/future`, { params });
  }

  getOpportunities(minScore: number = 80): Observable<any> {
    const params = new HttpParams().set('min_score', minScore.toString());
    return this.http.get<any>(`${this.apiUrl}/opportunities`, { params });
  }

  // ========== ML ALIMENTS ==========
  
  trainAlimentModel(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/train/aliments`, {});
  }

  getAlimentModelStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/model/aliments/stats`);
  }

  predictAlimentPrice(alimentType: string, predictionDate: string, categorie?: string): Observable<any> {
    let params = new HttpParams()
      .set('aliment_type', alimentType)
      .set('prediction_date', predictionDate);
    
    if (categorie) {
      params = params.set('categorie', categorie);
    }
    
    return this.http.get<any>(`${this.apiUrl}/predict/aliment`, { params });
  }

  predictAlimentFuture(alimentType: string, months: number = 3, categorie?: string): Observable<any> {
    let params = new HttpParams()
      .set('aliment_type', alimentType)
      .set('months', months.toString());
    
    if (categorie) {
      params = params.set('categorie', categorie);
    }
    
    return this.http.get<any>(`${this.apiUrl}/predict/aliment/future`, { params });
  }

  predictAlimentByCategory(categorie: string, predictionDate: string): Observable<any> {
    const params = new HttpParams().set('prediction_date', predictionDate);
    return this.http.get<any>(`${this.apiUrl}/predict/aliment/categorie/${categorie}`, { params });
  }

  // ========== ALIMENTS DATA ==========
  
  getAlimentCategories(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/aliments/categories`);
  }

  getAlimentsByCategory(categorie: string, days: number = 7): Observable<any> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<any>(`${this.apiUrl}/aliments/categorie/${categorie}`, { params });
  }

  getAlimentStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/aliments/stats`);
  }

  getRecentAliments(days: number = 7, categorie?: string): Observable<any> {
    let params = new HttpParams().set('days', days.toString());
    
    if (categorie) {
      params = params.set('categorie', categorie);
    }
    
    return this.http.get<any>(`${this.apiUrl}/aliments/recent`, { params });
  }

  // ========== ACCURACY ==========
  
  getModelAccuracy(days: number = 30): Observable<any> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<any>(`${this.apiUrl}/model/accuracy`, { params });
  }

  // ========== HEALTH ==========
  
  healthCheck(): Observable<any> {
    return this.http.get<any>('http://localhost:8000/');
  }


}