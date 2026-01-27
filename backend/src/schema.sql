-- Keep it simple, three main tables

CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    position_title VARCHAR(255) NOT NULL,
    job_url TEXT,
    date_applied DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'applied',
    salary_min INTEGER,
    salary_max INTEGER,
    location VARCHAR(255),
    job_description TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE interviews (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
    interview_date DATE,
    round_type VARCHAR(50),
    interviewer_name VARCHAR(255),
    questions_asked TEXT,
    my_answers TEXT,
    outcome VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    skill_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_date ON applications(date_applied);
CREATE INDEX idx_interviews_app_id ON interviews(application_id);
CREATE INDEX idx_skills_app_id ON skills(application_id);
