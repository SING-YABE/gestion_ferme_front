import { environment } from '../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { MessageService, ConfirmationService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { UtilisateurService, Utilisateur, UtilisateurDTO } from '../../@core/service/utilisateur.service';
import { RoleManagementService, RoleManagement } from '../../@core/service/role-management.service';
import { InvitationService } from '../../@core/service/invitation.service';

interface PermissionsData {
  utilisateurId: number;
  email: string;
  role: string;
  permissionsDeBase: string[];
  overrides: { id: number; permission: string; accorde: boolean }[];
  permissionsEffectives: string[];
}

const ROLE_LABELS: Record<string, string> = {
  // Nouveaux rôles
  'ROLE_ADMINISTRATEUR': 'Administrateur',
  'ROLE_GERANT':         'Gérant',
  'ROLE_RESPONSABLE':    'Responsable',
  'ROLE_OUVRIER':        'Ouvrier',
  // Anciens rôles (rétro-compat BD)
  'ADMIN':        'Admin',
  'GESTIONNAIRE': 'Gestionnaire',
  'APPROBATEUR':  'Approbateur',
  'DEMANDEUR':    'Demandeur',
};

type Severity = 'success' | 'info' | 'warning' | 'danger' | 'secondary';
const ROLE_SEVERITY: Record<string, Severity> = {
  'ROLE_ADMINISTRATEUR': 'danger',
  'ROLE_GERANT':         'warning',
  'ROLE_RESPONSABLE':    'info',
  'ROLE_OUVRIER':        'success',
  'ADMIN':        'danger',
  'GESTIONNAIRE': 'warning',
  'APPROBATEUR':  'info',
  'DEMANDEUR':    'success',
};

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TableModule, ButtonModule, DialogModule,
    InputTextModule, DropdownModule, TagModule,
    ToastModule, ConfirmDialogModule, ChipModule, DividerModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './utilisateurs.component.html',
  styleUrl: './utilisateurs.component.scss'
})
export class UtilisateursComponent implements OnInit {

  utilisateurs: Utilisateur[] = [];
  utilisateursFiltres: Utilisateur[] = [];
  roles: RoleManagement[] = [];
  rolesOptions: { label: string; value: number | null }[] = [];

  // Modales
  displayFormModal   = false;
  displayDetailModal = false;
  displayPermModal   = false;
  isEditMode         = false;

  selectedUtilisateur: Utilisateur | null = null;
  form: UtilisateurDTO = this.emptyForm();

  // Permissions
  permissionsData: PermissionsData | null = null;
  toutesPermissions: string[] = [];
  permLoading = false;
  newPermission = '';
  newAccorde    = true;

  // Recherche
  termeRecherche = '';

  // true pendant l'envoi de l'invitation
  invitationLoading = false;

  constructor(
    private utilisateurService: UtilisateurService,
    private roleService: RoleManagementService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private http: HttpClient,
    private invitationService: InvitationService
  ) {}

  ngOnInit() {
    this.loadUtilisateurs();
    this.loadRoles();
    this.loadToutesPermissions();
  }

  // ── Chargement ────────────────────────────────────────────────────────────

  loadUtilisateurs() {
    this.utilisateurService.getAll().subscribe({
      next: (data) => { this.utilisateurs = data; this.filtrer(); },
      error: () => this.toast('error', 'Impossible de charger les utilisateurs')
    });
  }

  loadRoles() {
    this.roleService.getAll().subscribe({
      next: (data) => {
        this.roles = data;

        // Afficher uniquement les 4 rôles actuels dans l'ordre logique.
        // Les anciens rôles (ADMIN, GESTIONNAIRE, etc.) sont exclus du formulaire.
        const ORDRE = ['ROLE_ADMINISTRATEUR','ROLE_GERANT','ROLE_RESPONSABLE','ROLE_OUVRIER'];

        const rolesFiltres = ORDRE
          .map(nom => data.find(r => r.nom === nom))
          .filter((r): r is typeof data[0] => !!r);

        this.rolesOptions = [
          { label: '— Aucun rôle —', value: null },
          ...rolesFiltres.map(r => ({ label: ROLE_LABELS[r.nom] ?? r.nom, value: r.idRole }))
        ];
      },
      error: () => {
        // Fallback : on ne peut pas charger les rôles
        this.messageService.add({ severity: 'warn', summary: 'Attention',
          detail: 'Impossible de charger les rôles (permission insuffisante)' });
      }
    });
  }

  loadToutesPermissions() {
    this.http.get<string[]>(environment.apiUrl + '/api/permissions/disponibles').subscribe({
      next: (p) => this.toutesPermissions = p,
      error: () => {}
    });
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  ouvrirCreation() {
    this.isEditMode = false;
    this.form = this.emptyForm();
    this.displayFormModal = true;
  }

  ouvrirEdition(u: Utilisateur) {
    this.isEditMode = true;
    this.selectedUtilisateur = u;
    this.form = {
      poste: u.poste, nom: u.nom, prenom: u.prenom,
      email: u.email, telephone: u.telephone,
      password: '', roleId: u.role?.idRole ?? null
    };
    this.displayFormModal = true;
  }

  ouvrirDetail(u: Utilisateur) {
    this.selectedUtilisateur = u;
    this.displayDetailModal = true;
  }

  soumettre() {
    if (this.isEditMode && this.selectedUtilisateur) {
      // ── Modification : comportement inchangé ──────────────────────────────
      this.utilisateurService.update(this.selectedUtilisateur.idUtilisateur, this.form).subscribe({
        next: (u) => { this.remplacer(u); this.displayFormModal = false; this.toast('success', 'Utilisateur modifié'); },
        error: () => this.toast('error', 'Erreur lors de la modification')
      });
    } else {
      // ── Création : envoyer une invitation par email ───────────────────────
      if (!this.form.roleId) {
        this.toast('error', 'Veuillez sélectionner un rôle.');
        return;
      }
      this.invitationLoading = true;
      this.invitationService.createInvitation({
        prenom:    this.form.prenom,
        nom:       this.form.nom,
        email:     this.form.email,
        poste:     this.form.poste,
        telephone: this.form.telephone,
        roleId:    this.form.roleId as number
      }).subscribe({
        next: (res) => {
          this.invitationLoading = false;
          this.displayFormModal = false;
          this.loadUtilisateurs(); // recharger la liste (le compte existe mais est inactif)
          this.messageService.add({
            severity: 'success',
            summary: 'Invitation envoyée ✉️',
            detail: res.message,
            life: 6000
          });
        },
        error: (err) => {
          this.invitationLoading = false;
          this.toast('error', err.error?.error ?? 'Erreur lors de l\'envoi de l\'invitation');
        }
      });
    }
  }

  confirmerSuppression(u: Utilisateur) {
    this.confirmationService.confirm({
      message: `Supprimer "${u.prenom} ${u.nom}" définitivement ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.utilisateurService.delete(u.idUtilisateur).subscribe({
          next: () => {
            this.utilisateurs = this.utilisateurs.filter(x => x.idUtilisateur !== u.idUtilisateur);
            this.filtrer();
            this.toast('success', 'Utilisateur supprimé');
          },
          error: () => this.toast('error', 'Erreur lors de la suppression')
        });
      }
    });
  }

  // ── Permissions dynamiques ────────────────────────────────────────────────

  ouvrirPermissions(u: Utilisateur) {
    this.selectedUtilisateur = u;
    this.permissionsData = null;
    this.newPermission = '';
    this.newAccorde = true;
    this.displayPermModal = true;
    this.chargerPermissions(u.idUtilisateur);
  }

  chargerPermissions(id: number) {
    this.permLoading = true;
    this.http.get<PermissionsData>(`${environment.apiUrl}/api/permissions/${id}`).subscribe({
      next: (d) => { this.permissionsData = d; this.permLoading = false; },
      error: () => { this.permLoading = false; this.toast('error', 'Erreur permissions'); }
    });
  }

  ajouterOverride() {
    if (!this.newPermission || !this.selectedUtilisateur) return;
    this.http.post(
      `${environment.apiUrl}/api/permissions/${this.selectedUtilisateur.idUtilisateur}`,
      { permission: this.newPermission, accorde: this.newAccorde }
    ).subscribe({
      next: () => { this.chargerPermissions(this.selectedUtilisateur!.idUtilisateur); this.newPermission = ''; this.toast('success', 'Permission mise à jour'); },
      error: () => this.toast('error', 'Erreur lors de la mise à jour')
    });
  }

  supprimerOverride(permission: string) {
    if (!this.selectedUtilisateur) return;
    this.http.delete(
      `${environment.apiUrl}/api/permissions/${this.selectedUtilisateur.idUtilisateur}/${permission}`
    ).subscribe({
      next: () => { this.chargerPermissions(this.selectedUtilisateur!.idUtilisateur); this.toast('success', 'Override supprimé'); },
      error: () => this.toast('error', 'Erreur lors de la suppression')
    });
  }

  // ── Helpers affichage ─────────────────────────────────────────────────────

  getRoleLabel(nom?: string): string   { return nom ? (ROLE_LABELS[nom] ?? nom) : 'Aucun rôle'; }
  getRoleSeverity(nom?: string): Severity { return nom ? (ROLE_SEVERITY[nom] ?? 'secondary') : 'secondary'; }
  getInitiales(u: Utilisateur): string  { return ((u.prenom?.[0] ?? '') + (u.nom?.[0] ?? '')).toUpperCase() || '?'; }

  filtrer() {
    const t = this.termeRecherche.toLowerCase();
    this.utilisateursFiltres = t
      ? this.utilisateurs.filter(u =>
          u.nom.toLowerCase().includes(t) || u.prenom.toLowerCase().includes(t) ||
          u.email.toLowerCase().includes(t) || (u.role?.nom ?? '').toLowerCase().includes(t))
      : [...this.utilisateurs];
  }

  reinitialiser() { this.termeRecherche = ''; this.filtrer(); }

  private emptyForm(): UtilisateurDTO {
    return { poste: '', nom: '', prenom: '', email: '', telephone: '', password: '', roleId: null };
  }

  private remplacer(u: Utilisateur) {
    const i = this.utilisateurs.findIndex(x => x.idUtilisateur === u.idUtilisateur);
    if (i !== -1) this.utilisateurs[i] = u;
    this.filtrer();
  }

  private toast(severity: string, detail: string) {
    this.messageService.add({ severity, summary: severity === 'success' ? 'Succès' : 'Erreur', detail, life: 4000 });
  }
}
