import { Component, signal, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { 
  LucideAngularModule, 
  Briefcase, 
  LayoutDashboard, 
  Users,
  LogOut,
  Settings,
  Menu,
  X,
  Shield,
  Clock,
  Lock,
  RefreshCw,
  Key,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';
import { AdminService, SettingDto } from '../../../services/admin.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, FormsModule],
  templateUrl: './settings.component.html',
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
export class AdminSettingsComponent implements OnInit {

  constructor(
    private authService: AuthService, 
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.getToken()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadSettings();
  }

  // Icons
  readonly Briefcase = Briefcase;
  readonly LayoutDashboard = LayoutDashboard;
  readonly Users = Users;
  readonly LogOut = LogOut;
  readonly Settings = Settings;
  readonly Menu = Menu;
  readonly X = X;
  readonly Shield = Shield;
  readonly Clock = Clock;
  readonly Lock = Lock;
  readonly RefreshCw = RefreshCw;
  readonly Key = Key;
  readonly Save = Save;
  readonly CheckCircle = CheckCircle;
  readonly AlertCircle = AlertCircle;

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
    { icon: Briefcase, label: 'Manage Jobs', route: '/admin-dashboard/jobs', active: false },
    { icon: Settings, label: 'Settings', route: '/admin-dashboard/settings', active: true },
  ];

  // Settings state
  settings = signal<SettingDto[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  saveSuccess = signal(false);
  saveError = signal('');

  // Editable settings map (key -> value)
  editableSettings: { [key: string]: string } = {};

  loadSettings() {
    this.isLoading.set(true);
    this.adminService.getSettings().subscribe({
      next: (response) => {
        const data = response.data || response || [];
        this.settings.set(data);
        // Initialize editable values
        data.forEach((s: SettingDto) => {
          this.editableSettings[s.key] = s.value;
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load settings', err);
        this.isLoading.set(false);
      }
    });
  }

  getSettingLabel(key: string): string {
    const labels: { [key: string]: string } = {
      'access_token_expiry_minutes': 'Access Token Expiry (minutes)',
      'refresh_token_expiry_days': 'Refresh Token Expiry (days)',
      'max_login_attempts': 'Max Login Attempts',
      'lockout_duration_minutes': 'Lockout Duration (minutes)',
      'require_email_verification': 'Require Email Verification',
      'maintenance_mode': 'Maintenance Mode'
    };
    return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getSettingIcon(key: string) {
    if (key.includes('token') || key.includes('expiry')) return this.Clock;
    if (key.includes('login') || key.includes('lockout')) return this.Lock;
    if (key.includes('verification')) return this.CheckCircle;
    return this.Settings;
  }

  isBoolean(setting: SettingDto): boolean {
    return setting.type === 'BOOLEAN';
  }

  toggleBooleanSetting(key: string) {
    const current = this.editableSettings[key];
    this.editableSettings[key] = current === 'true' ? 'false' : 'true';
  }

  saveSettings() {
    this.isSaving.set(true);
    this.saveSuccess.set(false);
    this.saveError.set('');

    const updatedSettings: SettingDto[] = this.settings().map(s => ({
      ...s,
      value: this.editableSettings[s.key]
    }));

    this.adminService.updateSettings(updatedSettings).subscribe({
      next: (response) => {
        this.isSaving.set(false);
        this.saveSuccess.set(true);
        // Update local settings
        const data = response.data || response || [];
        this.settings.set(data);
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: (err) => {
        console.error('Failed to save settings', err);
        this.isSaving.set(false);
        this.saveError.set('Failed to save settings. Please try again.');
        setTimeout(() => this.saveError.set(''), 5000);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
