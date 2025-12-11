import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface SoinAnimalDTO {
    id?: number;   
  codeAnimal?: string;
  
  animalCodes?: string[];
  applyToAll?: boolean;
  dateSoin: string;
  motif: string;
  traitement: string;
  traitementApporte?: string;
  cout: number;
  coutMedicament?: number;
  veterinaire: string;
  observations?: string;
}



@Injectable({
  providedIn: 'root'
})
export class SanteSoinsService {

  private baseUrl = '/api/soins';

  constructor(private http: HttpClient) {}

  getAll(): Observable<SoinAnimalDTO[]> {
    return this.http.get<SoinAnimalDTO[]>(this.baseUrl);
  }

  getByAnimal(code: string): Observable<SoinAnimalDTO[]> {
    return this.http.get<SoinAnimalDTO[]>(`${this.baseUrl}/${code}`);
  }


  create(dto: SoinAnimalDTO): Observable<SoinAnimalDTO> {
    return this.http.post<SoinAnimalDTO>(this.baseUrl, dto);
  }

  update(id: number, dto: SoinAnimalDTO): Observable<SoinAnimalDTO> {
    return this.http.put<SoinAnimalDTO>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getAnimals(): Observable<any[]> {
    return this.http.get<any[]>('/api/animaux');
  }
}







