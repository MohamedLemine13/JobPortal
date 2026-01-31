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
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';
import { AdminService } from '../../../services/admin.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, FormsModule],
  templateUrl: './manage-users.component.html',
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
export class ManageUsersComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router,
    private adminService: AdminService
  ) { }

  ngOnInit(): void {
    if (!this.authService.getToken()) {
      this.router.navigate(['/login']);
      return;
    }
    this.fetchUsers();
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
  readonly Search = Search;
  readonly Trash2 = Trash2;
  readonly CheckCircle = CheckCircle;
  readonly XCircle = XCircle;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly AlertTriangle = AlertTriangle;


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
    { icon: Users, label: 'Manage Users', route: '/admin-dashboard/users', active: true },
    { icon: Briefcase, label: 'Manage Jobs', route: '/admin-dashboard/jobs', active: false },
    { icon: Settings, label: 'Settings', route: '/admin-dashboard/settings', active: false },
  ];

  // Users data
  users = signal<any[]>([]);
  isLoading = signal(false);
  searchQuery = signal('');
  roleFilter = signal('');

  // Pagination
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  pageSize = 10;

  // Delete confirmation modal
  showDeleteModal = signal(false);
  userToDelete = signal<any>(null);

  fetchUsers() {
    this.isLoading.set(true);
    const role = this.roleFilter() || undefined;

    this.adminService.getAllUsers(this.currentPage(), this.pageSize, role).subscribe({
      next: (response: any) => {
        console.log('Users response:', response);
        const data = response.data || response;
        const usersList = data.content || [];

        this.users.set(usersList.map((u: any) => ({
          id: u.id,
          email: u.email,
          name: u.fullName || u.companyName || u.email,
          role: u.role,
          verified: u.verified ?? u.isVerified,
          createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A',
          initials: (u.fullName || u.companyName || u.email).charAt(0).toUpperCase()
        })));

        this.totalPages.set(data.totalPages || 1);
        this.totalElements.set(data.totalElements || usersList.length);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch users', err);
        this.isLoading.set(false);
      }
    });
  }

  filterByRole(role: string) {
    this.roleFilter.set(role);
    this.currentPage.set(0);
    this.fetchUsers();
  }

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(p => p + 1);
      this.fetchUsers();
    }
  }

  prevPage() {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
      this.fetchUsers();
    }
  }

  openDeleteModal(user: any) {
    this.userToDelete.set(user);
    this.showDeleteModal.set(true);
  }

  cancelDelete() {
    this.showDeleteModal.set(false);
    this.userToDelete.set(null);
  }

  confirmDelete() {
    const user = this.userToDelete();
    if (!user) return;

    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        // Immediately remove user from local array for instant UI update
        this.users.update(users => users.filter(u => u.id !== user.id));
        this.totalElements.update(t => t - 1);

        // Recalculate total pages
        const newTotalPages = Math.ceil(this.totalElements() / this.pageSize);
        this.totalPages.set(newTotalPages > 0 ? newTotalPages : 1);

        // If current page is now empty and not the first page, go to previous page
        if (this.users().length === 0 && this.currentPage() > 0) {
          this.currentPage.update(p => p - 1);
          this.fetchUsers();
        }

        this.showDeleteModal.set(false);
        this.userToDelete.set(null);
      },
      error: (err) => {
        console.error('Failed to delete user', err);
        this.showDeleteModal.set(false);
        this.userToDelete.set(null);
      }
    });
  }

  toggleVerification(userId: string) {
    this.adminService.toggleUserVerification(userId).subscribe({
      next: () => {
        this.fetchUsers();
      },
      error: (err) => console.error('Failed to toggle verification', err)
    });
  }



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

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

