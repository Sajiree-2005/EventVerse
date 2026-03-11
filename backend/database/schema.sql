-- ============================================================
-- EventVerse Database Schema
-- Run this file to set up the database before starting Flask
-- ============================================================

-- Create and use the database
CREATE DATABASE IF NOT EXISTS eventverse_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE eventverse_db;

-- ============================================================
-- TABLE: events
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
    event_id             INT AUTO_INCREMENT PRIMARY KEY,
    event_name           VARCHAR(255)   NOT NULL,
    event_description    TEXT           NOT NULL,
    event_date           DATETIME       NOT NULL,
    event_venue          VARCHAR(255)   NOT NULL,
    event_category       VARCHAR(100)   NOT NULL,
    max_participants     INT            NOT NULL DEFAULT 50,
    poster_url           VARCHAR(512)   DEFAULT '',
    registration_deadline DATETIME     NOT NULL,
    created_at           DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_event_category (event_category),
    INDEX idx_event_date     (event_date)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: students
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
    student_id    INT AUTO_INCREMENT PRIMARY KEY,
    student_name  VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL UNIQUE,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_student_email (student_email)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: registrations
-- ============================================================
CREATE TABLE IF NOT EXISTS registrations (
    registration_id   INT AUTO_INCREMENT PRIMARY KEY,
    student_id        INT      NOT NULL,
    event_id          INT      NOT NULL,
    registration_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Prevent duplicate registrations for the same event
    UNIQUE KEY uq_student_event (student_id, event_id),

    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id)   REFERENCES events(event_id)     ON DELETE CASCADE,

    INDEX idx_reg_event   (event_id),
    INDEX idx_reg_student (student_id)
) ENGINE=InnoDB;

-- ============================================================
-- SEED DATA: Sample Events (matches frontend SAMPLE_EVENTS)
-- ============================================================
INSERT INTO events
    (event_name, event_description, event_date, event_venue, event_category, max_participants, poster_url, registration_deadline)
VALUES
(
    'AI Workshop 2026',
    'Explore the latest trends in artificial intelligence with hands-on coding sessions and expert talks on machine learning, neural networks, and generative AI applications.',
    '2026-03-25 10:00:00',
    'Seminar Hall A',
    'Workshop',
    50,
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop',
    '2026-03-22 23:59:59'
),
(
    'Hackathon 2026',
    'A 36-hour coding marathon where teams compete to build innovative solutions. Prizes worth $5,000 for the top three teams. Open to all departments.',
    '2026-04-05 09:00:00',
    'Innovation Lab',
    'Hackathon',
    120,
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop',
    '2026-04-02 23:59:59'
),
(
    'Cultural Fest: Rhythm & Hues',
    'Annual cultural festival featuring music, dance, art exhibitions, and theatrical performances from students across all departments.',
    '2026-04-12 16:00:00',
    'Open Air Theatre',
    'Cultural',
    300,
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop',
    '2026-04-10 23:59:59'
),
(
    'Inter-College Basketball Tournament',
    'Compete against the best college teams in the region. Three-day tournament with knockout rounds and grand finale.',
    '2026-04-18 08:00:00',
    'Sports Complex',
    'Sports',
    80,
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=400&fit=crop',
    '2026-04-15 23:59:59'
),
(
    'Research Symposium',
    'Present your research papers and get feedback from industry experts and academic reviewers. Best paper awards in three categories.',
    '2026-03-30 09:30:00',
    'Conference Hall B',
    'Academic',
    60,
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop',
    '2026-03-28 23:59:59'
),
(
    'Web Development Bootcamp',
    'Intensive 2-day bootcamp covering React, Node.js, and cloud deployment. Build a full-stack project by the end of day two.',
    '2026-04-22 10:00:00',
    'Computer Lab 3',
    'Technology',
    40,
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop',
    '2026-04-20 23:59:59'
);

-- ============================================================
-- SEED DATA: Sample Students & Registrations (optional demo)
-- ============================================================
INSERT INTO students (student_name, student_email) VALUES
    ('Alice Johnson',  'alice@college.edu'),
    ('Bob Smith',      'bob@college.edu'),
    ('Carol Williams', 'carol@college.edu');

-- Alice is registered for events 1 and 2
INSERT INTO registrations (student_id, event_id) VALUES
    (1, 1),
    (1, 2),
    (2, 1),
    (3, 3);

-- ============================================================
-- VERIFY: Quick sanity check queries
-- ============================================================
-- SELECT * FROM events;
-- SELECT * FROM students;
-- SELECT * FROM registrations;
