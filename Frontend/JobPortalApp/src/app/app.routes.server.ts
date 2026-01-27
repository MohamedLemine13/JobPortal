import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Employer routes - require authentication, use client-side rendering
  {
    path: 'employer-dashbord',
    renderMode: RenderMode.Client
  },
  {
    path: 'employer-dashbord/post-job',
    renderMode: RenderMode.Client
  },
  {
    path: 'employer-dashbord/manage-jobs',
    renderMode: RenderMode.Client
  },
  {
    path: 'employer-dashbord/company-profile',
    renderMode: RenderMode.Client
  },
  {
    path: 'employer-dashbord/messages',
    renderMode: RenderMode.Client
  },
  {
    path: 'employer-dashbord/profile',
    renderMode: RenderMode.Client
  },
  {
    path: 'employer-dashbord/job/:jobId/applications',
    renderMode: RenderMode.Client
  },
  // Job seeker routes - require authentication
  {
    path: 'find-jobs',
    renderMode: RenderMode.Client
  },
  {
    path: 'find-jobs/job-details/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'find-jobs/user-profile',
    renderMode: RenderMode.Client
  },
  {
    path: 'find-jobs/messages',
    renderMode: RenderMode.Client
  },
  {
    path: 'find-jobs/saved-jobs',
    renderMode: RenderMode.Client
  },
  // Public routes can be prerendered
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
