import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE = 'http://localhost:8080';

export interface TypeTache { id: number; nom: string; description: string; couleur: string; icone: string; }
export interface TypeTacheCreateDTO { nom: string; description: string; couleur: string; icone: string; }

export interface UtilisateurLight { id: number; nom: string; prenom: string; email: string; poste: string; }
export interface PreuveTache { id: number; urlFichier: string; dateUpload: string; }

export interface AssignationTache {
  id: number;
  assignee: UtilisateurLight;
  statut: string;
  dateDebut: string | null;
  dateSoumission: string | null;
  commentaireOuvrier: string | null;
  dateValidation: string | null;
  validateur: UtilisateurLight | null;
  commentaireValidateur: string | null;
  preuves: PreuveTache[];
}

export interface TacheResponse {
  id: number;
  titre: string;
  description: string;
  typeTache: TypeTache | null;
  priorite: string;
  dateEcheance: string;
  recurrence: string;
  joursRecurrence: string | null;
  batiment: string | null;
  box: string | null;
  notes: string | null;
  createur: UtilisateurLight | null;
  dateCreation: string;
  assignations: AssignationTache[];
  statutGlobal: string;
}

export interface TacheCreateDTO {
  titre: string;
  description: string;
  typeTacheId: number | null;
  priorite: string;
  dateEcheance: string;
  recurrence: string;
  joursRecurrence: string | null;
  batiment: string | null;
  box: string | null;
  notes: string | null;
  assigneeIds: number[];
}

export interface TacheStats {
  aFaire: number; enCours: number; enAttenteValidation: number;
  validees: number; invalidees: number; expirees: number;
}

@Injectable({ providedIn: 'root' })
export class TacheService {
  constructor(private http: HttpClient) {}

  // Types
  getTypesTaches(): Observable<TypeTache[]>                              { return this.http.get<TypeTache[]>(`${BASE}/api/types-taches`); }
  creerTypeTache(dto: TypeTacheCreateDTO): Observable<TypeTache>        { return this.http.post<TypeTache>(`${BASE}/api/types-taches`, dto); }
  modifierTypeTache(id: number, dto: TypeTacheCreateDTO): Observable<TypeTache> { return this.http.put<TypeTache>(`${BASE}/api/types-taches/${id}`, dto); }
  supprimerTypeTache(id: number): Observable<void>                      { return this.http.delete<void>(`${BASE}/api/types-taches/${id}`); }

  // Tâches CRUD
  creerTache(dto: TacheCreateDTO): Observable<TacheResponse>            { return this.http.post<TacheResponse>(`${BASE}/api/taches`, dto); }
  modifierTache(id: number, dto: TacheCreateDTO): Observable<TacheResponse> { return this.http.put<TacheResponse>(`${BASE}/api/taches/${id}`, dto); }
  supprimerTache(id: number): Observable<void>                          { return this.http.delete<void>(`${BASE}/api/taches/${id}`); }
  getTache(id: number): Observable<TacheResponse>                       { return this.http.get<TacheResponse>(`${BASE}/api/taches/${id}`); }

  // Vues Admin
  tachesJourAdmin(): Observable<TacheResponse[]>         { return this.http.get<TacheResponse[]>(`${BASE}/api/taches/admin/aujourd-hui`); }
  tachesAVenirAdmin(): Observable<TacheResponse[]>       { return this.http.get<TacheResponse[]>(`${BASE}/api/taches/admin/a-venir`); }
  tachesPasseesAdmin(): Observable<TacheResponse[]>      { return this.http.get<TacheResponse[]>(`${BASE}/api/taches/admin/passees`); }
  tachesAValider(): Observable<TacheResponse[]>          { return this.http.get<TacheResponse[]>(`${BASE}/api/taches/admin/a-valider`); }
  stats(): Observable<TacheStats>                        { return this.http.get<TacheStats>(`${BASE}/api/taches/admin/stats`); }

  // Vues Utilisateur
  mesTachesAujourdHui(): Observable<TacheResponse[]>    { return this.http.get<TacheResponse[]>(`${BASE}/api/taches/moi/aujourd-hui`); }
  mesTachesAVenir(): Observable<TacheResponse[]>        { return this.http.get<TacheResponse[]>(`${BASE}/api/taches/moi/a-venir`); }
  monHistorique(): Observable<TacheResponse[]>          { return this.http.get<TacheResponse[]>(`${BASE}/api/taches/moi/historique`); }

  // Utilisateurs assignables
  getAssignables(): Observable<UtilisateurLight[]>      { return this.http.get<UtilisateurLight[]>(`${BASE}/api/taches/assignables`); }

  // Actions ouvrier
  demarrer(assignationId: number): Observable<AssignationTache>         { return this.http.post<AssignationTache>(`${BASE}/api/taches/assignations/${assignationId}/demarrer`, {}); }
  soumettre(assignationId: number, commentaire: string): Observable<AssignationTache> {
    return this.http.post<AssignationTache>(`${BASE}/api/taches/assignations/${assignationId}/soumettre`, { commentaireOuvrier: commentaire });
  }
  uploadPreuve(assignationId: number, file: File): Observable<PreuveTache> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<PreuveTache>(`${BASE}/api/taches/assignations/${assignationId}/preuves`, fd);
  }

  // Actions gérant
  valider(assignationId: number, commentaire?: string): Observable<AssignationTache> {
    return this.http.post<AssignationTache>(`${BASE}/api/taches/assignations/${assignationId}/valider`, { commentaire });
  }
  invalider(assignationId: number, commentaire: string): Observable<AssignationTache> {
    return this.http.post<AssignationTache>(`${BASE}/api/taches/assignations/${assignationId}/invalider`, { commentaire });
  }
}
