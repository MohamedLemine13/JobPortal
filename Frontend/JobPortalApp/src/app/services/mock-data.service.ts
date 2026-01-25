import { Injectable, signal } from '@angular/core';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'employer' | 'jobseeker';
  avatar?: string;
  company?: string;
  title?: string;
  location?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  experience?: Experience[];
  education?: Education[];
  resume?: string;
}

export interface Experience {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

export interface Company {
  id: string;
  name: string;
  type: string;
  logo?: string;
  description: string;
  website?: string;
  location: string;
  employeeCount: string;
  founded?: string;
}

export interface Job {
  id: string;
  title: string;
  company: Company;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship';
  category: string;
  salaryMin: number;
  salaryMax: number;
  description: string;
  requirements: string;
  status: 'active' | 'closed' | 'draft';
  postedDate: Date;
  applicants: Application[];
  employerId: string;
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  user: User;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  appliedDate: Date;
  coverLetter?: string;
  resume?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  // Current logged in user
  private currentUser = signal<User | null>(null);

  // Mock Users
  private users = signal<User[]>([
    {
      id: 'emp-1',
      name: 'John Davis',
      email: 'john.davis@techcorp.com',
      role: 'employer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      company: 'TechCorp Inc.',
      title: 'HR Manager',
      location: 'San Francisco, CA',
      phone: '+1 (555) 123-4567'
    },
    {
      id: 'emp-2',
      name: 'Sarah Wilson',
      email: 'sarah@startupxyz.com',
      role: 'employer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      company: 'StartupXYZ',
      title: 'Founder & CEO',
      location: 'New York, NY',
      phone: '+1 (555) 987-6543'
    },
    {
      id: 'job-1',
      name: 'Alex Thompson',
      email: 'alex.thompson@email.com',
      role: 'jobseeker',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      title: 'Senior Frontend Developer',
      location: 'Los Angeles, CA',
      phone: '+1 (555) 456-7890',
      bio: 'Passionate frontend developer with 5+ years of experience in React and Angular. Love building beautiful, accessible user interfaces.',
      skills: ['JavaScript', 'TypeScript', 'React', 'Angular', 'CSS', 'Tailwind', 'Node.js'],
      experience: [
        {
          id: 'exp-1',
          company: 'Tech Solutions Inc.',
          title: 'Senior Frontend Developer',
          startDate: '2021-03',
          current: true,
          description: 'Lead frontend development for enterprise SaaS products.'
        },
        {
          id: 'exp-2',
          company: 'Digital Agency',
          title: 'Frontend Developer',
          startDate: '2018-06',
          endDate: '2021-02',
          current: false,
          description: 'Built responsive websites for various clients.'
        }
      ],
      education: [
        {
          id: 'edu-1',
          institution: 'UCLA',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startDate: '2014',
          endDate: '2018'
        }
      ]
    },
    {
      id: 'job-2',
      name: 'Emily Chen',
      email: 'emily.chen@email.com',
      role: 'jobseeker',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      title: 'UX/UI Designer',
      location: 'Seattle, WA',
      phone: '+1 (555) 321-0987',
      bio: 'Creative UX/UI designer with a passion for user-centered design. Experienced in Figma, Sketch, and Adobe Creative Suite.',
      skills: ['Figma', 'Sketch', 'Adobe XD', 'UI Design', 'UX Research', 'Prototyping', 'Wireframing'],
      experience: [
        {
          id: 'exp-3',
          company: 'Creative Studio',
          title: 'Lead UX Designer',
          startDate: '2020-01',
          current: true,
          description: 'Leading design team for mobile and web applications.'
        }
      ],
      education: [
        {
          id: 'edu-2',
          institution: 'RISD',
          degree: 'Master of Fine Arts',
          field: 'Graphic Design',
          startDate: '2016',
          endDate: '2018'
        }
      ]
    },
    {
      id: 'job-3',
      name: 'Michael Brown',
      email: 'michael.brown@email.com',
      role: 'jobseeker',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      title: 'Full Stack Developer',
      location: 'Austin, TX',
      phone: '+1 (555) 654-3210',
      bio: 'Full stack developer specializing in MEAN/MERN stack. Love solving complex problems and learning new technologies.',
      skills: ['JavaScript', 'Python', 'React', 'Node.js', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS'],
      experience: [
        {
          id: 'exp-4',
          company: 'Tech Startup',
          title: 'Full Stack Developer',
          startDate: '2019-08',
          current: true,
          description: 'Building scalable web applications from scratch.'
        }
      ],
      education: [
        {
          id: 'edu-3',
          institution: 'UT Austin',
          degree: 'Bachelor of Science',
          field: 'Software Engineering',
          startDate: '2015',
          endDate: '2019'
        }
      ]
    },
    {
      id: 'job-4',
      name: 'Jessica Martinez',
      email: 'jessica.m@email.com',
      role: 'jobseeker',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
      title: 'Product Manager',
      location: 'Chicago, IL',
      phone: '+1 (555) 789-0123',
      bio: 'Product manager with 7+ years of experience in tech. Passionate about building products that users love.',
      skills: ['Product Strategy', 'Agile', 'Scrum', 'User Research', 'Data Analysis', 'Roadmapping', 'Stakeholder Management'],
      experience: [
        {
          id: 'exp-5',
          company: 'BigTech Corp',
          title: 'Senior Product Manager',
          startDate: '2020-06',
          current: true,
          description: 'Managing product roadmap for B2B SaaS platform.'
        }
      ],
      education: [
        {
          id: 'edu-4',
          institution: 'Northwestern University',
          degree: 'MBA',
          field: 'Business Administration',
          startDate: '2013',
          endDate: '2015'
        }
      ]
    }
  ]);

  // Mock Companies
  private companies = signal<Company[]>([
    {
      id: 'comp-1',
      name: 'TechCorp Inc.',
      type: 'Technology',
      logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=TechCorp',
      description: 'TechCorp is a leading technology company specializing in cloud computing, AI, and enterprise software solutions. We help businesses transform digitally with cutting-edge technology and innovative solutions.',
      website: 'https://techcorp.example.com',
      location: 'San Francisco, CA',
      employeeCount: '500-1000',
      founded: '2010'
    },
    {
      id: 'comp-2',
      name: 'StartupXYZ',
      type: 'Startup',
      logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=StartupXYZ',
      description: 'StartupXYZ is a fast-growing startup focused on revolutionizing the fintech space with AI-powered solutions.',
      website: 'https://startupxyz.example.com',
      location: 'New York, NY',
      employeeCount: '50-100',
      founded: '2020'
    }
  ]);

  // Mock Jobs
  private jobs = signal<Job[]>([
    {
      id: 'job-post-1',
      title: 'Senior Frontend Developer',
      company: {
        id: 'comp-1',
        name: 'TechCorp Inc.',
        type: 'Technology',
        logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=TechCorp',
        description: 'Leading technology company',
        location: 'San Francisco, CA',
        employeeCount: '500-1000'
      },
      location: 'San Francisco, CA',
      type: 'Full-time',
      category: 'Engineering',
      salaryMin: 120000,
      salaryMax: 180000,
      description: `We are looking for a Senior Frontend Developer to join our team and help build the next generation of our web applications.

You will be working with a talented team of engineers to create beautiful, performant, and accessible user interfaces. This role offers the opportunity to work on cutting-edge technologies and make a significant impact on our products.

Key responsibilities include:
- Lead frontend development initiatives
- Mentor junior developers
- Collaborate with design and product teams
- Ensure code quality and best practices`,
      requirements: `- 5+ years of experience with modern JavaScript/TypeScript
- Strong proficiency in React or Angular
- Experience with state management (Redux, NgRx, etc.)
- Understanding of responsive design and accessibility
- Excellent problem-solving skills
- Strong communication and collaboration abilities
- Experience with testing frameworks (Jest, Cypress)
- Familiarity with CI/CD pipelines`,
      status: 'active',
      postedDate: new Date('2024-01-10'),
      applicants: [],
      employerId: 'emp-1'
    },
    {
      id: 'job-post-2',
      title: 'UX/UI Designer',
      company: {
        id: 'comp-1',
        name: 'TechCorp Inc.',
        type: 'Technology',
        logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=TechCorp',
        description: 'Leading technology company',
        location: 'San Francisco, CA',
        employeeCount: '500-1000'
      },
      location: 'Remote',
      type: 'Full-time',
      category: 'Design',
      salaryMin: 90000,
      salaryMax: 130000,
      description: `Join our design team to create exceptional user experiences for our enterprise products.

You'll work closely with product managers and engineers to design intuitive interfaces that delight our users. We value creativity, user empathy, and data-driven decision making.`,
      requirements: `- 3+ years of UX/UI design experience
- Proficiency in Figma or Sketch
- Strong portfolio demonstrating user-centered design
- Experience with design systems
- Understanding of accessibility standards
- Ability to conduct user research`,
      status: 'active',
      postedDate: new Date('2024-01-08'),
      applicants: [],
      employerId: 'emp-1'
    },
    {
      id: 'job-post-3',
      title: 'Full Stack Developer',
      company: {
        id: 'comp-2',
        name: 'StartupXYZ',
        type: 'Startup',
        logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=StartupXYZ',
        description: 'Fast-growing fintech startup',
        location: 'New York, NY',
        employeeCount: '50-100'
      },
      location: 'New York, NY',
      type: 'Full-time',
      category: 'Engineering',
      salaryMin: 100000,
      salaryMax: 150000,
      description: `We're looking for a Full Stack Developer to help us build our next-generation fintech platform. This is a high-impact role where you'll have the opportunity to shape the technical direction of our product.`,
      requirements: `- 4+ years of full stack development experience
- Proficiency in Node.js and React/Angular
- Experience with databases (PostgreSQL, MongoDB)
- Understanding of REST APIs and GraphQL
- Experience with cloud platforms (AWS, GCP)
- Knowledge of security best practices`,
      status: 'active',
      postedDate: new Date('2024-01-05'),
      applicants: [],
      employerId: 'emp-2'
    },
    {
      id: 'job-post-4',
      title: 'Product Manager',
      company: {
        id: 'comp-1',
        name: 'TechCorp Inc.',
        type: 'Technology',
        logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=TechCorp',
        description: 'Leading technology company',
        location: 'San Francisco, CA',
        employeeCount: '500-1000'
      },
      location: 'San Francisco, CA',
      type: 'Full-time',
      category: 'Product',
      salaryMin: 130000,
      salaryMax: 180000,
      description: `We're seeking an experienced Product Manager to drive the strategy and execution of our core platform products.`,
      requirements: `- 5+ years of product management experience
- Track record of shipping successful products
- Strong analytical and data-driven mindset
- Excellent communication skills
- Experience with Agile methodologies`,
      status: 'closed',
      postedDate: new Date('2023-12-15'),
      applicants: [],
      employerId: 'emp-1'
    }
  ]);

  // Applications
  private applications = signal<Application[]>([]);

  constructor() {
    // Initialize with some applications
    this.initializeApplications();
  }

  private initializeApplications() {
    const jobSeekers = this.users().filter(u => u.role === 'jobseeker');
    const jobs = this.jobs();

    const mockApplications: Application[] = [
      {
        id: 'app-1',
        jobId: 'job-post-1',
        userId: 'job-1',
        user: jobSeekers.find(u => u.id === 'job-1')!,
        status: 'pending',
        appliedDate: new Date('2024-01-12'),
        coverLetter: 'I am very excited to apply for this position...'
      },
      {
        id: 'app-2',
        jobId: 'job-post-1',
        userId: 'job-3',
        user: jobSeekers.find(u => u.id === 'job-3')!,
        status: 'reviewed',
        appliedDate: new Date('2024-01-11'),
        coverLetter: 'With my full stack experience, I believe I would be a great fit...'
      },
      {
        id: 'app-3',
        jobId: 'job-post-2',
        userId: 'job-2',
        user: jobSeekers.find(u => u.id === 'job-2')!,
        status: 'shortlisted',
        appliedDate: new Date('2024-01-10'),
        coverLetter: 'As a passionate UX designer, I am thrilled to apply...'
      },
      {
        id: 'app-4',
        jobId: 'job-post-3',
        userId: 'job-1',
        user: jobSeekers.find(u => u.id === 'job-1')!,
        status: 'pending',
        appliedDate: new Date('2024-01-08'),
        coverLetter: 'I am interested in transitioning to full stack development...'
      },
      {
        id: 'app-5',
        jobId: 'job-post-3',
        userId: 'job-3',
        user: jobSeekers.find(u => u.id === 'job-3')!,
        status: 'shortlisted',
        appliedDate: new Date('2024-01-07'),
        coverLetter: 'Full stack development is my passion...'
      },
      {
        id: 'app-6',
        jobId: 'job-post-4',
        userId: 'job-4',
        user: jobSeekers.find(u => u.id === 'job-4')!,
        status: 'hired',
        appliedDate: new Date('2023-12-20'),
        coverLetter: 'With my extensive PM experience...'
      }
    ];

    this.applications.set(mockApplications);

    // Update jobs with their applicants
    const updatedJobs = this.jobs().map(job => ({
      ...job,
      applicants: mockApplications.filter(app => app.jobId === job.id)
    }));
    this.jobs.set(updatedJobs);
  }

  // Auth methods
  login(email: string, password: string, role: 'employer' | 'jobseeker'): User | null {
    const user = this.users().find(u => u.email === email && u.role === role);
    if (user) {
      this.currentUser.set(user);
      return user;
    }
    return null;
  }

  loginAsEmployer(): User {
    const employer = this.users().find(u => u.id === 'emp-1')!;
    this.currentUser.set(employer);
    return employer;
  }

  loginAsJobSeeker(): User {
    const jobSeeker = this.users().find(u => u.id === 'job-1')!;
    this.currentUser.set(jobSeeker);
    return jobSeeker;
  }

  logout() {
    this.currentUser.set(null);
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }

  // User methods
  getUsers() {
    return this.users();
  }

  getUserById(id: string): User | undefined {
    return this.users().find(u => u.id === id);
  }

  getJobSeekers(): User[] {
    return this.users().filter(u => u.role === 'jobseeker');
  }

  getEmployers(): User[] {
    return this.users().filter(u => u.role === 'employer');
  }

  // Company methods
  getCompanies() {
    return this.companies();
  }

  getCompanyById(id: string): Company | undefined {
    return this.companies().find(c => c.id === id);
  }

  // Job methods
  getJobs() {
    return this.jobs();
  }

  getActiveJobs(): Job[] {
    return this.jobs().filter(j => j.status === 'active');
  }

  getJobById(id: string): Job | undefined {
    return this.jobs().find(j => j.id === id);
  }

  getJobsByEmployer(employerId: string): Job[] {
    return this.jobs().filter(j => j.employerId === employerId);
  }

  createJob(job: Omit<Job, 'id' | 'postedDate' | 'applicants'>): Job {
    const newJob: Job = {
      ...job,
      id: `job-post-${Date.now()}`,
      postedDate: new Date(),
      applicants: []
    };
    this.jobs.update(jobs => [...jobs, newJob]);
    return newJob;
  }

  updateJobStatus(jobId: string, status: 'active' | 'closed' | 'draft') {
    this.jobs.update(jobs => 
      jobs.map(j => j.id === jobId ? { ...j, status } : j)
    );
  }

  deleteJob(jobId: string) {
    this.jobs.update(jobs => jobs.filter(j => j.id !== jobId));
    this.applications.update(apps => apps.filter(a => a.jobId !== jobId));
  }

  // Application methods
  getApplications() {
    return this.applications();
  }

  getApplicationsByJob(jobId: string): Application[] {
    return this.applications().filter(a => a.jobId === jobId);
  }

  getApplicationsByUser(userId: string): Application[] {
    return this.applications().filter(a => a.userId === userId);
  }

  applyToJob(jobId: string, userId: string, coverLetter?: string): Application {
    const user = this.getUserById(userId)!;
    const newApplication: Application = {
      id: `app-${Date.now()}`,
      jobId,
      userId,
      user,
      status: 'pending',
      appliedDate: new Date(),
      coverLetter
    };
    
    this.applications.update(apps => [...apps, newApplication]);
    
    // Update job's applicants list
    this.jobs.update(jobs => 
      jobs.map(j => j.id === jobId 
        ? { ...j, applicants: [...j.applicants, newApplication] } 
        : j
      )
    );
    
    return newApplication;
  }

  updateApplicationStatus(applicationId: string, status: Application['status']) {
    this.applications.update(apps =>
      apps.map(a => a.id === applicationId ? { ...a, status } : a)
    );
    
    // Also update in jobs
    this.jobs.update(jobs =>
      jobs.map(j => ({
        ...j,
        applicants: j.applicants.map(a => 
          a.id === applicationId ? { ...a, status } : a
        )
      }))
    );
  }

  // Search and filter
  searchJobs(query: string): Job[] {
    const lowerQuery = query.toLowerCase();
    return this.getActiveJobs().filter(job =>
      job.title.toLowerCase().includes(lowerQuery) ||
      job.company.name.toLowerCase().includes(lowerQuery) ||
      job.location.toLowerCase().includes(lowerQuery) ||
      job.category.toLowerCase().includes(lowerQuery)
    );
  }

  filterJobs(filters: {
    category?: string;
    type?: string;
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
  }): Job[] {
    return this.getActiveJobs().filter(job => {
      if (filters.category && job.category !== filters.category) return false;
      if (filters.type && job.type !== filters.type) return false;
      if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.salaryMin && job.salaryMax < filters.salaryMin) return false;
      if (filters.salaryMax && job.salaryMin > filters.salaryMax) return false;
      return true;
    });
  }

  // Stats for dashboard
  getEmployerStats(employerId: string) {
    const jobs = this.getJobsByEmployer(employerId);
    const activeJobs = jobs.filter(j => j.status === 'active').length;
    const totalApplications = jobs.reduce((sum, j) => sum + j.applicants.length, 0);
    const pendingApplications = jobs.reduce(
      (sum, j) => sum + j.applicants.filter(a => a.status === 'pending').length, 
      0
    );
    const shortlistedCandidates = jobs.reduce(
      (sum, j) => sum + j.applicants.filter(a => a.status === 'shortlisted').length, 
      0
    );

    return {
      activeJobs,
      totalApplications,
      pendingApplications,
      shortlistedCandidates
    };
  }

  getJobSeekerStats(userId: string) {
    const applications = this.getApplicationsByUser(userId);
    return {
      totalApplications: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      reviewed: applications.filter(a => a.status === 'reviewed').length,
      shortlisted: applications.filter(a => a.status === 'shortlisted').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
      hired: applications.filter(a => a.status === 'hired').length
    };
  }
}
