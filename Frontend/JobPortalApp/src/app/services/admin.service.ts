import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  totalUsers: number;
  totalJobSeekers: number;
  totalEmployers: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
}

export interface UserListItem {
  id: string;
  email: string;
  role: string;
  verified: boolean;
  createdAt: string;
  fullName?: string;
  companyName?: string;
}

export interface JobListItem {
  id: string;
  title: string;
  company: string;
  location: string;
  status: string;
  createdAt: string;
  applicationsCount: number;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface SettingDto {
  key: string;
  value: string;
  description: string;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard/stats`);
  }

  getAllUsers(page: number = 0, size: number = 10, role?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (role) {
      params = params.set('role', role);
    }
    
    return this.http.get<any>(`${this.apiUrl}/users`, { params });
  }

  getUserById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/${id}`);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/users/${id}`);
  }

  toggleUserVerification(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${id}/toggle-verification`, {});
  }

  getAllJobs(page: number = 0, size: number = 10, status?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (status) {
      params = params.set('status', status);
    }
    
    return this.http.get<any>(`${this.apiUrl}/jobs`, { params });
  }

  deleteJob(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/jobs/${id}`);
  }

  // Settings API methods
  getSettings(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/settings`);
  }

  updateSetting(key: string, value: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/settings/${key}`, { value });
  }

  updateSettings(settings: SettingDto[]): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/settings`, settings);
  }

  initializeSettings(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/settings/initialize`, {});
  }
}

