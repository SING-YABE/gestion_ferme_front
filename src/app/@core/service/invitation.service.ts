import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const BASE_URL = environment.apiUrl;

export interface CreateInvitationRequest {
  prenom: string;
  nom: string;
  email: string;
  poste?: string;
  telephone?: string;
  roleId: number;
}

export interface CreateDirectRequest {
  prenom: string;
  nom: string;
  email: string;
  poste?: string;
  telephone?: string;
  roleId: number;
  temporaryPassword?: string;
}

export interface CreateDirectResponse {
  message: string;
  temporaryPassword: string;
}

export interface ValidateInvitationRequest {
  token: string;
  newPassword: string;
}

export interface ValidateInvitationResponse {
  token: string;
  role: string;
  username: string;
  nomFerme: string;
}

@Injectable({ providedIn: 'root' })
export class InvitationService {

  constructor(private http: HttpClient) {}

  /** Admin : crée une invitation et déclenche l'envoi d'email */
  createInvitation(req: CreateInvitationRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${BASE_URL}/api/invitations`, req);
  }

  /** Public : valide le token + définit le mot de passe → retourne JWT */
  validateInvitation(req: ValidateInvitationRequest): Observable<ValidateInvitationResponse> {
    return this.http.post<ValidateInvitationResponse>(`${BASE_URL}/api/invitations/validate`, req);
  }

  /** Admin : création directe avec mot de passe temporaire (sans email) */
  createDirect(req: CreateDirectRequest): Observable<CreateDirectResponse> {
    return this.http.post<CreateDirectResponse>(`${BASE_URL}/api/invitations/create-direct`, req);
  }
}
