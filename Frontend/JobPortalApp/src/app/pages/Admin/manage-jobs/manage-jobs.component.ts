import { Component, signal, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { 
  LucideAngularModule, 
  Briefcase, 
  LayoutDashboard, 
  Users,
  FileText,
  LogOut,
  ChevronDown,
  Settings,
  Menu,
  X,
  Shield,
  Trash2,
  MapPin,
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  DollarSign,
  Clock,
  User
} from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';
import { AdminService, JobDetail, ApplicationItem } from '../../../services/admin.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-jobs',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, FormsModule],
  templateUrl: './manage-jobs.component.html',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('0.3s ease-out', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('0.3s ease-in', style({ transform: 'translateX(-100%)' }))
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
    ])
  ]
})
export class ManageJobsComponent implements OnInit {

  constructor(
    private authService: AuthService, 
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    if (!this.authService.getToken()) {
      this.router.navigate(['/login']);
      return;
    }
    this.fetchJobs();
  }

  // Icons
  readonly Briefcase = Briefcase;
  readonly LayoutDashboard = LayoutDashboard;
  readonly Users = Users;
  readonly FileText = FileText;
  readonly LogOut = LogOut;
  readonly ChevronDown = ChevronDown;
  readonly Settings = Settings;
  readonly Menu = Menu;
  readonly X = X;
  readonly Shield = Shield;
  readonly Trash2 = Trash2;
  readonly MapPin = MapPin;
  readonly Building2 = Building2;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Eye = Eye;
  readonly DollarSign = DollarSign;
  readonly Clock = Clock;
  readonly User = User;

  // Mobile menu state
  isMobileMenuOpen = signal(false);

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  // Navigation items
  readonly navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', route: '/admin-dashboard', active: false },
    { icon: Users, label: 'Manage Users', route: '/admin-dashboard/users', active: false },
    { icon: Briefcase, label: 'Manage Jobs', route: '/admin-dashboard/jobs', active: true },
    { icon: Settings, label: 'Settings', route: '/admin-dashboard/settings', active: false },
  ];

  // Jobs data
  jobs = signal<any[]>([]);
  isLoading = signal(false);
  statusFilter = signal('');
  
  // Pagination
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  pageSize = 10;

  // Job Details Modal
  showJobDetailModal = signal(false);
  selectedJob = signal<JobDetail | null>(null);
  isLoadingJobDetail = signal(false);

  // Applications Modal
  showApplicationsModal = signal(false);
  selectedJobApplications = signal<ApplicationItem[]>([]);
  isLoadingApplications = signal(false);
  selectedJobTitle = signal('');

  fetchJobs() {
    this.isLoading.set(true);
    const status = this.statusFilter() || undefined;
    
    this.adminService.getAllJobs(this.currentPage(), this.pageSize, status).subscribe({
      next: (response: any) => {
        console.log('Jobs response:', response);
        const data = response.data || response;
        const jobsList = data.content || [];
        
        this.jobs.set(jobsList.map((j: any) => ({
          id: j.id,
          title: j.title,
          company: j.companyName || 'Unknown Company',
          location: j.location || 'N/A',
          status: j.status || 'active',
          salary: j.salary || 'Not specified',
          createdAt: j.createdAt ? new Date(j.createdAt).toLocaleDateString() : 'N/A',
          applicationsCount: j.applicationCount || j.applicationsCount || 0
        })));
        
        this.totalPages.set(data.totalPages || 1);
        this.totalElements.set(data.totalElements || jobsList.length);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch jobs', err);
        this.isLoading.set(false);
      }
    });
  }

  filterByStatus(status: string) {
    this.statusFilter.set(status);
    this.currentPage.set(0);
    this.fetchJobs();
  }

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(p => p + 1);
      this.fetchJobs();
    }
  }

  prevPage() {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
      this.fetchJobs();
    }
  }

  viewJobDetails(jobId: string) {
    this.isLoadingJobDetail.set(true);
    this.showJobDetailModal.set(true);
    
    this.adminService.getJobById(jobId).subscribe({
      next: (response: any) => {
        const job = response.data || response;
        this.selectedJob.set(job);
        this.isLoadingJobDetail.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch job details', err);
        this.isLoadingJobDetail.set(false);
        this.showJobDetailModal.set(false);
      }
    });
  }

  closeJobDetailModal() {
    this.showJobDetailModal.set(false);
    this.selectedJob.set(null);
  }

  viewApplications(jobId: string, jobTitle: string) {
    this.isLoadingApplications.set(true);
    this.selectedJobTitle.set(jobTitle);
    this.showApplicationsModal.set(true);
    
    this.adminService.getJobApplications(jobId).subscribe({
      next: (response: any) => {
        const applications = response.data || response || [];
        this.selectedJobApplications.set(applications);
        this.isLoadingApplications.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch applications', err);
        this.isLoadingApplications.set(false);
        this.showApplicationsModal.set(false);
      }
    });
  }

  closeApplicationsModal() {
    this.showApplicationsModal.set(false);
    this.selectedJobApplications.set([]);
    this.selectedJobTitle.set('');
  }

  deleteJob(jobId: string) {
    if (confirm('Are you sure you want to delete this job?')) {
      this.adminService.deleteJob(jobId).subscribe({
        next: () => {
          this.fetchJobs();
        },
        error: (err) => console.error('Failed to delete job', err)
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'closed':
        return 'bg-red-100 text-red-700';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getApplicationStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'reviewed':
        return 'bg-blue-100 text-blue-700';
      case 'shortlisted':
        return 'bg-purple-100 text-purple-700';
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  formatSalary(min: number, max: number): string {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    return `Up to $${max.toLocaleString()}`;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

