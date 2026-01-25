import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, switchMap, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}`;
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, request).pipe(
      tap((response: any) => {
        console.log('Register Response:', response);
        const token = response.data?.accessToken || response.accessToken;
        localStorage.setItem('access_token', token);
        // After register, we should also fetch profile
        this.fetchProfile().subscribe();
      })
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, request).pipe(
      tap((response: any) => {
        console.log('Login Response:', response);
        const token = response.data?.accessToken || response.accessToken;
        localStorage.setItem('access_token', token);
        this.fetchProfile().subscribe();
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
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
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}
