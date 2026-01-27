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
  ArrowLeft,
  Camera,
  Save,
  X,
  Menu,
  Mail,
  ChevronDown,
  User,
  Phone,
  MapPin
} from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('toastSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('0.3s ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
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
export class ProfileComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    if (!this.authService.getToken()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadUserProfile();
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
          phone: profile.phone || '',
          location: profile.location || '',
          role: 'Employer',
          avatar: avatarUrl
        });
        
        // Update edit form fields
        this.editName.set(this.user().name);
        this.editEmail.set(this.user().email);
        this.editPhone.set(this.user().phone);
        this.editLocation.set(this.user().location);
      },
      error: (err) => console.error('Failed to load profile', err)
    });
  }
  // Icons
  readonly Briefcase = Briefcase;
  readonly LayoutDashboard = LayoutDashboard;
  readonly Plus = Plus;
  readonly FileText = FileText;
  readonly Building2 = Building2;
  readonly LogOut = LogOut;
  readonly ArrowLeft = ArrowLeft;
  readonly Camera = Camera;
  readonly Save = Save;
  readonly X = X;
  readonly Menu = Menu;
  readonly Mail = Mail;
  readonly ChevronDown = ChevronDown;
  readonly User = User;
  readonly Phone = Phone;
  readonly MapPin = MapPin;

  // Mobile menu state
  isMobileMenuOpen = signal(false);

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  // User profile data
  user = signal({
    name: '',
    email: '',
    phone: '',
    location: '',
    role: 'Employer',
    avatar: null as string | null
  });

  // Form fields
  editName = signal('');
  editEmail = signal('');
  editPhone = signal('');
  editLocation = signal('');

  // Toast notification
  toast = signal<{ message: string; visible: boolean }>({
    message: '',
    visible: false
  });

  // Navigation items
  readonly navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', route: '/employer-dashbord', active: false },
    { icon: Plus, label: 'Post Job', route: '/employer-dashbord/post-job', active: false },
    { icon: FileText, label: 'Manage Jobs', route: '/employer-dashbord/manage-jobs', active: false },
    { icon: Building2, label: 'Company Profile', route: '/employer-dashbord/company-profile', active: false },
    { icon: Mail, label: 'Messages', route: '/employer-dashbord/messages', active: false },
  ];

  saveProfile() {
    this.user.update(u => ({
      ...u,
      name: this.editName(),
      email: this.editEmail(),
      phone: this.editPhone(),
      location: this.editLocation()
    }));
    this.showToast('Profile updated successfully!');
  }

  showToast(message: string) {
    this.toast.set({ message, visible: true });
    setTimeout(() => {
      this.toast.set({ message: '', visible: false });
    }, 3000);
  }

  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.user.update(u => ({ ...u, avatar: e.target?.result as string }));
      };
      reader.readAsDataURL(input.files[0]);
    }
  }
}
