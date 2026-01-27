import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SavedJobService {
  private apiUrl = `${environment.apiUrl}/saved-jobs`;

  constructor(private http: HttpClient) {}

  // Get all saved jobs for current user
  getSavedJobs(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Save a job
  saveJob(jobId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${jobId}`, {});
  }

  // Unsave a job
  unsaveJob(jobId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${jobId}`);
  }
}
