import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'integration',
    pathMatch: 'full'
  },
  {
    path: 'integration',
    loadComponent: () => import('./features/integration/pages/integration-page.component').then(m => m.IntegrationPageComponent)
  },
  // {
  //   path: 'data-viewer',
  //   loadComponent: () => import('./features/data-viewer/pages/data-viewer-page.component').then(m => m.DataViewerPageComponent)
  // },
  // {
  //   path: 'organization-explorer',
  //   loadComponent: () => import('./features/organization-explorer/pages/organization-explorer-page.component').then(m => m.OrganizationExplorerPageComponent)
  // },
  {
    path: '**',
    redirectTo: 'integration'
  }
];