import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { EmployerDashboardComponent } from './pages/Employer/employer-dashboard/employer-dashboard.component';
import { PostJobComponent } from './pages/Employer/post-job/post-job.component';
import { ManageJobsComponent } from './pages/Employer/manage-jobs/manage-jobs.component';
import { CompanyProfileComponent } from './pages/Employer/company-profile/company-profile.component';
import { JobApplicationsComponent } from './pages/Employer/job-applications/job-applications.component';
import { MessagesComponent } from './pages/Employer/messages/messages.component';
import { ProfileComponent } from './pages/Employer/profile/profile.component';
import { JobSeekerDashboardComponent } from './pages/JobSeeker/job-seeker-dashboard/job-seeker-dashboard.component';
import { JobDetailsComponent } from './pages/JobSeeker/job-details/job-details.component';
import { UserProfileComponent } from './pages/JobSeeker/user-profile/user-profile.component';
import { JobSeekerMessagesComponent } from './pages/JobSeeker/messages/messages.component';
import { SavedJobsComponent } from './pages/JobSeeker/saved-jobs/saved-jobs.component';
import { AdminDashboardComponent } from './pages/Admin/admin-dashboard/admin-dashboard.component';
import { ManageUsersComponent } from './pages/Admin/manage-users/manage-users.component';
import { ManageJobsComponent as AdminManageJobsComponent } from './pages/Admin/manage-jobs/manage-jobs.component';
import { AdminSettingsComponent } from './pages/Admin/settings/settings.component';

export const routes: Routes = [
    { path: '', component: LandingPageComponent },
    { path: 'login', component: LoginPageComponent },
    { path: 'signup', component: SignupPageComponent },
    { path: 'admin-dashboard', component: AdminDashboardComponent, pathMatch: 'full' },
    { path: 'admin-dashboard/users', component: ManageUsersComponent },
    { path: 'admin-dashboard/jobs', component: AdminManageJobsComponent },
    { path: 'admin-dashboard/settings', component: AdminSettingsComponent },
    { path: 'employer-dashbord/post-job', component: PostJobComponent },
    { path: 'employer-dashbord/manage-jobs', component: ManageJobsComponent },
    { path: 'employer-dashbord/company-profile', component: CompanyProfileComponent },
    { path: 'employer-dashbord/job/:jobId/applications', component: JobApplicationsComponent, data: { renderMode: 'server' } },
    { path: 'employer-dashbord/messages', component: MessagesComponent },
    { path: 'employer-dashbord/profile', component: ProfileComponent },
    { path: 'employer-dashbord', component: EmployerDashboardComponent, pathMatch: 'full' },
    { path: 'find-jobs', component: JobSeekerDashboardComponent },
    { path: 'find-jobs/job-details/:id', component: JobDetailsComponent, data: { renderMode: 'server' } },
    { path: 'find-jobs/user-profile', component: UserProfileComponent },
    { path: 'find-jobs/messages', component: JobSeekerMessagesComponent },
    { path: 'find-jobs/saved-jobs', component: SavedJobsComponent },
];
