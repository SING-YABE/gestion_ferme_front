import {Routes} from "@angular/router";
import {AuthGuard} from "../../@core/security/guard/auth.guard";

const adminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'security',
    pathMatch: 'full'
  },
  {
    path: 'api-clients',
    loadComponent: () => import('../../pages/admin/api-clients/api-clients.component').then(m => m.ApiClientsComponent)
  },
  {
    path: 'security',
    canActivate: [AuthGuard],
    data: {permissions: 'create_role'},
    loadComponent: () => import('../../pages/admin/role-permission/role-permission.component').then(m => m.RolePermissionComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('../../pages/admin/config-management/config-management.component').then(m => m.ConfigManagementComponent)
  },
]

export default adminRoutes;
