import { Component, signal, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { 
  LucideAngularModule, 
  Briefcase, 
  LayoutDashboard, 
  Plus, 
  FileText, 
  Building2, 
  LogOut,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  ChevronDown,
  Settings,
  Menu,
  X,
  Mail,
  Edit3,
  User,
  Bookmark
} from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';
import { JobService } from '../../../services/job.service';
import { ApplicationService } from '../../../services/application.service';
import { ProfileService } from '../../../services/profile.service';

@Component({
  selector: 'app-employer-dashboard',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './employer-dashboard.component.html',
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
export class EmployerDashboardComponent implements OnInit {

  constructor(
    private authService: AuthService, 
    private router: Router,
    private jobService: JobService,
    private applicationService: ApplicationService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    if (!this.authService.getToken()) {
        this.router.navigate(['/login']);
        return;
    }

    // Load user profile with avatar
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

    this.fetchDashboardData();
  }

  loadUserProfile() {
    this.profileService.getProfile().subscribe({
      next: (response: any) => {
        console.log('Profile response:', response);
        const data = response.data || response;
        const profile = data.profile || {};
        const userInfo = data.user || {};
        
        console.log('Profile data:', profile);
        console.log('Avatar from profile:', profile.avatar);
        
        const avatarUrl = this.profileService.getFileUrl(profile.avatar);
        console.log('Constructed avatar URL:', avatarUrl);
        
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

  fetchDashboardData() {
    console.log('Fetching dashboard data...');
    this.jobService.getEmployerJobs().subscribe({
      next: (response: any) => {
        console.log('Dashboard API Response:', response);
        const data = response.data || response;
        
        // Update stats
        if (data.stats) {
          this.stats.set([
            { 
              label: 'Active Jobs', 
              value: data.stats.activeJobs || 0, 
              growth: '+100%', 
              icon: Briefcase,
              bgColor: 'bg-linear-to-br from-blue-500 to-blue-600',
              iconBg: 'bg-white/20'
            },
            { 
              label: 'Total Applicants', 
              value: data.stats.totalApplicants || 0, 
              growth: '+100%', 
              icon: Users,
              bgColor: 'bg-linear-to-br from-green-500 to-green-600',
              iconBg: 'bg-white/20'
            },
            { 
              label: 'Hired', 
              value: data.stats.hiredCount || 0, 
              growth: '+100%', 
              icon: CheckCircle,
              bgColor: 'bg-linear-to-br from-purple-500 to-purple-600',
              iconBg: 'bg-white/20'
            },
          ]);
        }

        // Update recent jobs
        const jobsArray = data.jobs || [];
        if (jobsArray.length > 0) {
          const recentJobsList = jobsArray.slice(0, 3).map((j: any) => ({
            id: j.id,
            title: j.title,
            location: j.location || 'N/A',
            date: j.postedAt ? new Date(j.postedAt).toLocaleDateString() : 'Recently',
            status: (j.status || 'active').toLowerCase(),
            icon: Briefcase
          }));
          this.recentJobs.set(recentJobsList);
        }
      },
      error: (err: any) => console.error('Failed to fetch dashboard data', err)
    });

    // Fetch recent applications
    this.applicationService.getEmployerApplications(1, 5).subscribe({
      next: (response: any) => {
        console.log('Recent applications response:', response);
        const data = response.data || response;
        const applications = data.applications || [];
        
        const recentApps = applications.slice(0, 3).map((app: any) => {
          const name = app.applicant?.fullName || 'Unknown';
          const initials = name.split(' ').map((n: string) => n.charAt(0).toUpperCase()).join('').slice(0, 2);
          
          // Calculate time ago
          let timeAgo = 'Recently';
          if (app.appliedAt) {
            const appliedDate = new Date(app.appliedAt);
            const now = new Date();
            const diffMs = now.getTime() - appliedDate.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            
            if (diffDays > 0) {
              timeAgo = `${diffDays}d ago`;
            } else if (diffHours > 0) {
              timeAgo = `${diffHours}h ago`;
            } else {
              timeAgo = 'Just now';
            }
          }
          
          // Get proper avatar URL using profileService
          const avatarUrl = this.profileService.getFileUrl(app.applicant?.avatar);
          
          return {
            id: app.id,
            name: name,
            initials: initials,
            position: app.job?.title || 'Unknown Position',
            timeAgo: timeAgo,
            status: app.status || 'pending',
            avatar: avatarUrl
          };
        });
        
        this.recentApplications.set(recentApps);
      },
      error: (err: any) => console.error('Failed to fetch recent applications', err)
    });
  }

  // Icons
  readonly Briefcase = Briefcase;
  readonly LayoutDashboard = LayoutDashboard;
  readonly Plus = Plus;
  readonly FileText = FileText;
  readonly Building2 = Building2;
  readonly LogOut = LogOut;
  readonly TrendingUp = TrendingUp;
  readonly Users = Users;
  readonly CheckCircle = CheckCircle;
  readonly Clock = Clock;
  readonly ChevronDown = ChevronDown;
  readonly Settings = Settings;
  readonly Menu = Menu;
  readonly X = X;
  readonly Mail = Mail;
  readonly Edit3 = Edit3;
  readonly User = User;
  readonly Bookmark = Bookmark;

  // Profile dropdown state
  isProfileDropdownOpen = signal(false);
  isEditingProfile = signal(false);
  editName = signal('');
  editEmail = signal('');

  toggleProfileDropdown() {
    this.isProfileDropdownOpen.update(v => !v);
  }

  closeProfileDropdown() {
    this.isProfileDropdownOpen.set(false);
  }

  startEditProfile() {
    this.editName.set(this.user().name);
    this.editEmail.set('');
    this.isEditingProfile.set(true);
    this.isProfileDropdownOpen.set(false);
  }

  saveProfile() {
    this.user.update(u => ({
      ...u,
      name: this.editName()
    }));
    this.isEditingProfile.set(false);
  }

  cancelEditProfile() {
    this.isEditingProfile.set(false);
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
    { icon: LayoutDashboard, label: 'Dashboard', route: '/employer-dashbord', active: true },
    { icon: Plus, label: 'Post Job', route: '/employer-dashbord/post-job', active: false },
    { icon: FileText, label: 'Manage Jobs', route: '/employer-dashbord/manage-jobs', active: false },
    { icon: Building2, label: 'Company Profile', route: '/employer-dashbord/company-profile', active: false },
    { icon: Mail, label: 'Messages', route: '/employer-dashbord/messages', active: false },
  ];

  // Stats data
  stats = signal([
    { 
      label: 'Active Jobs', 
      value: 0, 
      growth: '+100%', 
      icon: Briefcase,
      bgColor: 'bg-linear-to-br from-blue-500 to-blue-600',
      iconBg: 'bg-white/20'
    },
    { 
      label: 'Total Applicants', 
      value: 0, 
      growth: '+100%', 
      icon: Users,
      bgColor: 'bg-linear-to-br from-green-500 to-green-600',
      iconBg: 'bg-white/20'
    },
    { 
      label: 'Hired', 
      value: 0, 
      growth: '+100%', 
      icon: CheckCircle,
      bgColor: 'bg-linear-to-br from-purple-500 to-purple-600',
      iconBg: 'bg-white/20'
    },
  ]);

  // Recent job posts
  recentJobs = signal<any[]>([]);

  // Recent applications - populated from backend
  recentApplications = signal<any[]>([]);

  // Quick actions
  readonly quickActions = [
    { icon: Plus, label: 'Post New Job', route: '/employer-dashbord/post-job' },
    { icon: Users, label: 'Review Applications', route: '/employer-dashbord/manage-jobs' },
    { icon: Settings, label: 'Company Settings', route: '/employer-dashbord/company-profile' },
  ];

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
