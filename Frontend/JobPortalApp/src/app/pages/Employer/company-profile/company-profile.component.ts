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
  Edit,
  Mail,
  X,
  Save,
  ChevronDown,
  CircleCheck,
  Flame,
  Menu,
  Edit3
} from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';
import { ProfileService, UpdateEmployerProfileRequest } from '../../../services/profile.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-company-profile',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, FormsModule],
  templateUrl: './company-profile.component.html',
  // ... (animations)
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('toastSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px) scale(0.95)' }),
        animate('0.4s cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('0.3s ease-in', style({ opacity: 0, transform: 'translateY(-20px) scale(0.95)' }))
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
export class CompanyProfileComponent implements OnInit {
  // Icons
  readonly Briefcase = Briefcase;
  readonly LayoutDashboard = LayoutDashboard;
  readonly Plus = Plus;
  readonly FileText = FileText;
  readonly Building2 = Building2;
  readonly LogOut = LogOut;
  readonly Edit = Edit;
  readonly Mail = Mail;
  readonly X = X;
  readonly Save = Save;
  readonly ChevronDown = ChevronDown;
  readonly CircleCheck = CircleCheck;
  readonly Flame = Flame;
  readonly Menu = Menu;
  readonly Edit3 = Edit3;

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

    // Fetch profile from backend
    this.fetchProfile();
  }

  fetchProfile() {
    this.profileService.getProfile().subscribe({
      next: (response: any) => {
        console.log('Profile response:', response);
        const data = response.data || response;
        const user = data.user;
        const profile = data.profile;

        // Update user info with proper avatar URL
        const avatarUrl = this.profileService.getFileUrl(profile?.avatar);
        this.user.set({
          name: profile?.fullName || user?.email || 'User',
          email: user?.email || '',
          avatar: avatarUrl,
          role: 'Employer'
        });

        // Update company info
        this.company.set({
          name: profile?.companyName || 'Company Name',
          type: profile?.companyType || 'Company',
          logo: profile?.companyLogo || null,
          description: profile?.description || ''
        });
      },
      error: (err) => {
        console.error('Failed to fetch profile', err);
      }
    });
  }

  // Profile dropdown state
  isProfileDropdownOpen = signal(false);

  toggleProfileDropdown() {
    this.isProfileDropdownOpen.update(v => !v);
  }

  closeProfileDropdown() {
    this.isProfileDropdownOpen.set(false);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

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
    { icon: LayoutDashboard, label: 'Dashboard', route: '/employer-dashbord', active: false },
    { icon: Plus, label: 'Post Job', route: '/employer-dashbord/post-job', active: false },
    { icon: FileText, label: 'Manage Jobs', route: '/employer-dashbord/manage-jobs', active: false },
    { icon: Building2, label: 'Company Profile', route: '/employer-dashbord/company-profile', active: true },
    { icon: Mail, label: 'Messages', route: '/employer-dashbord/messages', active: false },
  ];

  // Edit mode
  isEditMode = signal(false);

  // Toast notification
  toast = signal<{ message: string; visible: boolean }>({
    message: '',
    visible: false
  });

  // User info (view mode)
  user = signal({
    name: '',
    email: '',
    avatar: null as string | null,
    role: 'Employer'
  });

  // Company info (view mode)
  company = signal({
    name: 'NeoHire Labs',
    type: 'Company',
    logo: null as string | null,
    description: 'NeoHire Labs is a recruitment intelligence platform that leverages machine learning to match companies with top-tier tech talent.'
  });

  // Edit form fields
  editFullName = signal('');
  editEmail = signal('');
  editCompanyName = signal('');
  editCompanyDescription = signal('');
  editUserAvatar = signal<string | null>(null);
  editCompanyLogo = signal<string | null>(null);

  toggleEditMode() {
    if (!this.isEditMode()) {
      // Entering edit mode - populate form fields
      this.editFullName.set(this.user().name);
      this.editEmail.set(this.user().email);
      this.editCompanyName.set(this.company().name);
      this.editCompanyDescription.set(this.company().description);
      this.editUserAvatar.set(this.user().avatar);
      this.editCompanyLogo.set(this.company().logo);
    }
    this.isEditMode.update(v => !v);
  }

  updateField(field: string, event: Event) {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    switch (field) {
      case 'fullName': this.editFullName.set(value); break;
      case 'email': this.editEmail.set(value); break;
      case 'companyName': this.editCompanyName.set(value); break;
      case 'companyDescription': this.editCompanyDescription.set(value); break;
    }
  }

  selectedAvatarFile: File | null = null;

  onUserAvatarSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedAvatarFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.editUserAvatar.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  onCompanyLogoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.editCompanyLogo.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  saveChanges() {
    // First upload avatar if selected
    if (this.selectedAvatarFile) {
      this.profileService.uploadAvatar(this.selectedAvatarFile).subscribe({
        next: (response: any) => {
          console.log('Avatar uploaded:', response);
          const avatarUrl = this.profileService.getFileUrl(response.data?.avatarUrl || response.avatarUrl);
          this.user.update(u => ({ ...u, avatar: avatarUrl }));
          this.editUserAvatar.set(avatarUrl);
          this.selectedAvatarFile = null;
        },
        error: (err) => console.error('Failed to upload avatar', err)
      });
    }

    const request: UpdateEmployerProfileRequest = {
      fullName: this.editFullName(),
      companyName: this.editCompanyName(),
      description: this.editCompanyDescription()
    };

    this.profileService.updateEmployerProfile(request).subscribe({
      next: (response: any) => {
        console.log('Profile updated:', response);
        
        // Update local state
        this.user.update(u => ({
          ...u,
          name: this.editFullName(),
          email: this.editEmail()
        }));
        
        this.company.update(c => ({
          ...c,
          name: this.editCompanyName(),
          description: this.editCompanyDescription(),
          logo: this.editCompanyLogo()
        }));

        // Exit edit mode
        this.isEditMode.set(false);

        // Show toast
        this.showToast('Profile updated successfully!');
      },
      error: (err) => {
        console.error('Failed to update profile', err);
        this.showToast('Failed to update profile. Please try again.');
      }
    });
  }

  cancelEdit() {
    this.isEditMode.set(false);
  }

  showToast(message: string) {
    this.toast.set({ message, visible: true });
    setTimeout(() => {
      this.toast.update(t => ({ ...t, visible: false }));
    }, 4000);
  }

  hideToast() {
    this.toast.update(t => ({ ...t, visible: false }));
  }
}
