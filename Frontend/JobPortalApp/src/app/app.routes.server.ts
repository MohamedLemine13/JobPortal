import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'employer-dashbord/job/:jobId/applications',
    renderMode: RenderMode.Client
  },
  {
    path: 'find-jobs/job-details/:id',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
