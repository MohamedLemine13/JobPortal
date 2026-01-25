import { Component, signal, computed } from '@angular/core';
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

interface Applicant {
  id: string;
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
export class JobApplicationsComponent {
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
    name: 'John Davis',
    email: 'f@gmail.com',
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

  // Applicants list
  applicants = signal<Applicant[]>([
    {
      id: '1',
      name: 'Michael Wilson',
      email: 'user2@timetoprogram.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      appliedDate: '5th 07 2025',
      status: 'Applied',
      resumeUrl: '/resumes/michael-wilson.pdf',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      bio: 'Experienced DevOps engineer with 5+ years in cloud infrastructure.',
      skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform']
    },
    {
      id: '2',
      name: 'Jennifer Miller',
      email: 'user3@timetoprogram.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer',
      appliedDate: '5th 07 2025',
      status: 'Applied',
      resumeUrl: '/resumes/jennifer-miller.pdf',
      phone: '+1 (555) 234-5678',
      location: 'New York, NY',
      bio: 'Cloud architect passionate about automation and scalability.',
      skills: ['Azure', 'GCP', 'Python', 'Ansible', 'Jenkins']
    },
    {
      id: '3',
      name: 'William Anderson',
      email: 'user4@timetoprogram.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=William',
      appliedDate: '5th 07 2025',
      status: 'Applied',
      resumeUrl: '/resumes/william-anderson.pdf',
      phone: '+1 (555) 345-6789',
      location: 'Austin, TX',
      bio: 'Senior engineer specializing in microservices and container orchestration.',
      skills: ['Docker', 'Kubernetes', 'Go', 'Linux', 'Monitoring']
    },
    {
      id: '4',
      name: 'David Jackson',
      email: 'user5@timetoprogram.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      appliedDate: '5th 07 2025',
      status: 'Applied',
      resumeUrl: '/resumes/david-jackson.pdf',
      phone: '+1 (555) 456-7890',
      location: 'Seattle, WA',
      bio: 'Full stack developer transitioning to DevOps with strong scripting skills.',
      skills: ['Bash', 'Python', 'AWS', 'Docker', 'Git']
    }
  ]);

  // Modal state
  selectedApplicant = signal<Applicant | null>(null);
  isModalOpen = signal(false);

  // Status options
  readonly statusOptions = ['Applied', 'In Review', 'Rejected', 'Accepted'];

  constructor(private route: ActivatedRoute, private router: Router) {
    // Get job ID from route params
    this.route.params.subscribe(params => {
      if (params['jobId']) {
        this.loadJobData(params['jobId']);
      }
    });
  }

  loadJobData(jobId: string) {
    // In a real app, fetch job and applicants data from API
    console.log('Loading job:', jobId);
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
    this.applicants.update(apps => 
      apps.map(a => a.id === applicantId 
        ? { ...a, status: newStatus as Applicant['status'] } 
        : a
      )
    );
    // Also update the selected applicant if modal is open
    if (this.selectedApplicant()?.id === applicantId) {
      this.selectedApplicant.update(a => a ? { ...a, status: newStatus as Applicant['status'] } : null);
    }
  }

  downloadResume(applicant: Applicant) {
    // In a real app, trigger file download
    console.log('Downloading resume for:', applicant.name);
    alert(`Downloading resume for ${applicant.name}`);
  }

  goBack() {
    this.router.navigate(['/employer-dashbord/manage-jobs']);
  }

  logout() {
    console.log('Logging out...');
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
