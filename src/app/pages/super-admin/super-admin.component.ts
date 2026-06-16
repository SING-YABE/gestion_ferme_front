import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../@core/service/auth.service';
import {
  SuperAdminService,
  PlatformStats,
  FermeInfo,
  PlanConfig
} from '../../@core/service/super-admin.service';

@Component({
  selector: 'app-super-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="sa-shell">

  <!-- ═══════════════════ TOPBAR ═══════════════════ -->
  <header class="sa-topbar">
    <div class="sa-topbar-left">
      <div class="sa-logo">
        <span class="sa-logo-icon">⚡</span>
        <div>
          <div class="sa-logo-title">PigFarm SaaS</div>
          <div class="sa-logo-sub">Console Super Admin</div>
        </div>
      </div>
    </div>
    <div class="sa-topbar-right">
      <div class="sa-admin-badge">
        <div class="sa-admin-avatar">{{ initiales }}</div>
        <div>
          <div class="sa-admin-name">{{ profile?.prenom }} {{ profile?.nom }}</div>
          <div class="sa-admin-role">Super Administrateur</div>
        </div>
      </div>
      <button class="sa-logout-btn" (click)="logout()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Déconnexion
      </button>
    </div>
  </header>

  <!-- ═══════════════════ NAV TABS ═══════════════════ -->
  <nav class="sa-nav">
    <button class="sa-nav-btn" [class.active]="activeTab === 'overview'" (click)="activeTab = 'overview'">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
      Vue d'ensemble
    </button>
    <button class="sa-nav-btn" [class.active]="activeTab === 'fermes'" (click)="switchTab('fermes')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      Fermes inscrites
    </button>
    <button class="sa-nav-btn" [class.active]="activeTab === 'plans'" (click)="switchTab('plans')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      Plans & Limites
    </button>
  </nav>

  <!-- ═══════════════════ CONTENT ═══════════════════ -->
  <main class="sa-main">

    <!-- ─── Loading ───────────────────────────────── -->
    <div *ngIf="loading" class="sa-loading">
      <div class="sa-spinner"></div>
      <p>Chargement des données...</p>
    </div>

    <!-- ─── TAB : Vue d'ensemble ──────────────────── -->
    <ng-container *ngIf="!loading && activeTab === 'overview'">

      <div class="sa-section-header">
        <h2 class="sa-section-title">Vue d'ensemble de la plateforme</h2>
        <button class="sa-refresh-btn" (click)="loadOverview()" title="Actualiser">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Actualiser
        </button>
      </div>

      <!-- KPI Cards -->
      <div class="sa-kpi-grid" *ngIf="stats">
        <div class="sa-kpi-card accent-blue">
          <div class="sa-kpi-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <div class="sa-kpi-body">
            <div class="sa-kpi-value">{{ stats.totalFermes }}</div>
            <div class="sa-kpi-label">Fermes inscrites</div>
          </div>
          <div class="sa-kpi-detail">{{ stats.fermesActives }} actives · {{ stats.fermesSuspendues }} suspendues</div>
        </div>

        <div class="sa-kpi-card accent-green">
          <div class="sa-kpi-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div class="sa-kpi-body">
            <div class="sa-kpi-value">{{ stats.totalUtilisateurs }}</div>
            <div class="sa-kpi-label">Utilisateurs totaux</div>
          </div>
          <div class="sa-kpi-detail">Sur toutes les fermes</div>
        </div>

        <div class="sa-kpi-card accent-violet">
          <div class="sa-kpi-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          </div>
          <div class="sa-kpi-body">
            <div class="sa-kpi-value">{{ stats.totalAnimaux }}</div>
            <div class="sa-kpi-label">Animaux gérés</div>
          </div>
          <div class="sa-kpi-detail">Parc cumulé</div>
        </div>

        <div class="sa-kpi-card accent-orange">
          <div class="sa-kpi-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </div>
          <div class="sa-kpi-body">
            <div class="sa-kpi-value">{{ tauxActivite }}%</div>
            <div class="sa-kpi-label">Taux d'activité</div>
          </div>
          <div class="sa-kpi-detail">Fermes actives / total</div>
        </div>
      </div>

      <!-- Quick preview fermes -->
      <div class="sa-card mt-24" *ngIf="fermes.length">
        <div class="sa-card-header">
          <h3 class="sa-card-title">Aperçu rapide des fermes</h3>
          <button class="sa-link-btn" (click)="switchTab('fermes')">Voir toutes →</button>
        </div>
        <div class="sa-farm-preview-list">
          <div *ngFor="let f of fermes.slice(0, 5)" class="sa-farm-preview-row">
            <div class="sa-farm-avatar" [style.background]="farmColor(f.fermeCode)">
              {{ f.nomFerme.charAt(0).toUpperCase() }}
            </div>
            <div class="sa-farm-preview-info">
              <div class="sa-farm-preview-name">{{ f.nomFerme }}</div>
              <div class="sa-farm-preview-meta">{{ f.nbUtilisateurs }} utilisateurs · {{ f.nbAnimaux }} animaux</div>
            </div>
            <span class="sa-badge" [class.active]="f.active" [class.suspended]="!f.active">
              {{ f.active ? 'Actif' : 'Suspendu' }}
            </span>
          </div>
        </div>
      </div>

    </ng-container>

    <!-- ─── TAB : Fermes ──────────────────────────── -->
    <ng-container *ngIf="!loading && activeTab === 'fermes'">
      <div class="sa-section-header">
        <h2 class="sa-section-title">Gestion des fermes</h2>
        <span class="sa-count-badge">{{ fermes.length }} ferme{{ fermes.length > 1 ? 's' : '' }}</span>
      </div>

      <div class="sa-search-bar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" [(ngModel)]="searchFerme" placeholder="Rechercher par nom ou code..." class="sa-search-input" />
      </div>

      <div class="sa-farms-table-wrapper">
        <table class="sa-table">
          <thead>
            <tr>
              <th>Ferme</th>
              <th>Code</th>
              <th class="center">Utilisateurs</th>
              <th class="center">Animaux</th>
              <th class="center">Statut</th>
              <th class="center">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let f of filteredFermes" [class.row-suspended]="!f.active">
              <td>
                <div class="sa-farm-cell">
                  <div class="sa-farm-avatar sm" [style.background]="farmColor(f.fermeCode)">
                    {{ f.nomFerme.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="sa-farm-cell-name">{{ f.nomFerme }}</div>
                    <div class="sa-farm-cell-schema">{{ f.schemaName }}</div>
                  </div>
                </div>
              </td>
              <td><code class="sa-code">{{ f.fermeCode }}</code></td>
              <td class="center">
                <div class="sa-count-chip">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  {{ f.nbUtilisateurs }}
                </div>
              </td>
              <td class="center">
                <div class="sa-count-chip">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></svg>
                  {{ f.nbAnimaux }}
                </div>
              </td>
              <td class="center">
                <span class="sa-badge" [class.active]="f.active" [class.suspended]="!f.active">
                  <span class="sa-badge-dot"></span>
                  {{ f.active ? 'Actif' : 'Suspendu' }}
                </span>
              </td>
              <td class="center">
                <button
                  class="sa-toggle-btn"
                  [class.btn-suspend]="f.active"
                  [class.btn-activate]="!f.active"
                  [disabled]="toggling === f.fermeCode"
                  (click)="toggleFerme(f)">
                  <span *ngIf="toggling !== f.fermeCode">{{ f.active ? '⏸ Suspendre' : '▶ Activer' }}</span>
                  <span *ngIf="toggling === f.fermeCode" class="sa-btn-loading">...</span>
                </button>
              </td>
            </tr>
            <tr *ngIf="filteredFermes.length === 0">
              <td colspan="6" class="sa-empty">Aucune ferme trouvée</td>
            </tr>
          </tbody>
        </table>
      </div>
    </ng-container>

    <!-- ─── TAB : Plans & Limites ─────────────────── -->
    <ng-container *ngIf="!loading && activeTab === 'plans'">
      <div class="sa-section-header">
        <h2 class="sa-section-title">Configuration des plans</h2>
      </div>

      <div class="sa-plans-layout" *ngIf="planConfig">

        <!-- Plan FREE -->
        <div class="sa-plan-card plan-free">
          <div class="sa-plan-header">
            <div class="sa-plan-badge free">FREE</div>
            <div class="sa-plan-title">Plan Gratuit</div>
            <div class="sa-plan-sub">Accès limité aux fonctionnalités de base</div>
          </div>
          <div class="sa-plan-body">
            <div class="sa-plan-field">
              <label class="sa-field-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></svg>
                Animaux max autorisés
              </label>
              <div class="sa-field-control">
                <input
                  type="number"
                  [(ngModel)]="editFreeLimit"
                  min="1"
                  max="1000"
                  class="sa-number-input"
                />
                <span class="sa-field-unit">animaux</span>
              </div>
              <div class="sa-field-hint">Valeur actuelle : {{ planConfig.maxAnimauxFreePlan }}</div>
            </div>
          </div>
        </div>

        <!-- Plan PREMIUM -->
        <div class="sa-plan-card plan-premium">
          <div class="sa-plan-header">
            <div class="sa-plan-badge premium">PREMIUM</div>
            <div class="sa-plan-title">Plan Premium</div>
            <div class="sa-plan-sub">Toutes les fonctionnalités, sans restriction</div>
          </div>
          <div class="sa-plan-body">
            <div class="sa-plan-field">
              <label class="sa-field-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></svg>
                Animaux max (-1 = illimité)
              </label>
              <div class="sa-field-control">
                <input
                  type="number"
                  [(ngModel)]="editPremiumLimit"
                  min="-1"
                  max="100000"
                  class="sa-number-input premium"
                />
                <span class="sa-field-unit">
                  {{ editPremiumLimit === -1 ? '∞ illimité' : 'animaux' }}
                </span>
              </div>
              <div class="sa-field-hint">-1 = aucune limite imposée</div>
            </div>
          </div>
        </div>

      </div>

      <!-- Bouton sauvegarder -->
      <div class="sa-save-row" *ngIf="planConfig">
        <div class="sa-save-info">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Ces limites s'appliquent à toutes les fermes. Dernier changement : {{ planConfig.updatedAt | date:'dd/MM/yyyy HH:mm' }}
        </div>
        <button class="sa-save-btn" (click)="savePlanConfig()" [disabled]="savingPlan">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          {{ savingPlan ? 'Sauvegarde...' : 'Sauvegarder les limites' }}
        </button>
      </div>

    </ng-container>

  </main>
</div>
  `,
  styles: [`
    /* ═══════════════════════════════════════════════
       ROOT SHELL
    ══════════════════════════════════════════════ */
    :host { display: block; }
    * { box-sizing: border-box; margin: 0; padding: 0; }

    .sa-shell {
      min-height: 100vh;
      background: #0d0d1a;
      color: #e2e8f0;
      font-family: 'Segoe UI', system-ui, sans-serif;
      display: flex;
      flex-direction: column;
    }

    /* ═══════════════════════════════════════════════
       TOPBAR
    ══════════════════════════════════════════════ */
    .sa-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28px;
      height: 64px;
      background: rgba(255,255,255,0.03);
      border-bottom: 1px solid rgba(255,255,255,0.07);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .sa-topbar-left, .sa-topbar-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .sa-logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .sa-logo-icon {
      font-size: 22px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .sa-logo-title {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: #f8fafc;
    }

    .sa-logo-sub {
      font-size: 11px;
      color: #6366f1;
      font-weight: 500;
      letter-spacing: 0.3px;
    }

    .sa-admin-badge {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .sa-admin-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      color: white;
    }

    .sa-admin-name {
      font-size: 13px;
      font-weight: 600;
      color: #f1f5f9;
    }

    .sa-admin-role {
      font-size: 11px;
      color: #6366f1;
    }

    .sa-logout-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.3);
      border-radius: 8px;
      color: #f87171;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .sa-logout-btn:hover { background: rgba(239,68,68,0.2); }

    /* ═══════════════════════════════════════════════
       NAV TABS
    ══════════════════════════════════════════════ */
    .sa-nav {
      display: flex;
      gap: 4px;
      padding: 12px 28px;
      background: rgba(255,255,255,0.02);
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }

    .sa-nav-btn {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 8px 16px;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 8px;
      color: #94a3b8;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .sa-nav-btn:hover { color: #e2e8f0; background: rgba(255,255,255,0.05); }
    .sa-nav-btn.active {
      color: #6366f1;
      background: rgba(99,102,241,0.12);
      border-color: rgba(99,102,241,0.3);
    }

    /* ═══════════════════════════════════════════════
       MAIN CONTENT
    ══════════════════════════════════════════════ */
    .sa-main {
      padding: 28px;
      flex: 1;
      max-width: 1280px;
      width: 100%;
      margin: 0 auto;
    }

    .sa-section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .sa-section-title {
      font-size: 20px;
      font-weight: 700;
      color: #f8fafc;
      letter-spacing: -0.3px;
    }

    .sa-count-badge {
      background: rgba(99,102,241,0.15);
      border: 1px solid rgba(99,102,241,0.3);
      color: #a5b4fc;
      font-size: 12px;
      padding: 4px 12px;
      border-radius: 20px;
    }

    .sa-refresh-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      color: #94a3b8;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .sa-refresh-btn:hover { color: #e2e8f0; background: rgba(255,255,255,0.08); }

    /* ─── Loading ─────────────────────────────── */
    .sa-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 80px;
      color: #64748b;
    }

    .sa-spinner {
      width: 36px;
      height: 36px;
      border: 3px solid rgba(99,102,241,0.2);
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* ═══════════════════════════════════════════════
       KPI CARDS
    ══════════════════════════════════════════════ */
    .sa-kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .sa-kpi-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      padding: 20px;
      position: relative;
      overflow: hidden;
      transition: transform 0.2s, border-color 0.2s;
    }
    .sa-kpi-card:hover { transform: translateY(-2px); }

    .sa-kpi-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
    }
    .accent-blue::before  { background: linear-gradient(90deg, #6366f1, #818cf8); }
    .accent-green::before { background: linear-gradient(90deg, #22c55e, #4ade80); }
    .accent-violet::before{ background: linear-gradient(90deg, #a855f7, #c084fc); }
    .accent-orange::before{ background: linear-gradient(90deg, #f97316, #fb923c); }

    .sa-kpi-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 14px;
    }
    .accent-blue  .sa-kpi-icon { background: rgba(99,102,241,0.15);  color: #818cf8; }
    .accent-green .sa-kpi-icon { background: rgba(34,197,94,0.15);   color: #4ade80; }
    .accent-violet.sa-kpi-icon { background: rgba(168,85,247,0.15);  color: #c084fc; }
    .accent-orange.sa-kpi-icon { background: rgba(249,115,22,0.15);  color: #fb923c; }

    .sa-kpi-value {
      font-size: 34px;
      font-weight: 800;
      color: #f8fafc;
      line-height: 1;
      margin-bottom: 4px;
      letter-spacing: -1px;
    }

    .sa-kpi-label {
      font-size: 13px;
      color: #94a3b8;
      font-weight: 500;
    }

    .sa-kpi-detail {
      margin-top: 12px;
      font-size: 11px;
      color: #475569;
    }

    /* ─── Card générique ─────────────────── */
    .sa-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      overflow: hidden;
    }
    .mt-24 { margin-top: 0; }

    .sa-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .sa-card-title { font-size: 14px; font-weight: 600; color: #e2e8f0; }
    .sa-link-btn {
      background: none;
      border: none;
      color: #6366f1;
      font-size: 13px;
      cursor: pointer;
    }
    .sa-link-btn:hover { text-decoration: underline; }

    /* ─── Farm preview list ────────────── */
    .sa-farm-preview-list { padding: 8px 0; }
    .sa-farm-preview-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      transition: background 0.15s;
    }
    .sa-farm-preview-row:last-child { border-bottom: none; }
    .sa-farm-preview-row:hover { background: rgba(255,255,255,0.02); }

    .sa-farm-avatar {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
    }
    .sa-farm-avatar.sm { width: 32px; height: 32px; border-radius: 8px; font-size: 13px; }

    .sa-farm-preview-info { flex: 1; }
    .sa-farm-preview-name { font-size: 13px; font-weight: 600; color: #e2e8f0; }
    .sa-farm-preview-meta { font-size: 11px; color: #64748b; margin-top: 2px; }

    /* ─── Status badges ────────────────── */
    .sa-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.3px;
    }
    .sa-badge.active    { background: rgba(34,197,94,0.12); color: #4ade80; border: 1px solid rgba(34,197,94,0.25); }
    .sa-badge.suspended { background: rgba(239,68,68,0.1);  color: #f87171; border: 1px solid rgba(239,68,68,0.25); }

    .sa-badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    /* ═══════════════════════════════════════════════
       FERMES TABLE
    ══════════════════════════════════════════════ */
    .sa-search-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      margin-bottom: 16px;
      color: #64748b;
    }

    .sa-search-input {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      color: #e2e8f0;
      font-size: 13px;
    }
    .sa-search-input::placeholder { color: #475569; }

    .sa-farms-table-wrapper {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 14px;
      overflow: hidden;
    }

    .sa-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .sa-table th {
      padding: 12px 16px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      color: #475569;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      background: rgba(255,255,255,0.02);
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .sa-table th.center { text-align: center; }

    .sa-table td {
      padding: 13px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      color: #cbd5e1;
      vertical-align: middle;
    }
    .sa-table td.center { text-align: center; }

    .sa-table tr:last-child td { border-bottom: none; }
    .sa-table tbody tr { transition: background 0.15s; }
    .sa-table tbody tr:hover { background: rgba(255,255,255,0.02); }
    .row-suspended td { opacity: 0.6; }

    .sa-farm-cell { display: flex; align-items: center; gap: 10px; }
    .sa-farm-cell-name { font-weight: 600; color: #e2e8f0; font-size: 13px; }
    .sa-farm-cell-schema { font-size: 11px; color: #475569; font-family: monospace; }

    .sa-code {
      font-family: 'Fira Code', monospace;
      font-size: 11px;
      background: rgba(99,102,241,0.1);
      color: #a5b4fc;
      padding: 2px 7px;
      border-radius: 4px;
    }

    .sa-count-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #94a3b8;
      font-size: 12px;
    }

    .sa-toggle-btn {
      padding: 6px 14px;
      border-radius: 7px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid;
    }
    .btn-suspend {
      background: rgba(239,68,68,0.08);
      border-color: rgba(239,68,68,0.25);
      color: #f87171;
    }
    .btn-suspend:hover { background: rgba(239,68,68,0.18); }
    .btn-activate {
      background: rgba(34,197,94,0.08);
      border-color: rgba(34,197,94,0.25);
      color: #4ade80;
    }
    .btn-activate:hover { background: rgba(34,197,94,0.18); }
    .sa-toggle-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .sa-empty {
      text-align: center;
      padding: 48px !important;
      color: #475569;
      font-style: italic;
    }

    /* ═══════════════════════════════════════════════
       PLANS CONFIG
    ══════════════════════════════════════════════ */
    .sa-plans-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .sa-plan-card {
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.08);
    }

    .sa-plan-header {
      padding: 24px;
    }
    .plan-free  .sa-plan-header { background: rgba(34,197,94,0.06); }
    .plan-premium .sa-plan-header { background: rgba(99,102,241,0.08); }

    .sa-plan-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    .sa-plan-badge.free    { background: rgba(34,197,94,0.2);  color: #4ade80; }
    .sa-plan-badge.premium { background: rgba(99,102,241,0.2); color: #818cf8; }

    .sa-plan-title { font-size: 18px; font-weight: 700; color: #f8fafc; margin-bottom: 4px; }
    .sa-plan-sub   { font-size: 12px; color: #64748b; }

    .sa-plan-body {
      padding: 24px;
      background: rgba(255,255,255,0.02);
    }

    .sa-plan-field { }
    .sa-field-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
      color: #94a3b8;
      letter-spacing: 0.3px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }

    .sa-field-control {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .sa-number-input {
      width: 100px;
      padding: 10px 14px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 8px;
      color: #f8fafc;
      font-size: 20px;
      font-weight: 700;
      text-align: center;
      outline: none;
      transition: border-color 0.2s;
    }
    .sa-number-input:focus { border-color: #6366f1; }
    .sa-number-input.premium:focus { border-color: #818cf8; }

    .sa-field-unit {
      font-size: 13px;
      color: #64748b;
    }

    .sa-field-hint {
      margin-top: 8px;
      font-size: 11px;
      color: #475569;
    }

    /* ─── Save row ─────────────────────── */
    .sa-save-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 12px;
    }

    .sa-save-info {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 12px;
      color: #64748b;
    }

    .sa-save-btn {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 10px 22px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border: none;
      border-radius: 9px;
      color: white;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .sa-save-btn:hover { opacity: 0.9; }
    .sa-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* ─── Responsive ───────────────────── */
    @media (max-width: 768px) {
      .sa-main { padding: 16px; }
      .sa-topbar { padding: 0 16px; }
      .sa-kpi-grid { grid-template-columns: 1fr 1fr; }
      .sa-plans-layout { grid-template-columns: 1fr; }
      .sa-admin-name, .sa-admin-role { display: none; }
    }
  `]
})
export class SuperAdminComponent implements OnInit {

  activeTab: 'overview' | 'fermes' | 'plans' = 'overview';
  loading = true;
  stats: PlatformStats | null = null;
  fermes: FermeInfo[] = [];
  planConfig: PlanConfig | null = null;
  searchFerme = '';
  toggling: string | null = null;
  savingPlan = false;
  editFreeLimit = 5;
  editPremiumLimit = -1;

  constructor(
    private superAdminService: SuperAdminService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  get profile() { return this.authService.getProfile(); }

  get initiales(): string {
    const p = this.profile;
    if (!p) return 'SA';
    return `${p.prenom?.charAt(0) ?? ''}${p.nom?.charAt(0) ?? ''}`.toUpperCase();
  }

  get tauxActivite(): number {
    if (!this.stats || this.stats.totalFermes === 0) return 0;
    return Math.round((this.stats.fermesActives / this.stats.totalFermes) * 100);
  }

  get filteredFermes(): FermeInfo[] {
    if (!this.searchFerme.trim()) return this.fermes;
    const q = this.searchFerme.toLowerCase();
    return this.fermes.filter(f =>
      f.nomFerme.toLowerCase().includes(q) ||
      f.fermeCode.toLowerCase().includes(q)
    );
  }

  ngOnInit(): void {
    this.loadOverview();
  }

  loadOverview(): void {
    this.loading = true;
    this.superAdminService.getStats().subscribe({
      next: (s) => { this.stats = s; },
      error: () => this.toastr.error('Impossible de charger les statistiques')
    });
    this.superAdminService.getFermes().subscribe({
      next: (f) => { this.fermes = f; this.loading = false; },
      error: () => { this.loading = false; this.toastr.error('Impossible de charger les fermes'); }
    });
  }

  switchTab(tab: 'overview' | 'fermes' | 'plans'): void {
    this.activeTab = tab;
    if (tab === 'fermes' && !this.fermes.length) {
      this.loadFermes();
    }
    if (tab === 'plans' && !this.planConfig) {
      this.loadPlanConfig();
    }
  }

  loadFermes(): void {
    this.loading = true;
    this.superAdminService.getFermes().subscribe({
      next: (f) => { this.fermes = f; this.loading = false; },
      error: () => { this.loading = false; this.toastr.error('Impossible de charger les fermes'); }
    });
  }

  loadPlanConfig(): void {
    this.superAdminService.getPlanConfig().subscribe({
      next: (c) => {
        this.planConfig = c;
        this.editFreeLimit = c.maxAnimauxFreePlan;
        this.editPremiumLimit = c.maxAnimauxPremiumPlan;
      },
      error: () => this.toastr.error('Impossible de charger la configuration des plans')
    });
  }

  toggleFerme(ferme: FermeInfo): void {
    this.toggling = ferme.fermeCode;
    this.superAdminService.toggleFerme(ferme.fermeCode).subscribe({
      next: (res) => {
        ferme.active = res.active;
        this.toggling = null;
        if (this.stats) {
          this.stats.fermesActives   = this.fermes.filter(f => f.active).length;
          this.stats.fermesSuspendues = this.fermes.filter(f => !f.active).length;
        }
        this.toastr.success(
          res.message,
          ferme.active ? '✅ Ferme activée' : '⏸ Ferme suspendue'
        );
      },
      error: () => {
        this.toggling = null;
        this.toastr.error('Erreur lors du changement de statut');
      }
    });
  }

  savePlanConfig(): void {
    this.savingPlan = true;
    this.superAdminService.updatePlanConfig({
      maxAnimauxFreePlan: this.editFreeLimit,
      maxAnimauxPremiumPlan: this.editPremiumLimit
    }).subscribe({
      next: (res) => {
        this.savingPlan = false;
        if (this.planConfig) {
          this.planConfig.maxAnimauxFreePlan    = res.maxAnimauxFreePlan;
          this.planConfig.maxAnimauxPremiumPlan = res.maxAnimauxPremiumPlan;
          this.planConfig.updatedAt             = res.updatedAt;
        }
        this.toastr.success(
          `FREE: ${this.editFreeLimit} · PREMIUM: ${this.editPremiumLimit === -1 ? '∞' : this.editPremiumLimit}`,
          'Limites mises à jour'
        );
      },
      error: () => {
        this.savingPlan = false;
        this.toastr.error('Erreur lors de la sauvegarde');
      }
    });
  }

  /** Couleur déterministe basée sur le code ferme */
  farmColor(code: string): string {
    const colors = [
      '#6366f1', '#8b5cf6', '#06b6d4', '#10b981',
      '#f59e0b', '#ef4444', '#ec4899', '#0ea5e9'
    ];
    let hash = 0;
    for (let i = 0; i < code.length; i++) hash = code.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  logout(): void {
    this.authService.logout();
  }
}
