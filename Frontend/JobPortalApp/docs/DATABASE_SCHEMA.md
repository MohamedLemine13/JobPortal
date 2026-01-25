# Job Portal Database Schema

## Entity Relationship Diagram (Text)

```
┌─────────────────┐       ┌─────────────────────┐       ┌─────────────────┐
│     USERS       │       │  JOB_SEEKER_PROFILE │       │ EMPLOYER_PROFILE│
├─────────────────┤       ├─────────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)             │       │ id (PK)         │
│ email           │  │    │ user_id (FK) ───────│───────│ user_id (FK)    │
│ password_hash   │  │    │ full_name           │       │ full_name       │
│ role            │  └────│ avatar_url          │       │ avatar_url      │
│ is_verified     │       │ phone               │       │ company_name    │
│ created_at      │       │ location            │       │ company_logo    │
│ updated_at      │       │ bio                 │       │ company_type    │
│ last_login_at   │       │ skills (JSON)       │       │ industry        │
└─────────────────┘       │ experience          │       │ company_size    │
         │                │ cv_file_name        │       │ website         │
         │                │ cv_file_url         │       │ location        │
         │                │ cv_file_size        │       │ description     │
         │                │ cv_uploaded_at      │       │ founded_year    │
         │                │ created_at          │       │ created_at      │
         │                │ updated_at          │       │ updated_at      │
         │                └─────────────────────┘       └─────────────────┘
         │                                                      │
         │                                                      │
         ▼                                                      ▼
┌─────────────────┐                                    ┌─────────────────┐
│   SAVED_JOBS    │                                    │      JOBS       │
├─────────────────┤                                    ├─────────────────┤
│ id (PK)         │                                    │ id (PK)         │
│ user_id (FK) ───│────────────────────────────────────│ employer_id(FK) │
│ job_id (FK) ────│───────────────────────────────────▶│ title           │
│ saved_at        │                                    │ description     │
└─────────────────┘                                    │ requirements    │
                                                       │ location        │
┌─────────────────┐                                    │ type            │
│  APPLICATIONS   │                                    │ category        │
├─────────────────┤                                    │ salary_min      │
│ id (PK)         │                                    │ salary_max      │
│ job_id (FK) ────│───────────────────────────────────▶│ salary_currency │
│ applicant_id(FK)│                                    │ salary_period   │
│ status          │                                    │ experience_level│
│ cover_letter    │                                    │ skills (JSON)   │
│ cv_url          │                                    │ benefits (JSON) │
│ applied_at      │                                    │ status          │
│ reviewed_at     │                                    │ applicants_count│
│ notes           │                                    │ views_count     │
│ created_at      │                                    │ posted_at       │
│ updated_at      │                                    │ expires_at      │
└─────────────────┘                                    │ created_at      │
                                                       │ updated_at      │
                                                       └─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│  CONVERSATIONS  │       │    MESSAGES     │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◀──────│ conversation_id │
│ participant_1   │       │ id (PK)         │
│ participant_2   │       │ sender_id (FK)  │
│ job_id (FK)     │       │ content         │
│ application_id  │       │ is_read         │
│ last_message_at │       │ sent_at         │
│ created_at      │       └─────────────────┘
└─────────────────┘
```

---

## SQL Schema (PostgreSQL)

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('job_seeker', 'employer')),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### Job Seeker Profile Table
```sql
CREATE TABLE job_seeker_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    location VARCHAR(255),
    bio TEXT,
    skills JSONB DEFAULT '[]',
    experience VARCHAR(50),
    cv_file_name VARCHAR(255),
    cv_file_url VARCHAR(500),
    cv_file_size INTEGER,
    cv_uploaded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_job_seeker_profiles_user_id ON job_seeker_profiles(user_id);
CREATE INDEX idx_job_seeker_profiles_skills ON job_seeker_profiles USING GIN(skills);
```

### Employer Profile Table
```sql
CREATE TABLE employer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    company_name VARCHAR(255) NOT NULL,
    company_logo VARCHAR(500),
    company_type VARCHAR(100),
    industry VARCHAR(100),
    company_size VARCHAR(50),
    website VARCHAR(500),
    location VARCHAR(255),
    description TEXT,
    founded_year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_employer_profiles_user_id ON employer_profiles(user_id);
CREATE INDEX idx_employer_profiles_company_name ON employer_profiles(company_name);
```

### Jobs Table
```sql
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements JSONB DEFAULT '[]',
    location VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('full-time', 'part-time', 'contract', 'internship', 'remote')),
    category VARCHAR(100) NOT NULL,
    salary_min DECIMAL(12, 2),
    salary_max DECIMAL(12, 2),
    salary_currency VARCHAR(3) DEFAULT 'USD',
    salary_period VARCHAR(20) DEFAULT 'yearly' CHECK (salary_period IN ('hourly', 'monthly', 'yearly')),
    experience_level VARCHAR(20) CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead')),
    skills JSONB DEFAULT '[]',
    benefits JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'closed')),
    applicants_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    posted_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_type ON jobs(type);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_posted_at ON jobs(posted_at DESC);
CREATE INDEX idx_jobs_skills ON jobs USING GIN(skills);
CREATE INDEX idx_jobs_search ON jobs USING GIN(to_tsvector('english', title || ' ' || description));
```

### Applications Table
```sql
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'interview', 'hired', 'rejected')),
    cover_letter TEXT,
    cv_url VARCHAR(500) NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_id, applicant_id)
);

CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_applied_at ON applications(applied_at DESC);
```

### Saved Jobs Table
```sql
CREATE TABLE saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, job_id)
);

CREATE INDEX idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX idx_saved_jobs_job_id ON saved_jobs(job_id);
```

### Conversations Table
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_1 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant_2 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(participant_1, participant_2, job_id)
);

CREATE INDEX idx_conversations_participant_1 ON conversations(participant_1);
CREATE INDEX idx_conversations_participant_2 ON conversations(participant_2);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);
```

### Messages Table
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at DESC);
CREATE INDEX idx_messages_unread ON messages(conversation_id, is_read) WHERE is_read = FALSE;
```

### Refresh Tokens Table (for JWT)
```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
```

---

## Triggers

### Auto-update `updated_at` timestamp
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_seeker_profiles_updated_at BEFORE UPDATE ON job_seeker_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employer_profiles_updated_at BEFORE UPDATE ON employer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Auto-increment applicants_count on new application
```sql
CREATE OR REPLACE FUNCTION increment_applicants_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE jobs SET applicants_count = applicants_count + 1 WHERE id = NEW.job_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER increment_job_applicants AFTER INSERT ON applications
    FOR EACH ROW EXECUTE FUNCTION increment_applicants_count();
```

### Auto-decrement applicants_count on application delete
```sql
CREATE OR REPLACE FUNCTION decrement_applicants_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE jobs SET applicants_count = applicants_count - 1 WHERE id = OLD.job_id;
    RETURN OLD;
END;
$$ language 'plpgsql';

CREATE TRIGGER decrement_job_applicants AFTER DELETE ON applications
    FOR EACH ROW EXECUTE FUNCTION decrement_applicants_count();
```

---

## Sample Data

```sql
-- Insert sample employer
INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('e1000000-0000-0000-0000-000000000001', 'employer@techcorp.com', '$2b$10$...', 'employer', true);

INSERT INTO employer_profiles (user_id, full_name, company_name, company_type, industry, company_size, location, description) VALUES
('e1000000-0000-0000-0000-000000000001', 'John Davis', 'TechCorp Inc.', 'Enterprise', 'Technology', '51-200', 'San Francisco, CA', 'Leading tech company...');

-- Insert sample job seeker
INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('j1000000-0000-0000-0000-000000000001', 'jobseeker@email.com', '$2b$10$...', 'job_seeker', true);

INSERT INTO job_seeker_profiles (user_id, full_name, location, bio, skills) VALUES
('j1000000-0000-0000-0000-000000000001', 'Mary Johnson', 'New York, NY', 'Experienced developer...', '["JavaScript", "Angular", "Node.js"]');

-- Insert sample job
INSERT INTO jobs (id, employer_id, title, description, requirements, location, type, category, salary_min, salary_max, experience_level, skills, status, posted_at) VALUES
('job00000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'Senior Software Engineer', 'We are looking for...', '["5+ years experience", "Strong JS skills"]', 'San Francisco, CA', 'full-time', 'IT & Software', 120000, 180000, 'senior', '["JavaScript", "Angular", "Node.js"]', 'active', CURRENT_TIMESTAMP);
```

---

## Indexes Summary

| Table | Index | Purpose |
|-------|-------|---------|
| users | email | Fast login lookup |
| jobs | employer_id | Employer's jobs |
| jobs | status, type, category | Filtering |
| jobs | posted_at DESC | Sorting by date |
| jobs | GIN(skills) | Skills search |
| jobs | GIN(tsvector) | Full-text search |
| applications | job_id, applicant_id | Unique constraint |
| applications | status | Status filtering |
| messages | conversation_id | Message retrieval |
| messages | is_read | Unread count |
