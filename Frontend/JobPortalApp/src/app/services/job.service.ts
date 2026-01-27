import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Job, CreateJobRequest, JobListResponse } from '../models/job.models';

export interface UpdateJobRequest {
  title?: string;
  description?: string;
  requirements?: string[];
  location?: string;
  type?: string;
  category?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: string;
  experienceLevel?: string;
  skills?: string[];
  benefits?: string[];
  status?: string;
  expiresAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = `${environment.apiUrl}/jobs`;

  constructor(private http: HttpClient) {}

  getJobs(): Observable<any> {
    // Backend returns a plain List<Job> array, not paginated
    console.log('Calling GET', this.apiUrl);
    return this.http.get<any>(this.apiUrl).pipe(
        tap({
            next: (response) => console.log('Jobs API response:', response),
            error: (err) => console.error('JobService.getJobs failed', err)
        })
    );
  }

  getJob(id: string): Observable<Job> {
    return this.http.get<Job>(`${this.apiUrl}/${id}`);
  }

  createJob(job: CreateJobRequest): Observable<Job> {
    return this.http.post<Job>(this.apiUrl, job);
  }

  updateJob(id: string, request: UpdateJobRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, request);
  }

  deleteJob(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Convenience method to close a job (update status to closed)
  closeJob(id: string): Observable<any> {
    return this.updateJob(id, { status: 'closed' });
  }

  // Convenience method to activate a job (update status to active)
  activateJob(id: string): Observable<any> {
    return this.updateJob(id, { status: 'active' });
  }

  getEmployerJobs(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/employer/my-jobs`);
  }
}
