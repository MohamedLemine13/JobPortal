import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, of, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}`;
  private platformId = inject(PLATFORM_ID);
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, request).pipe(
      tap((response: any) => {
        console.log('Register Response:', response);
        const accessToken = response.data?.accessToken || response.accessToken;
        const refreshToken = response.data?.refreshToken || response.refreshToken;
        this.storeTokens(accessToken, refreshToken);
        // After register, we should also fetch profile
        this.fetchProfile().subscribe();
      })
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, request).pipe(
      tap((response: any) => {
        console.log('Login Response:', response);
        const accessToken = response.data?.accessToken || response.accessToken;
        const refreshToken = response.data?.refreshToken || response.refreshToken;
        this.storeTokens(accessToken, refreshToken);
        this.fetchProfile().subscribe();
      })
    );
  }

  private storeTokens(accessToken: string, refreshToken: string): void {
    if (!this.isBrowser()) return;
    if (accessToken) {
      localStorage.setItem('access_token', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  logout(): void {
    // Call backend logout to revoke refresh tokens
    this.http.post(`${this.apiUrl}/auth/logout`, {}).pipe(
      catchError(() => of(null)) // Ignore errors on logout
    ).subscribe();
    
    if (this.isBrowser()) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    if (!this.isBrowser()) return false;
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('refresh_token');
  }

  refreshAccessToken(): Observable<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<any>(`${this.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      tap((response: any) => {
        const newAccessToken = response.data?.accessToken || response.accessToken;
        if (newAccessToken && this.isBrowser()) {
          localStorage.setItem('access_token', newAccessToken);
        }
      }),
      map((response: any) => response.data?.accessToken || response.accessToken),
      catchError((error) => {
        // If refresh fails, logout the user
        this.logout();
        return throwError(() => error);
      })
    );
  }

  fetchProfile(): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/profile/me`).pipe(
      tap(response => console.log('Fetch Profile Response:', response)),
      map(response => {
        // Ensure response.data exists
        if (!response.data) {
            console.error('No data in profile response');
            throw new Error('No data in profile response');
        }
        
        const user = response.data.user;
        const profile = response.data.profile;
        
        console.log('User:', user);
        console.log('Profile:', profile);

        const userData: User = {
          id: user.id,
          email: user.email,
          fullName: profile?.fullName || profile?.companyName || 'User',
          role: user.role
        };
        console.log('Mapped UserData:', userData);
        this.setUser(userData);
        return userData;
      })
    );
  }

  private setUser(user: User): void {
    if (this.isBrowser()) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
  }

  private getUserFromStorage(): User | null {
    if (!this.isBrowser()) return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

