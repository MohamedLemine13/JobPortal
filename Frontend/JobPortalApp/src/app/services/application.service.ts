import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApplicationRequest, ApplicationResponse } from '../models/application.models';

export interface UpdateApplicationStatusRequest {
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interview' | 'hired' | 'rejected';
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private apiUrl = `${environment.apiUrl}/applications`;

  constructor(private http: HttpClient) {}

  // Job Seeker: Apply for a job
  applyForJob(request: ApplicationRequest): Observable<ApplicationResponse> {
    return this.http.post<ApplicationResponse>(this.apiUrl, request);
  }

  // Job Seeker: Get my applications
  getMyApplications(status?: string, page: number = 1, limit: number = 20): Observable<any> {
    let url = `${this.apiUrl}/my-applications?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    return this.http.get<any>(url);
  }

  // Employer: Get all applications for employer's jobs
  getEmployerApplications(page: number = 1, limit: number = 20): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/employer?page=${page}&limit=${limit}`);
  }

  // Employer: Get applications for a specific job
  getJobApplications(jobId: string, status?: string, page: number = 1, limit: number = 20): Observable<any> {
    let url = `${this.apiUrl}/job/${jobId}?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    return this.http.get<any>(url);
  }

  // Employer: Update application status
  updateApplicationStatus(applicationId: string, request: UpdateApplicationStatusRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${applicationId}/status`, request);
  }

  // Upload CV (moved from profile)
  uploadCv(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('cv', file);
    return this.http.post(`${environment.apiUrl}/profile/me/cv`, formData);
  }
}
