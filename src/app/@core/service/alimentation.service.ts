import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


export interface IngredientAlimentationDTO {
  ingredientId: number;
  quantiteKg: number;
  prixUnitaire: number;
}

export interface AlimentationDTO {
  date: string;
  mode: 'ACHAT' | 'FABRICATION'; 
  fournisseurId?: number | null;
  codeAnimal?: number | null;      
  typeAnimalId?: number | null;
  ingredients: IngredientAlimentationDTO[];
}

export interface TypeAlimentInfo {
  id: number;
  libelle: string;
}

export interface AnimalInfo {
  id: number;
  codeAnimal: string;
}

export interface TypeAnimalInfo {
  id: number;
  nom: string;
}

export interface FournisseurInfo {
  id: number;
  nom: string;
}

export interface AlimentationResponseDTO {
  id: number;
  date: string;
  typeAliment: TypeAlimentInfo;
  quantiteKg: number;
  prixUnitaire: number;
  animal?: AnimalInfo | null;
  typeAnimal?: TypeAnimalInfo | null;
  fournisseur?: FournisseurInfo | null;
  coutTotal: number;
}

// ---------------------------------------------------------------------------
// INTERFACES — Ration de référence
// GET /api/alimentations/ration-reference?stade=...&poids=...
// SOURCE: DGPA/MRAH Burkina Faso Juin 2021 + ONG Thamani Bobo-Dioulasso
// ---------------------------------------------------------------------------

/** Stades physiologiques valides côté backend */
export type StadePhysiologique =
  | 'PORCELET_SEVRAGE'
  | 'CROISSANCE'
  | 'FINITION'
  | 'TRUIE_GESTANTE'
  | 'TRUIE_ALLAITANTE'
  | 'TRUIE_VIDE'
  | 'VERRAT';

/** Réponse complète de l'endpoint ration-reference */
export interface RationReferenceDTO {
  stadePhysiologique: string;
  /** Proportions des ingrédients en % de Matière Sèche pour 1 kg d'aliment */
  sonMaïsPct: number;
  drecheBrasseriePct: number;
  drecheDoloPct: number;
  tourteauCotonPct: number;
  farinePoissonPct: number;
  coquillagePct: number;
  selPct: number;
  /** Quantités journalières recommandées */
  quantiteJournaliereMinKg: number;
  quantiteJournaliereMaxKg: number;
  eauJournaliereLitres: number;
  /** Économie (règle : coût/kg ≤ 100 FCFA = 1/6 du prix vente 600 FCFA/kg à Bobo-Dioulasso) */
  coutEstimeParKgFcfa: number;
  coutConformeRegleEconomique: boolean;
  sourceReference: string;
  noteEconomique: string;
}

// ---------------------------------------------------------------------------
// INTERFACES — Calcul de coût de ration
// POST /api/alimentations/calculer-cout
// SOURCE: ONG Thamani — règle 1/6 du prix vente = 100 FCFA/kg max
// ---------------------------------------------------------------------------

/** Détail du coût pour un ingrédient */
export interface DetailIngredientCoutDTO {
  ingredientId: number;
  ingredientNom: string;
  quantiteKg: number;
  prixUnitaireFcfa: number;
  sousTotalFcfa: number;
}

/** Réponse complète de l'endpoint calculer-cout */
export interface CoutRationDTO {
  coutTotalFcfa: number;
  quantiteTotaleKg: number;
  coutParKgFcfa: number;
  conformeRegleEconomique: boolean;
  seuilCoutMaxFcfa: number;
  alerte: string | null;
  detailIngredients: DetailIngredientCoutDTO[];
}

@Injectable({
  providedIn: 'root'
})
export class AlimentationService {
  private apiUrl = 'http://localhost:8080/api/alimentations';

  constructor(private http: HttpClient) {}

  getAll(): Observable<AlimentationResponseDTO[]> {
    return this.http.get<AlimentationResponseDTO[]>(this.apiUrl);
  }

  getById(id: number): Observable<AlimentationResponseDTO> {
    return this.http.get<AlimentationResponseDTO>(`${this.apiUrl}/${id}`);
  }

  create(dto: AlimentationDTO): Observable<AlimentationResponseDTO> {
    return this.http.post<AlimentationResponseDTO>(this.apiUrl, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getEvolutionCoutsMensuels(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistiques/couts-mensuels`);
  }

  getEvolutionCoutsMensuelsPeriode(dateDebut: string, dateFin: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistiques/couts-mensuels-periode`, {
      params: { dateDebut, dateFin }
    });
  }

  /**
   * Suggère la ration officielle de référence pour un stade physiologique donné.
   *
   * GET /api/alimentations/ration-reference?stade=TRUIE_GESTANTE&poids=80
   *
   * SOURCE: Fiche simplifiée alimentation des porcs — DGPA/MRAH, Burkina Faso — Juin 2021
   * SOURCE: Fiche technique n°3 alimentation porcs — ONG Thamani, Bobo-Dioulasso — secteur 24
   *
   * @param stade Stade physiologique (ex: 'TRUIE_GESTANTE', 'CROISSANCE')
   * @param poids Poids vif de l'animal en kg (optionnel)
   */
  getRationReference(stade: StadePhysiologique, poids?: number): Observable<RationReferenceDTO> {
    let params = new HttpParams().set('stade', stade);
    if (poids !== undefined && poids !== null) {
      params = params.set('poids', poids.toString());
    }
    return this.http.get<RationReferenceDTO>(`${this.apiUrl}/ration-reference`, { params }).pipe(
      catchError(err => throwError(() => new Error(err.error?.message || 'Erreur lors de la récupération de la ration de référence')))
    );
  }

  /**
   * Calcule le coût total d'une ration et vérifie la conformité à la règle économique.
   *
   * POST /api/alimentations/calculer-cout
   * Body : liste de IngredientAlimentationDTO (ingredientId, quantiteKg, prixUnitaire)
   *
   * Règle : coût/kg ≤ 100 FCFA (= 1/6 × 600 FCFA/kg prix sur pied — Bobo-Dioulasso)
   * SOURCE: Fiche technique n°3 alimentation porcs — ONG Thamani, Bobo-Dioulasso — secteur 24
   *
   * @param ingredients Liste des ingrédients avec quantités et prix unitaires
   */
  calculerCoutRation(ingredients: IngredientAlimentationDTO[]): Observable<CoutRationDTO> {
    return this.http.post<CoutRationDTO>(`${this.apiUrl}/calculer-cout`, ingredients).pipe(
      catchError(err => throwError(() => new Error(err.error?.message || 'Erreur lors du calcul du coût de la ration')))
    );
  }
}