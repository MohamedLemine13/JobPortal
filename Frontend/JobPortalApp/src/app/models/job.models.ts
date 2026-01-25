export interface Job {
  id: string;
  title: string;
  description: string;
  companyName: string;
  location: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  postedAt: string;
  requirements?: string[];
  skills?: string[];
}

export interface CreateJobRequest {
  title: string;
  description: string;
  location: string;
  type: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  category: string;
  requirements: string[];
  skills: string[];
}

export interface JobListResponse {
  content: Job[];
  totalPages: number;
  totalElements: number;
  last: boolean;
}

export interface EmployerJobsResponse {
    jobs: any[]; // Or strict type
    stats: {
        totalJobs: number;
        activeJobs: number;
        totalApplicants: number;
        hiredCount: number;
    };
    pagination: {
        page: number;
        limit: number;
        totalElements: number;
        totalPages: number;
    }
}
