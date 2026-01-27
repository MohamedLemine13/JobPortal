import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, ActivatedRoute, Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import {
  LucideAngularModule,
  Briefcase,
  LayoutDashboard,
  Plus,
  FileText,
  Building2,
  LogOut,
  ArrowLeft,
  MapPin,
  Users,
  Calendar,
  Download,
  Eye,
  X,
  ChevronDown,
  Menu,
  Mail,
  Edit3
} from 'lucide-angular';
import { ApplicationService } from '../../../services/application.service';
import { JobService } from '../../../services/job.service';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';
import { MessageService } from '../../../services/message.service';

interface Applicant {
  id: string; // Application ID
  applicantId: string; // User ID
  name: string;
  email: string;
  avatar: string | null;
  appliedDate: string;
  status: 'Applied' | 'In Review' | 'Rejected' | 'Accepted';
  resumeUrl?: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  coverLetter?: string;
}

interface JobDetails {
  id: string;
  title: string;
  location: string;
  type: string;
  category: string;
  applicantCount: number;
}

@Component({
  selector: 'app-job-applications',
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './job-applications.component.html',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('modalFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.2s ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.2s ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('modalSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95) translateY(-20px)' }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ]),
      transition(':leave', [
        animate('0.2s ease-in', style({ opacity: 0, transform: 'scale(0.95) translateY(-20px)' }))
      ])
    ]),
    trigger('sidebarSlide', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('0.3s ease-out', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('0.3s ease-in', style({ transform: 'translateX(-100%)' }))
      ])
    ])
  ]
})
export class JobApplicationsComponent implements OnInit {
  // Icons
  readonly Briefcase = Briefcase;
  readonly LayoutDashboard = LayoutDashboard;
  readonly Plus = Plus;
  readonly FileText = FileText;
  readonly Building2 = Building2;
  readonly LogOut = LogOut;
  readonly ArrowLeft = ArrowLeft;
  readonly MapPin = MapPin;
  readonly Users = Users;
  readonly Calendar = Calendar;
  readonly Download = Download;
  readonly Eye = Eye;
  readonly X = X;
  readonly ChevronDown = ChevronDown;
  readonly Menu = Menu;
  readonly Mail = Mail;
  readonly Edit3 = Edit3;

  // Profile dropdown state
  isProfileDropdownOpen = signal(false);

  toggleProfileDropdown() {
    this.isProfileDropdownOpen.update(v => !v);
  }

  // Mobile menu state
  isMobileMenuOpen = signal(false);

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  // User info
  user = signal({
    name: '',
    email: '',
    role: 'Employer',
    avatar: null as string | null
  });

  // Navigation items
  readonly navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', route: '/employer-dashbord', active: false },
    { icon: Plus, label: 'Post Job', route: '/employer-dashbord/post-job', active: false },
    { icon: FileText, label: 'Manage Jobs', route: '/employer-dashbord/manage-jobs', active: true },
    { icon: Building2, label: 'Company Profile', route: '/employer-dashbord/company-profile', active: false },
    { icon: Mail, label: 'Messages', route: '/employer-dashbord/messages', active: false },
  ];

  // Current job details
  jobDetails = signal<JobDetails>({
    id: '1',
    title: 'DevOps Engineer',
    location: 'Amsterdam, Netherlands',
    type: 'Remote',
    category: 'IT & Software',
    applicantCount: 4
  });

  // Applicants list - loaded from backend
  applicants = signal<Applicant[]>([]);

  // Modal state
  selectedApplicant = signal<Applicant | null>(null);
  isModalOpen = signal(false);

  // Status options for display
  readonly statusOptions = ['Applied', 'In Review', 'Accepted', 'Rejected'];

  // Current job ID
  currentJobId = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService,
    private jobService: JobService,
    private authService: AuthService,
    private profileService: ProfileService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    if (!this.authService.getToken()) {
      this.router.navigate(['/login']);
      return;
    }

    // Load user profile
    this.loadUserProfile();

    // Subscribe to user changes
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user.update(u => ({
          ...u,
          name: user.fullName,
          email: user.email
        }));
      }
    });

    // Get job ID from route params
    this.route.params.subscribe(params => {
      if (params['jobId']) {
        this.currentJobId.set(params['jobId']);
        this.loadJobData(params['jobId']);
      }
    });
  }

  loadUserProfile() {
    this.profileService.getProfile().subscribe({
      next: (response: any) => {
        const data = response.data || response;
        const profile = data.profile || {};
        const userInfo = data.user || {};

        const avatarUrl = this.profileService.getFileUrl(profile.avatar);

        this.user.set({
          name: profile.fullName || profile.companyName || userInfo.email || 'User',
          email: userInfo.email || '',
          role: 'Employer',
          avatar: avatarUrl
        });
      },
      error: (err) => console.error('Failed to load profile', err)
    });
  }

  loadJobData(jobId: string) {
    console.log('Loading job:', jobId);

    // Fetch job details
    this.jobService.getJob(jobId).subscribe({
      next: (response: any) => {
        console.log('Job details response:', response);
        // Response structure: { data: { job: {...}, hasApplied, isSaved } }
        const data = response.data || response;
        const job = data.job || data;
        this.jobDetails.set({
          id: job.id || jobId,
          title: job.title || 'Unknown Job',
          location: job.location || 'N/A',
          type: job.type || 'Full-time',
          category: job.category || 'General',
          applicantCount: job.applicantsCount || 0
        });
      },
      error: (err) => {
        console.error('Failed to load job details', err);
        // Set default values on error
        this.jobDetails.set({
          id: jobId,
          title: 'Job Details',
          location: 'N/A',
          type: 'Full-time',
          category: 'General',
          applicantCount: 0
        });
      }
    });

    // Fetch applications for this job
    this.applicationService.getJobApplications(jobId).subscribe({
      next: (response: any) => {
        console.log('Applications response:', response);
        const data = response.data || response;
        const applications = data.applications || [];

        const mappedApplicants = applications.map((app: any) => {
          console.log('Mapping applicant:', app);
          // Get proper avatar URL
          const avatarUrl = this.profileService.getFileUrl(app.applicant?.avatar);
          // Get proper CV URL
          const cvUrl = app.cvUrl ? this.profileService.getViewUrl(app.cvUrl) : null;

          return {
            id: app.id,
            applicantId: app.applicant?.id, // Get User ID
            name: app.applicant?.fullName || 'Unknown Applicant',
            email: app.applicant?.email || 'No email provided',
            avatar: avatarUrl,
            appliedDate: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A',
            status: this.mapStatus(app.status),
            resumeUrl: cvUrl,
            phone: app.applicant?.phone || '',
            location: app.applicant?.location || '',
            bio: app.applicant?.bio || '',
            skills: app.applicant?.skills || [],
            coverLetter: app.coverLetter || ''
          };
        });

        this.applicants.set(mappedApplicants);
      },
      error: (err) => console.error('Failed to load applications', err)
    });
  }

  mapStatus(backendStatus: string): Applicant['status'] {
    const statusMap: Record<string, Applicant['status']> = {
      'pending': 'Applied',
      'reviewed': 'In Review',
      'shortlisted': 'In Review',
      'interview': 'In Review',
      'hired': 'Accepted',
      'rejected': 'Rejected'
    };
    return statusMap[backendStatus?.toLowerCase()] || 'Applied';
  }

  mapStatusToBackend(frontendStatus: string): string {
    const statusMap: Record<string, string> = {
      'Applied': 'pending',
      'In Review': 'reviewed',
      'Rejected': 'rejected',
      'Accepted': 'hired'
    };
    return statusMap[frontendStatus] || 'pending';
  }

  openApplicantModal(applicant: Applicant) {
    this.selectedApplicant.set(applicant);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedApplicant.set(null);
  }

  updateApplicantStatus(applicantId: string, newStatus: string) {
    const backendStatus = this.mapStatusToBackend(newStatus);

    this.applicationService.updateApplicationStatus(applicantId, {
      status: backendStatus as any
    }).subscribe({
      next: () => {
        // Update local state
        this.applicants.update(apps =>
          apps.map(a => a.id === applicantId
            ? { ...a, status: newStatus as Applicant['status'] }
            : a
          )
        );
        // Also update the selected applicant if modal is open
        const selected = this.selectedApplicant();
        if (selected?.id === applicantId) {
          this.selectedApplicant.update(a => a ? { ...a, status: newStatus as Applicant['status'] } : null);


          // Send automated message based on status change
          if (selected && selected.applicantId) {
            const messageContent = this.getStatusMessage(newStatus, this.jobDetails().title, this.user().name);

            if (messageContent) {
              console.log(`Sending '${newStatus}' message to user:`, selected.applicantId);
              this.messageService.startConversation({
                recipientId: selected.applicantId,
                content: messageContent
              }).subscribe({
                next: () => console.log('Status update message sent successfully'),
                error: (err) => console.error('Failed to send status update message', err)
              });
            }
          }
        }
      },
      error: (err) => {
        console.error('Failed to update application status', err);
        alert('Failed to update status. Please try again.');
      }
    });
  }

  getStatusMessage(status: string, jobTitle: string, companyName: string): string | null {
    switch (status) {
      case 'Accepted':
        return `Congratulations! Your application for the ${jobTitle} position at ${companyName} has been accepted. We will be in touch shortly regarding next steps.`;
      case 'Rejected':
        return `Thank you for your interest in the ${jobTitle} position at ${companyName}. After careful consideration, we have decided to move forward with other candidates. We appreciate your time and wish you the best in your search.`;
      case 'In Review':
        return `Hello! Your application for the ${jobTitle} position at ${companyName} is now being reviewed by our team. We will get back to you soon.`;
      default:
        return null;
    }
  }

  downloadResume(applicant: Applicant) {
    if (applicant.resumeUrl) {
      // Open the CV URL in a new tab
      window.open(applicant.resumeUrl, '_blank');
    } else {
      alert('No resume available for this applicant.');
    }
  }

  goBack() {
    this.router.navigate(['/employer-dashbord/manage-jobs']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Applied': return 'bg-blue-100 text-blue-700';
      case 'In Review': return 'bg-yellow-100 text-yellow-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      case 'Accepted': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }
}
