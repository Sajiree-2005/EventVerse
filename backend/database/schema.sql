-- ============================================================
-- EventVerse Database Schema — Final
-- Compatible with MySQL 5.7 and 8.x
-- Safe to run on a fresh OR existing database (no data loss)
-- ============================================================

CREATE DATABASE IF NOT EXISTS eventverse_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE eventverse_db;

-- ============================================================
-- Drop and recreate all tables cleanly
-- (comment out DROP lines if you want to keep existing data)
-- ============================================================
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS email_log;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS volunteering;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS events;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- TABLE: events
-- ============================================================
CREATE TABLE events (
    event_id              INT AUTO_INCREMENT PRIMARY KEY,
    event_name            VARCHAR(255)  NOT NULL,
    event_description     TEXT          NOT NULL,
    event_date            DATETIME      NOT NULL,
    event_venue           VARCHAR(255)  NOT NULL,
    event_category        VARCHAR(100)  NOT NULL,
    max_participants      INT           NOT NULL DEFAULT 50,
    poster_url            VARCHAR(512)  DEFAULT '',
    registration_deadline DATETIME      NOT NULL,
    volunteering_enabled  TINYINT(1)    NOT NULL DEFAULT 0,
    volunteer_slots       INT           NOT NULL DEFAULT 0,
    created_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_event_category (event_category),
    INDEX idx_event_date     (event_date)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: students
-- ============================================================
CREATE TABLE students (
    student_id    INT AUTO_INCREMENT PRIMARY KEY,
    student_name  VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL UNIQUE,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_student_email (student_email)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: registrations
-- ============================================================
CREATE TABLE registrations (
    registration_id   INT AUTO_INCREMENT PRIMARY KEY,
    student_id        INT         NOT NULL,
    event_id          INT         NOT NULL,
    registration_type VARCHAR(20) NOT NULL DEFAULT 'individual',
    attended          TINYINT(1)  NOT NULL DEFAULT 0,
    registration_date DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_student_event (student_id, event_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id)   REFERENCES events(event_id)     ON DELETE CASCADE,
    INDEX idx_reg_event   (event_id),
    INDEX idx_reg_student (student_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: teams
-- ============================================================
CREATE TABLE teams (
    team_id      INT AUTO_INCREMENT PRIMARY KEY,
    event_id     INT          NOT NULL,
    team_name    VARCHAR(255) NOT NULL,
    team_lead_id INT          NOT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_team_event_lead (event_id, team_lead_id),
    FOREIGN KEY (event_id)     REFERENCES events(event_id)     ON DELETE CASCADE,
    FOREIGN KEY (team_lead_id) REFERENCES students(student_id) ON DELETE CASCADE,
    INDEX idx_team_event (event_id),
    INDEX idx_team_lead  (team_lead_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: team_members
-- ============================================================
CREATE TABLE team_members (
    team_member_id INT AUTO_INCREMENT PRIMARY KEY,
    team_id        INT NOT NULL,
    student_id     INT NOT NULL,
    joined_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_team_student (team_id, student_id),
    FOREIGN KEY (team_id)    REFERENCES teams(team_id)       ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    INDEX idx_member_team    (team_id),
    INDEX idx_member_student (student_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: volunteering  (status stored as VARCHAR — no ENUM)
-- ============================================================
CREATE TABLE volunteering (
    volunteer_id  INT AUTO_INCREMENT PRIMARY KEY,
    student_id    INT         NOT NULL,
    event_id      INT         NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'pending',
    registered_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_volunteer_student_event (student_id, event_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id)   REFERENCES events(event_id)     ON DELETE CASCADE,
    INDEX idx_vol_event   (event_id),
    INDEX idx_vol_student (student_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: feedback
-- ============================================================
CREATE TABLE feedback (
    feedback_id  INT AUTO_INCREMENT PRIMARY KEY,
    student_id   INT      NOT NULL,
    event_id     INT      NOT NULL,
    rating       TINYINT  NOT NULL,
    comments     TEXT,
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_feedback_student_event (student_id, event_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id)   REFERENCES events(event_id)     ON DELETE CASCADE,
    INDEX idx_feedback_event   (event_id),
    INDEX idx_feedback_student (student_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id      INT          NOT NULL,
    event_id        INT,
    type            VARCHAR(50)  NOT NULL,
    title           VARCHAR(255) NOT NULL,
    message         TEXT         NOT NULL,
    is_read         TINYINT(1)   NOT NULL DEFAULT 0,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id)   REFERENCES events(event_id)     ON DELETE SET NULL,
    INDEX idx_notif_student (student_id),
    INDEX idx_notif_event   (event_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: email_log
-- ============================================================
CREATE TABLE email_log (
    log_id     INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT         NOT NULL,
    event_id   INT,
    email_type VARCHAR(50) NOT NULL,
    sent_at    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status     VARCHAR(10) NOT NULL DEFAULT 'sent',
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    INDEX idx_email_student (student_id),
    INDEX idx_email_event   (event_id)
) ENGINE=InnoDB;

-- ============================================================
-- SEED: Events
-- ============================================================
INSERT INTO events
    (event_id, event_name, event_description, event_date, event_venue,
     event_category, max_participants, poster_url, registration_deadline,
     volunteering_enabled, volunteer_slots)
VALUES
(1, 'AI Workshop 2026',
 'Explore the latest trends in artificial intelligence with hands-on coding sessions and expert talks on machine learning, neural networks, and generative AI applications.',
 '2026-04-25 10:00:00', 'Seminar Hall A', 'Workshop', 50,
 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop',
 '2026-04-22 23:59:59', 1, 10),

(2, 'Hackathon 2026',
 'A 36-hour coding marathon where teams compete to build innovative solutions. Prizes worth $5,000 for the top three teams. Open to all departments.',
 '2026-05-05 09:00:00', 'Innovation Lab', 'Hackathon', 120,
 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop',
 '2026-05-02 23:59:59', 1, 20),

(3, 'Cultural Fest: Rhythm & Hues',
 'Annual cultural festival featuring music, dance, art exhibitions, and theatrical performances from students across all departments.',
 '2026-05-12 16:00:00', 'Open Air Theatre', 'Cultural', 300,
 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop',
 '2026-05-10 23:59:59', 1, 30),

(4, 'Inter-College Basketball Tournament',
 'Compete against the best college teams in the region. Three-day tournament with knockout rounds and grand finale.',
 '2026-05-18 08:00:00', 'Sports Complex', 'Sports', 80,
 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=400&fit=crop',
 '2026-05-15 23:59:59', 0, 0),

(5, 'Research Symposium',
 'Present your research papers and get feedback from industry experts and academic reviewers. Best paper awards in three categories.',
 '2026-04-30 09:30:00', 'Conference Hall B', 'Academic', 60,
 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop',
 '2026-04-28 23:59:59', 0, 0),

(6, 'Web Development Bootcamp',
 'Intensive 2-day bootcamp covering React, Node.js, and cloud deployment. Build a full-stack project by the end of day two.',
 '2026-05-22 10:00:00', 'Computer Lab 3', 'Technology', 40,
 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop',
 '2026-05-20 23:59:59', 1, 8);
