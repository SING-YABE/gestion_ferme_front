/**
 * Service KPI + SAD — Aide à la décision (Python FastAPI + Kotlin Spring Boot)
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// ── KPI Python ──────────────────────────────────────────────────────────────

export interface KpiReproduction {
  taux_mise_bas_pct:          number | null;
  prolificite_moy:            number | null;
  portees_par_truie_an:       number | null;
  issf_moyen_jours:           number | null;
  nb_issf_calcules:           number;
  taux_fertilite_pct:         number | null;
  taux_mortalite_porcelet_pct:number | null;
  nb_portees:                 number;
  nb_saillies:                number;
}

export interface KpiCroissance {
  gmq_g_jour:           number | null;
  ic:                   number | null;
  age_moyen_vente_jours:number | null;
  poids_moyen_vente_kg: number | null;
  taux_mortalite_pct:   number | null;
}

export interface KpiEconomie {
  cout_aliment_moyen_fcfa:   number | null;
  cout_par_kg_aliment_fcfa:  number | null;
  cout_production_par_kg:    number | null;
  marge_brute_par_porc:      number | null;
  ca_total_fcfa:             number | null;
  ca_par_truie_an:           number | null;
  nb_porcs_vendus:           number;
}

export interface TopConsommateurSoin {
  code: string;
  type: string;
  nb_visites: number;
  cout_total: number;
}

export interface KpiSante {
  taux_morbidite_pct:        number | null;
  taux_reforme_truies_pct:   number | null;
  nb_animaux_actifs:         number;
  conso_medicaments_fcfa:    number | null;
  nb_actes_veterinaires:     number;
  nb_animaux_traites:        number;
  top_consommateurs_soins:   TopConsommateurSoin[];
}

export interface KpiGestion {
  taux_occupation_batiments_pct: number | null;
  ppta:                          number | null;
  duree_cycle_jours:             number | null;
}

export interface KpiRaw {
  reproduction: KpiReproduction;
  croissance:   KpiCroissance;
  economie:     KpiEconomie;
  sante:        KpiSante;
  gestion:      KpiGestion;
  meta: { periode: string; source: string };
}

export interface KpiAnalyseResponse {
  kpis:     KpiRaw;
  analyse:  string | null;
  question: string | null;
  erreur:   string | null;
}

// ── DTOs Kotlin (endpoints SAD) ─────────────────────────────────────────────

export interface TopConsommateurDto {
  animalId:       number;
  codeAnimal:     string;
  typeAnimal:     string;
  nbVisites:      number;
  coutTotal:      number;
  coutMedicaments:number;
  dernierMotif:   string | null;
  derniereSoin:   string | null;
}

export interface SoinResume {
  dateSoin:   string;
  motif:      string;
  traitement: string;
  coutTotal:  number;
  veterinaire:string;
}

export interface BilanSanteAnimalDto {
  animalId:             number;
  codeAnimal:           string;
  typeAnimal:           string;
  nbVisitesSoins:       number;
  coutTotalSoins:       number;
  coutTotalMedicaments: number;
  coutTotalPrestations: number;
  derniereVisite:       string | null;
  motifsPrincipaux:     string[];
  soins:                SoinResume[];
}

export interface IssfDetailDto {
  truieId:             number;
  codeAnimal:          string;
  dateSevrageEstime:   string | null;
  dateSailliesSuivante:string | null;
  issfJours:           number | null;
}

export interface IssfDto {
  issfMoyenJours:    number | null;
  nbTruiesCalculees: number;
  objectifJours:     number;
  conforme:          boolean;
  detail:            IssfDetailDto[];
}

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class KpiService {
  private readonly pythonUrl = 'http://localhost:8000/api';
  private readonly kotlinUrl = '/api';

  constructor(private http: HttpClient) {}

  // ── Python KPI ────────────────────────────────────────────────────────────

  getKpisRaw(): Observable<KpiRaw> {
    return this.http.get<KpiRaw>(`${this.pythonUrl}/kpi/raw`).pipe(
      catchError(err => throwError(() => new Error(
        err.error?.detail || 'Backend Python indisponible (port 8000)'
      )))
    );
  }

  getAnalyseLlm(): Observable<KpiAnalyseResponse> {
    return this.http.get<KpiAnalyseResponse>(`${this.pythonUrl}/kpi/analyse`).pipe(
      catchError(err => throwError(() => new Error(
        err.error?.detail || 'Erreur lors de l\'analyse LLM'
      )))
    );
  }

  poserQuestion(question: string): Observable<KpiAnalyseResponse> {
    return this.http.post<KpiAnalyseResponse>(`${this.pythonUrl}/kpi/question`, { question }).pipe(
      catchError(err => throwError(() => new Error(
        err.error?.detail || 'Erreur lors de l\'envoi de la question'
      )))
    );
  }

  // ── Kotlin Spring Boot — Santé SAD ────────────────────────────────────────

  /** Top animaux par coût de soins sur les N derniers mois */
  getTopConsommateurs(limit = 10, mois = 12): Observable<TopConsommateurDto[]> {
    const params = new HttpParams().set('limit', limit).set('mois', mois);
    return this.http.get<TopConsommateurDto[]>(`${this.kotlinUrl}/soins/top-consommateurs`, { params }).pipe(
      catchError(err => throwError(() => new Error(err.error?.message || 'Erreur chargement top soins')))
    );
  }

  /** Bilan sanitaire complet d'un animal */
  getBilanSante(animalId: number, mois = 12): Observable<BilanSanteAnimalDto> {
    const params = new HttpParams().set('mois', mois);
    return this.http.get<BilanSanteAnimalDto>(`${this.kotlinUrl}/animaux/${animalId}/bilan-sante`, { params }).pipe(
      catchError(err => throwError(() => new Error(err.error?.message || 'Erreur bilan santé')))
    );
  }

  /** ISSF (Intervalle Sevrage–Saillie Fécondante) */
  getIssf(): Observable<IssfDto> {
    return this.http.get<IssfDto>(`${this.kotlinUrl}/reproductions/issf`).pipe(
      catchError(err => throwError(() => new Error(err.error?.message || 'Erreur calcul ISSF')))
    );
  }
}
