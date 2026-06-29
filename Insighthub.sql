-- =============================================================
--  InsightHub – Knowledge Base System (SQL Server Complete)
-- =============================================================

CREATE DATABASE insighthub;

USE insighthub;

--basic  tables

-- User  roles
CREATE TABLE roles (
    role_id INT IDENTITY(1,1) NOT NULL,
    role_name VARCHAR(20) NOT NULL,
    CONSTRAINT pk_roles PRIMARY KEY (role_id),
    CONSTRAINT uq_roles_name UNIQUE (role_name),
    CONSTRAINT ck_roles_name CHECK (role_name IN ('Admin', 'Author', 'Reader'))
);

--  categorization
CREATE TABLE categories (
    category_id INT IDENTITY(1,1) NOT NULL,
    category_name VARCHAR(30) NOT NULL,
    CONSTRAINT pk_categories PRIMARY KEY (category_id),
    CONSTRAINT uq_categories_name UNIQUE (category_name)
);

--   states
CREATE TABLE article_statuses (
    status_id INT IDENTITY(1,1) NOT NULL,
    status_name VARCHAR(10) NOT NULL,
    CONSTRAINT pk_article_statuses PRIMARY KEY (status_id),
    CONSTRAINT uq_article_statuses_name UNIQUE (status_name),
    CONSTRAINT ck_article_statuses_name CHECK (status_name IN ('pending', 'approved', 'rejected'))
);

-- CORE  TABLES
--  users  profiles
CREATE TABLE users (
    user_id BIGINT IDENTITY(1,1) NOT NULL,
    user_code VARCHAR(20) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(120) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    date_of_birth DATE NULL,
    gender VARCHAR(20) NULL,
    role_id INT NOT NULL,
    category_id INT NULL,
    bio VARCHAR(MAX) NULL,
    created_at DATETIME NOT NULL CONSTRAINT df_users_created DEFAULT GETDATE(),
    updated_at DATETIME NOT NULL CONSTRAINT df_users_updated DEFAULT GETDATE(),
    is_active BIT NOT NULL CONSTRAINT df_users_active DEFAULT 1,


    CONSTRAINT pk_users PRIMARY KEY (user_id),
    CONSTRAINT uq_users_code UNIQUE (user_code),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT fk_users_role
    FOREIGN KEY (role_id)
    REFERENCES roles(role_id)
    ON DELETE NO ACTION,

    CONSTRAINT fk_users_category
    FOREIGN KEY (category_id)
    REFERENCES categories(category_id)
    ON DELETE SET NULL,
    CONSTRAINT ck_users_gender CHECK (gender IN ('Male','Female','Other','Prefer not to say')),
    CONSTRAINT ck_users_email_format CHECK (email LIKE '%_@__%.__%'),
    CONSTRAINT ck_users_dob CHECK (date_of_birth IS NULL OR date_of_birth < CAST(GETDATE() AS DATE))
);


--  articles
CREATE TABLE articles (
    article_id BIGINT IDENTITY(1,1) NOT NULL,
    article_code VARCHAR(20) NOT NULL,
    author_id BIGINT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    subtitle VARCHAR(300) NOT NULL,
    intro VARCHAR(MAX) NOT NULL,
    content VARCHAR(MAX) NOT NULL,
    image_url VARCHAR(500) NULL,
    status_id INT NOT NULL,
    is_deleted BIT NOT NULL CONSTRAINT df_articles_deleted DEFAULT 0,
    views INT NOT NULL CONSTRAINT df_articles_views DEFAULT 0,
    created_at DATETIME NOT NULL CONSTRAINT df_articles_created DEFAULT GETDATE(),
    updated_at DATETIME NOT NULL CONSTRAINT df_articles_updated DEFAULT GETDATE(),
    review_date DATE NULL,

    CONSTRAINT pk_articles PRIMARY KEY (article_id),
    CONSTRAINT uq_articles_code UNIQUE (article_code),
    CONSTRAINT fk_articles_author
    FOREIGN KEY (author_id)
    REFERENCES users(user_id)
    ON DELETE NO ACTION,

    CONSTRAINT fk_articles_category
    FOREIGN KEY (category_id)
    REFERENCES categories(category_id)
    ON DELETE NO ACTION,

    CONSTRAINT fk_articles_status
    FOREIGN KEY (status_id)
    REFERENCES article_statuses(status_id)
    ON DELETE NO ACTION,
    CONSTRAINT ck_articles_title_len CHECK (LEN(TRIM(title)) > 0),
    CONSTRAINT ck_articles_views CHECK (views >= 0)
);

-- Admin verification logs
CREATE TABLE article_reviews (
    review_id BIGINT IDENTITY(1,1) NOT NULL,
    article_id BIGINT NOT NULL,
    reviewed_by BIGINT NOT NULL,
    action VARCHAR(10) NOT NULL,
    remark VARCHAR(MAX) NULL,
    reviewed_at DATETIME NOT NULL CONSTRAINT df_reviews_reviewed DEFAULT GETDATE(),
    CONSTRAINT pk_article_reviews PRIMARY KEY (review_id),
    CONSTRAINT ck_reviews_action CHECK (action IN ('approved', 'rejected')),
    CONSTRAINT fk_reviews_article
    FOREIGN KEY (article_id)
    REFERENCES articles(article_id)
    ON DELETE CASCADE,

    CONSTRAINT fk_reviews_admin
    FOREIGN KEY (reviewed_by)
    REFERENCES users(user_id)
    ON DELETE NO ACTION
);

-- Reader view counters
CREATE TABLE article_view_logs (
    log_id BIGINT IDENTITY(1,1) NOT NULL,
    article_id BIGINT NOT NULL,
    user_id BIGINT NULL,
    viewed_at DATETIME NOT NULL CONSTRAINT df_view_logs_viewed DEFAULT GETDATE(),
    ip_address VARCHAR(45) NULL,
    CONSTRAINT pk_view_logs PRIMARY KEY (log_id),
    CONSTRAINT fk_view_logs_article
    FOREIGN KEY (article_id)
    REFERENCES articles(article_id)
    ON DELETE CASCADE,

    CONSTRAINT fk_view_logs_user
    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE NO ACTION
    );

-- User active web sessions
CREATE TABLE login_sessions (
    session_id BIGINT IDENTITY(1,1) NOT NULL,
    user_id BIGINT NOT NULL,
    logged_in_at DATETIME NOT NULL
        CONSTRAINT df_sessions_in DEFAULT GETDATE(),
    logged_out_at DATETIME NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(500) NULL,

    CONSTRAINT pk_login_sessions PRIMARY KEY (session_id),

    CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);


-- INDEXES

CREATE INDEX idx_users_role ON users (role_id);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_category ON users (category_id);
CREATE INDEX idx_users_active ON users (is_active);

CREATE INDEX idx_articles_author ON articles (author_id);
CREATE INDEX idx_articles_category ON articles (category_id);
CREATE INDEX idx_articles_status ON articles (status_id);
CREATE INDEX idx_articles_deleted ON articles (is_deleted);
CREATE INDEX idx_articles_created ON articles (created_at DESC);
CREATE INDEX idx_articles_views ON articles (views DESC);
CREATE INDEX idx_articles_cat_status_del
ON articles (category_id, status_id, is_deleted);

CREATE INDEX idx_reviews_article ON article_reviews (article_id);
CREATE INDEX idx_reviews_admin ON article_reviews (reviewed_by);
CREATE INDEX idx_reviews_reviewed_at ON article_reviews (reviewed_at DESC);

CREATE INDEX idx_view_logs_article ON article_view_logs (article_id);
CREATE INDEX idx_view_logs_user ON article_view_logs (user_id);
CREATE INDEX idx_view_logs_date ON article_view_logs (viewed_at DESC);

CREATE INDEX idx_sessions_user ON login_sessions (user_id);
CREATE INDEX idx_sessions_date ON login_sessions (logged_in_at DESC);


 -- 5. APPLICATION VIEWS

-- Public feed for reader apps
CREATE OR ALTER VIEW vw_published_articles AS
SELECT a.article_id, a.article_code, a.title, a.subtitle, a.intro, a.image_url, a.views, a.created_at, a.review_date,
       c.category_name AS category, CONCAT(u.first_name, ' ', u.last_name) AS author_name, u.user_code AS author_code
FROM articles a
JOIN categories c ON c.category_id = a.category_id
JOIN users u ON u.user_id = a.author_id
JOIN article_statuses s ON s.status_id = a.status_id
WHERE s.status_name = 'approved' AND a.is_deleted = 0;


-- Authors profile layout view
CREATE OR ALTER VIEW vw_author_articles AS
SELECT a.article_id, a.article_code, a.author_id, a.title, a.subtitle, a.image_url, a.views,
       c.category_name AS category, s.status_name AS status, a.review_date, a.created_at, a.updated_at, a.is_deleted,
       (SELECT TOP 1 ar.remark FROM article_reviews ar WHERE ar.article_id = a.article_id ORDER BY ar.reviewed_at DESC) AS last_remark
FROM articles a
JOIN categories c ON c.category_id = a.category_id
JOIN article_statuses s ON s.status_id = a.status_id;


-- Admin dashboard workspace queue
CREATE OR ALTER VIEW vw_admin_review_queue AS
SELECT TOP 100 PERCENT a.article_id, a.article_code, a.title, a.subtitle, a.image_url, a.created_at, c.category_name AS category,
       CONCAT(u.first_name, ' ', u.last_name) AS author_name, u.user_code AS author_code
FROM articles a
JOIN categories c ON c.category_id = a.category_id
JOIN article_statuses s ON s.status_id = a.status_id
JOIN users u ON u.user_id = a.author_id
WHERE s.status_name = 'pending' AND a.is_deleted = 0
ORDER BY a.created_at ASC;


-- General analytical system overview
CREATE OR ALTER VIEW vw_article_stats AS
SELECT c.category_name, COUNT(a.article_id) AS total_articles,
       SUM(CASE WHEN s.status_name = 'approved' THEN 1 ELSE 0 END) AS approved_count,
       SUM(CASE WHEN s.status_name = 'pending' THEN 1 ELSE 0 END) AS pending_count,
       SUM(CASE WHEN s.status_name = 'rejected' THEN 1 ELSE 0 END) AS rejected_count,
       ISNULL(SUM(a.views), 0) AS total_views, ROUND(AVG(CAST(a.views AS DECIMAL(10,2))), 1) AS avg_views
FROM articles a
JOIN categories c ON c.category_id = a.category_id
JOIN article_statuses s ON s.status_id = a.status_id
WHERE a.is_deleted = 0
GROUP BY c.category_id, c.category_name;


-- Master structural view for users summary
CREATE OR ALTER VIEW vw_users_summary AS
SELECT u.user_id, u.user_code, CONCAT(u.first_name, ' ', u.last_name) AS full_name, u.email,
       r.role_name AS role, c.category_name AS category, u.created_at, u.is_active
FROM users u
JOIN roles r ON r.role_id = u.role_id
LEFT JOIN categories c ON c.category_id = u.category_id;


-- 6. SYSTEM SEED & DATA LOADS

INSERT INTO roles (role_name) VALUES ('Admin'), ('Author'), ('Reader');
INSERT INTO categories (category_name) VALUES ('technology'), ('business'), ('security'), ('design'), ('productivity');
INSERT INTO article_statuses (status_name) VALUES ('pending'), ('approved'), ('rejected');

INSERT INTO users (user_code, first_name, last_name, email, password_hash, date_of_birth, gender, role_id, category_id, bio, created_at)
VALUES
('SANJAY123', 'Sanjay', 'Sam Mathew', 'sanjay@gmail.com', 'HASH_PLACEHOLDER', '2005-07-20', 'Male', 1, 1, 'A technology enthusiast.', '2026-06-25 05:07:07'),
('PRIYA456', 'Priya', 'Natarajan', 'priya.natarajan@gmail.com', 'HASH_PLACEHOLDER', '1998-03-12', 'Female', 1, 5, 'Passionate about content.', '2026-06-25 08:15:22'),
('ARUN789', 'Arun', 'Kumar', 'arun.kumar@gmail.com', 'HASH_PLACEHOLDER', '1996-11-08', 'Male', 1, 3, 'Interested in startups.', '2026-06-25 10:42:15'),
('MEERA321', 'Meera', 'Krishnan', 'meera.krishnan@gmail.com', 'HASH_PLACEHOLDER', '1997-09-25', 'Female', 1, 4, 'Dedicated to education.', '2026-06-25 13:28:49'),
('RAHUL654', 'Rahul', 'Sharma', 'rahul.sharma@gmail.com', 'HASH_PLACEHOLDER', '1995-01-17', 'Male', 1, 2, 'Enjoys curating trends.', '2026-06-25 16:05:31'),
('HARISH01', 'Harish', 'Kumar', 'harish.kumar@gmail.com', 'HASH_PLACEHOLDER', '2000-04-16', 'Male', 3, NULL, 'Enthusiastic reader.', '2026-06-25 09:18:24'),
('NISHA02', 'Nisha', 'Reddy', 'nisha.reddy@gmail.com', 'HASH_PLACEHOLDER', '1999-09-08', 'Female', 3, NULL, 'Curious reader.', '2026-06-25 11:42:37'),
('AKASH03', 'Akash', 'Menon', 'akash.menon@gmail.com', 'HASH_PLACEHOLDER', '1998-12-21', 'Male', 3, NULL, 'Regular reader.', '2026-06-25 15:07:19'),
('KALAI123', 'Kalaivani','Ravi', 'kalai@gmail.com', 'HASH_PLACEHOLDER', '2008-12-02', 'Female', 3, NULL, 'Good reader.', '2026-06-29 09:30:18'),
('KAVIN01', 'Kavin', 'Raj', 'kavin.raj@gmail.com', 'HASH_PLACEHOLDER', '1998-03-15', 'Male', 2, 1, 'Web development writer.', '2026-06-25 08:20:14'),
('DIVYA02', 'Divya', 'Subramanian', 'divya.subramanian@gmail.com', 'HASH_PLACEHOLDER', '1997-07-11', 'Female', 2, 5, 'Creative content writer.', '2026-06-25 09:45:37'),
('PRAVEEN03', 'Praveen', 'Mohan', 'praveen.mohan@gmail.com', 'HASH_PLACEHOLDER', '1996-11-28', 'Male', 2, 2, 'Experienced business writer.', '2026-06-25 11:58:42'),
('SNEHA04', 'Sneha', 'Narayanan', 'sneha.narayanan@gmail.com', 'HASH_PLACEHOLDER', '1999-01-20', 'Female', 2, 5, 'Dedicated lifestyle writer.', '2026-06-25 14:10:55'),
('ARVIND05', 'Arvind', 'Suresh', 'arvind.suresh@gmail.com', 'HASH_PLACEHOLDER', '1995-05-09', 'Male', 2, 3, 'Expertise in cybersecurity.', '2026-06-25 16:32:18');

INSERT INTO articles (article_code, author_id, category_id, title, subtitle, intro, content, image_url, status_id, views, created_at)
VALUES
('ART1001', (SELECT user_id FROM users WHERE user_code = 'KAVIN01'), (SELECT category_id FROM categories WHERE category_name = 'technology'), 'Technology Insights 1', 'Practical guide to technology', 'Learn the fundamentals of technology.', 'Full article content goes here...', 'https://picsum.photos/seed/article1/800/300', (SELECT status_id FROM article_statuses WHERE status_name = 'pending'), 0, '2026-06-29 00:00:00'),
('ART1002', (SELECT user_id FROM users WHERE user_code = 'DIVYA02'), (SELECT category_id FROM categories WHERE category_name = 'productivity'), 'Productivity Insights 1', 'Practical guide to productivity', 'Boost your productivity.', 'Full article content goes here...', 'https://picsum.photos/seed/article2/800/300', (SELECT status_id FROM article_statuses WHERE status_name = 'approved'), 0, '2026-06-29 00:00:00');

-- 1. View all published (approved) articles
SELECT *
FROM vw_published_articles;

-- 2. View all author articles
SELECT *
FROM vw_author_articles;

-- 3. View pending articles for admin review
SELECT *
FROM vw_admin_review_queue
ORDER BY created_at ASC;

-- 4. View article statistics by category
SELECT *
FROM vw_article_stats
ORDER BY total_articles DESC;

-- 5. View users summary
SELECT *
FROM vw_users_summary;




--Questions
--1. Display all records (Articles)
SELECT * FROM articles;

--2. Display active records 
SELECT * FROM articles 
WHERE is_deleted = 0 AND status_id = (SELECT status_id FROM article_statuses WHERE status_name = 'approved');

--3. Display inactive records (Soft-Deleted or Inactive Users)
SELECT * FROM articles 
WHERE is_deleted = 1;

--4. Search by name ( Article Title)
--Finds articles where the title matches a search term (e.g., searching for 'Technology').


SELECT * FROM vw_published_articles 
WHERE title LIKE '%Technology%';

--5. Count total records


SELECT COUNT(*) AS total_articles 
FROM articles 
WHERE is_deleted = 0;

--6. Count records by status

SELECT s.status_name, COUNT(a.article_id) AS status_count
FROM articles a
JOIN article_statuses s ON a.status_id = s.status_id
WHERE a.is_deleted = 0
GROUP BY s.status_name;

--7. Display recently added records

SELECT * FROM articles 
WHERE is_deleted = 0 
ORDER BY created_at DESC;

--8. Display records within date range

SELECT * FROM articles 
WHERE is_deleted = 0 
  AND created_at BETWEEN '2026-06-01' AND '2026-06-30 23:59:59';

--9. Display top 5 records

SELECT TOP 5 * FROM vw_published_articles 
ORDER BY views DESC;

--10. Display summary report (Category Metrics)

SELECT * FROM vw_article_stats 
ORDER BY total_articles DESC;