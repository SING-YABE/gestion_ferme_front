/**
 * Constantes des rôles du système.
 * Correspondent exactement aux noms définis dans le backend (DataInitializer).
 */
export const Roles = {
  SUPER_ADMIN    : 'ROLE_SUPER_ADMIN',
  ADMINISTRATEUR : 'ROLE_ADMINISTRATEUR',
  GERANT         : 'ROLE_GERANT',
  RESPONSABLE    : 'ROLE_RESPONSABLE',
  OUVRIER        : 'ROLE_OUVRIER',
} as const;

export type RoleType = typeof Roles[keyof typeof Roles];

/** Rôles ayant accès à la supervision (Gérant + Responsable + Admin) */
export const SUPERVISOR_ROLES: RoleType[] = [
  Roles.ADMINISTRATEUR,
  Roles.GERANT,
  Roles.RESPONSABLE,
];

/** Rôles ayant accès à la configuration de la ferme */
export const MANAGEMENT_ROLES: RoleType[] = [
  Roles.ADMINISTRATEUR,
  Roles.GERANT,
];
