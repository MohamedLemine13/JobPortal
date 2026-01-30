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
  ChevronRight
} from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';
import { AdminService } from '../../../services/admin.service';
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
          applicationsCount: j.applicationsCount || 0
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

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
