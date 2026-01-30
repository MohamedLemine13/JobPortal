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
  TrendingUp,
  CheckCircle,
  ChevronDown,
  Settings,
  Menu,
  X,
  Mail,
  User,
  Shield,
  Building2,
  Clock,
  Trash2,
  Eye
} from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './admin-dashboard.component.html',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerFadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.4s {{delay}}ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ], { params: { delay: 0 } })
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
export class AdminDashboardComponent implements OnInit {

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

    this.fetchDashboardData();
  }

  fetchDashboardData() {
    // Fetch dashboard stats
    this.adminService.getDashboardStats().subscribe({
      next: (response: any) => {
        console.log('Admin Dashboard Stats:', response);
        const data = response.data || response;
        
        this.stats.set([
          { 
            label: 'Total Users', 
            value: data.totalUsers || 0, 
            growth: `${data.totalJobSeekers || 0} seekers, ${data.totalEmployers || 0} employers`, 
            icon: Users,
            bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
            iconBg: 'bg-white/20'
          },
          { 
            label: 'Total Jobs', 
            value: data.totalJobs || 0, 
            growth: `${data.activeJobs || 0} active`, 
            icon: Briefcase,
            bgColor: 'bg-gradient-to-br from-green-500 to-green-600',
            iconBg: 'bg-white/20'
          },
          { 
            label: 'Total Applications', 
            value: data.totalApplications || 0, 
            growth: 'All time', 
            icon: FileText,
            bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
            iconBg: 'bg-white/20'
          },
        ]);
      },
      error: (err: any) => console.error('Failed to fetch dashboard stats', err)
    });

    // Fetch recent users
    this.adminService.getAllUsers(0, 5).subscribe({
      next: (response: any) => {
        console.log('Recent Users:', response);
        const data = response.data || response;
        const users = data.content || [];
        
        const recentUsersList = users.slice(0, 5).map((u: any) => ({
          id: u.id,
          name: u.fullName || u.companyName || u.email,
          email: u.email,
          role: u.role,
          verified: u.verified,
          createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A',
          initials: (u.fullName || u.companyName || u.email).charAt(0).toUpperCase()
        }));
        this.recentUsers.set(recentUsersList);
      },
      error: (err: any) => console.error('Failed to fetch recent users', err)
    });

    // Fetch recent jobs
    this.adminService.getAllJobs(0, 5).subscribe({
      next: (response: any) => {
        console.log('Recent Jobs:', response);
        const data = response.data || response;
        const jobs = data.content || [];
        
        const recentJobsList = jobs.slice(0, 5).map((j: any) => ({
          id: j.id,
          title: j.title,
          company: j.companyName || 'Unknown Company',
          location: j.location || 'N/A',
          status: j.status || 'active',
          createdAt: j.createdAt ? new Date(j.createdAt).toLocaleDateString() : 'N/A'
        }));
        this.recentJobs.set(recentJobsList);
      },
      error: (err: any) => console.error('Failed to fetch recent jobs', err)
    });
  }

  // Icons
  readonly Briefcase = Briefcase;
  readonly LayoutDashboard = LayoutDashboard;
  readonly Users = Users;
  readonly FileText = FileText;
  readonly LogOut = LogOut;
  readonly TrendingUp = TrendingUp;
  readonly CheckCircle = CheckCircle;
  readonly ChevronDown = ChevronDown;
  readonly Settings = Settings;
  readonly Menu = Menu;
  readonly X = X;
  readonly Mail = Mail;
  readonly User = User;
  readonly Shield = Shield;
  readonly Building2 = Building2;
  readonly Clock = Clock;
  readonly Trash2 = Trash2;
  readonly Eye = Eye;

  // Profile dropdown state
  isProfileDropdownOpen = signal(false);

  toggleProfileDropdown() {
    this.isProfileDropdownOpen.update(v => !v);
  }

  closeProfileDropdown() {
    this.isProfileDropdownOpen.set(false);
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
    name: 'Admin',
    email: '',
    role: 'Administrator',
    avatar: null as string | null
  });

  // Navigation items
  readonly navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', route: '/admin-dashboard', active: true },
    { icon: Users, label: 'Manage Users', route: '/admin-dashboard/users', active: false },
    { icon: Briefcase, label: 'Manage Jobs', route: '/admin-dashboard/jobs', active: false },
    { icon: Settings, label: 'Settings', route: '/admin-dashboard/settings', active: false },
  ];

  // Stats data
  stats = signal([
    { 
      label: 'Total Users', 
      value: 0, 
      growth: '0 seekers, 0 employers', 
      icon: Users,
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconBg: 'bg-white/20'
    },
    { 
      label: 'Total Jobs', 
      value: 0, 
      growth: '0 active', 
      icon: Briefcase,
      bgColor: 'bg-gradient-to-br from-green-500 to-green-600',
      iconBg: 'bg-white/20'
    },
    { 
      label: 'Total Applications', 
      value: 0, 
      growth: 'All time', 
      icon: FileText,
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
      iconBg: 'bg-white/20'
    },
  ]);

  // Recent users
  recentUsers = signal<any[]>([]);

  // Recent jobs
  recentJobs = signal<any[]>([]);

  // Quick actions
  readonly quickActions = [
    { icon: Users, label: 'View All Users', route: '/admin-dashboard/users' },
    { icon: Briefcase, label: 'View All Jobs', route: '/admin-dashboard/jobs' },
    { icon: Settings, label: 'System Settings', route: '/admin-dashboard/settings' },
  ];

  getRoleBadgeClass(role: string): string {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return 'bg-red-100 text-red-700';
      case 'EMPLOYER':
        return 'bg-blue-100 text-blue-700';
      case 'JOB_SEEKER':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
