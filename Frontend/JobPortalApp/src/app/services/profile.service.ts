import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UpdateEmployerProfileRequest {
  fullName?: string;
  companyName?: string;
  companyType?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  location?: string;
  description?: string;
  foundedYear?: number;
}

export interface UpdateJobSeekerProfileRequest {
  fullName?: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/profile`;
  private baseUrl = environment.apiUrl.replace('/api', '');

  /**
   * Get full URL for a file path (avatar, CV, etc.)
   * Handles both relative paths (/uploads/...) and full URLs
   */
  getFileUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    // For relative paths like /uploads/...
    return `${this.baseUrl}${path}`;
  }

  /**
   * Get URL to view a file in browser (for PDFs)
   */
  getViewUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    return `${this.baseUrl}/api/files/view?path=${encodeURIComponent(path)}`;
  }

  /**
   * Get URL to download a file
   */
  getDownloadUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    return `${this.baseUrl}/api/files/download?path=${encodeURIComponent(path)}`;
  }

  constructor(private http: HttpClient) {}

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`);
  }

  updateEmployerProfile(request: UpdateEmployerProfileRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/me/employer`, request);
  }

  updateJobSeekerProfile(request: UpdateJobSeekerProfileRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/me/job-seeker`, request);
  }

  uploadAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post<any>(`${this.apiUrl}/me/avatar`, formData);
  }

  uploadCv(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('cv', file);
    return this.http.post<any>(`${this.apiUrl}/me/cv`, formData);
  }

  deleteCv(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/me/cv`);
  }

  changePassword(request: ChangePasswordRequest): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/change-password`, request);
  }
}
