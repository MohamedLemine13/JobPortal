import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Job, CreateJobRequest, JobListResponse } from '../models/job.models';

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

  getEmployerJobs(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/employer/my-jobs`);
  }
}
