# 📚 InsightHub – Knowledge Base Management System

## Abstract

**InsightHub** is a responsive web-based Knowledge Base Management System developed using **HTML5, CSS3, Bootstrap 5, JavaScript, jQuery, and JSON Server**. The application provides a centralized platform for creating, managing, reviewing, and publishing knowledge articles through a role-based access system.

The system supports three types of users—**Admin**, **Author**, and **Reader**—each with dedicated dashboards and permissions. Authors can create and manage articles, Admins review and approve submitted content, and Readers can browse and search published knowledge articles. The project demonstrates CRUD operations, client-side validation, session management, and REST API integration using JSON Server.

---

# Table of Contents

1. Project Overview
2. Types of Users
3. Dashboards
4. Features
5. Technology Stack
6. Project Structure
7. Main Logic & Workflows
8. Screenshots
9. Installation

---

# Project Overview

InsightHub is designed to simplify knowledge sharing within an organization by providing a structured workflow for article creation and publication.

The application follows a review-based publishing process:

* Authors submit articles.
* Admin reviews each submission.
* Approved articles become visible to Readers.
* Rejected articles include review remarks for correction.

---

# Types of Users

## 👤 Reader

**Purpose**

Readers are the end users of the application. They can browse, search, and read approved knowledge articles.

### Permissions

* Register account
* Login
* View published articles
* Search articles
* Read complete article

---

## ✍️ Author

**Purpose**

Authors create and manage articles for publication.

### Permissions

* Login
* Create new article
* Edit own articles
* Delete own articles
* View article status
* Track approved/rejected articles

---

## 👨‍💼 Admin

**Purpose**

The Admin manages the publishing workflow and ensures content quality.

### Permissions

* Review submitted articles
* Approve articles
* Reject articles
* Add review remarks
* View all articles
* Manage article lifecycle

---

# Dashboards

The application contains **three dashboards**, each designed for a specific user role.

---

## 1. Reader Dashboard

**Accessible By**

* Reader

### Purpose

Provides an interface for exploring published articles.

### Functions

* Browse articles
* Search articles
* View article details
* Read complete content

---

## 2. Author Dashboard

**Accessible By**

* Author

### Purpose

Allows authors to create and manage their own articles.

### Functions

* Add article
* Edit article
* Delete article
* Monitor article approval status
* View published and reapply articles

---

## 3. Admin Dashboard

**Accessible By**

* Admin

### Purpose

Responsible for reviewing and approving submitted articles.

### Functions

* Review pending articles
* Approve submissions
* Reject submissions
* Add rejection remarks
* Manage article publication

---

# Features

### Authentication

* User Registration
* Secure Login
* Logout
* Role-Based Authentication
* Session Management using Local Storage

### Article Management

* Create Articles
* Edit Articles
* Delete Articles
* View Article Status
* Publish Approved Articles

### Review System

* Pending Review
* Article Approval
* Article Rejection
* Review Remarks

### Reader Features

* Search Articles
* Filter by Category
* Read Full Article
* Responsive Reading Experience

### Validation

* Required Field Validation
* Email Validation
* Password Validation
* Unique Email Check
* Date Validation

### User Experience

* Responsive Design
* Bootstrap Components
* SweetAlert2 Notifications
* Modern UI
* Interactive Navigation

---

# Technology Stack

| Technology                  | Purpose              |
| --------------------------- | ---------------------|
| HTML5                       | Page Structure       |
| CSS3                        | Styling              |
| Bootstrap 5                 | Responsive Design    |
| JavaScript (ES6)            | Business Logic       |
| jQuery                      | DOM Manipulation     |
| JSON Server                 | Mock REST API        |
| SweetAlert2                 | Alert Messages       |
| Confetti JS                 |celebration animation |   
| Font Awesome / Tabler Icons | Icons                |
| Local Storage               | User Session         |

---

## 📁 Project Structure

```
Knowledge Base System/
│
├── assets/
│   └── images/
│       ├── png/
│       │   └── img-removebg-preview.png
│       └── svg/
│           ├── image.svg
│           ├── readme-brands-solid-full.svg
│           └── Rocket research.svg
│
├── data/
│   └── db.json
│
├── pages/
│   ├── addArticle.html
│   ├── adminDashboard.html
│   ├── authorDashboard.html
│   ├── index.html
│   ├── readmore.html
│   └── userDashboard.html
│
├── scripts/
│   ├── addArticle.js
│   ├── adminDashboard.js
│   ├── authorDashboard.js
│   ├── landing.js
│   ├── readmore.js
│   ├── shared.js
│   └── userDashboard.js
│
├── styles/
│   ├── addArticle.css
│   ├── adminDashboard.css
│   ├── authorDashboard.css
│   ├── landing.css
│   ├── readmore.css
│   ├── theme.css
│   └── userDashboard.css
│
└── readme.md
```
---

# Main Logic & Workflows

## User Authentication

```
Register
      ↓
Login
      ↓
Role Verification
      ↓
Redirect to Corresponding Dashboard
```

---

## Article Submission Workflow

```
Author Creates Article
          ↓
 Status = Pending
          ↓
Admin Reviews Article
      ↓           ↓
 Approved     Rejected
      ↓           ↓
Visible to     Author receives
Readers        Review Remarks and can reapply
```

---

## Session Management

```
User Login
      ↓
User Information Stored
in Local Storage
      ↓
Protected Pages Accessible
      ↓
Logout Clears Session
```

---


# Screenshots

Include screenshots of the following pages:

* Landing Page
  
  <img width="1920" height="1020" alt="{9C6D034B-4251-47BE-85D6-07196E1AF644}" src="https://github.com/user-attachments/assets/fbf3dd43-a81e-4459-8680-5aae02dd4ea0" />

* Login Page
  
  <img width="1920" height="1020" alt="{D857B5AD-602C-4C1D-8A8E-B3835F856518}" src="https://github.com/user-attachments/assets/364ec6fc-5cbf-4cfd-ad98-74971fd0f24f" />

* Registration Page
  
<img width="1920" height="1020" alt="{A476FF1E-8FF6-4D60-AE45-477973EE526F}" src="https://github.com/user-attachments/assets/484220d9-15c4-436e-9083-b895e18f7964" />

* Reader Dashboard
  
<img width="1920" height="1020" alt="{DFF44895-AC26-4FC0-8E1F-C3B7BB55D230}" src="https://github.com/user-attachments/assets/cd871ed0-1e96-4404-bf04-9cfe441dbed6" />

* Author Dashboard
  
<img width="1920" height="1020" alt="{6F1DA330-894E-4A39-ABA3-E86371F1DD0A}" src="https://github.com/user-attachments/assets/be7f3f33-9170-4e3a-b351-4dc98fc8fd6f" />

* Admin Dashboard
  
<img width="1920" height="1020" alt="{61C38ECB-2D4A-46BC-9E1B-CDA25E557E84}" src="https://github.com/user-attachments/assets/def9ff5b-d5ed-4b1d-b6b7-2431b560aba1" />

* Add Article Page
  
  <img width="1920" height="1020" alt="{E9293D98-1542-4083-A812-3B9EB65912E4}" src="https://github.com/user-attachments/assets/8d170ecd-a343-4bc4-ad0b-e2e095add060" />

* Edit Article Page
  
  <img width="1920" height="1020" alt="{BA23EABF-E9D6-4A5C-80EF-3C1FA047F927}" src="https://github.com/user-attachments/assets/d4875358-68d1-49b4-a02a-71ccc3207fb6" />

* Restore Article Page
  
  <img width="1920" height="1020" alt="{86D19F9A-12D9-4A55-A9EB-5CC87E8B5160}" src="https://github.com/user-attachments/assets/334937ed-3dcb-4048-8b69-e9c0d8bbe1c5" />


* Read Article Page
  
  <img width="1920" height="1020" alt="{B4D235B0-C509-42E0-9843-8E657433D4C3}" src="https://github.com/user-attachments/assets/dcb5505c-0ac2-48da-a19d-0d3cbed2844e" />


* Profile Page
  
<img width="1920" height="1020" alt="{EC9D4C81-C842-44BA-B8A7-AF2C8AC20802}" src="https://github.com/user-attachments/assets/f4f20547-7039-4e7b-adc6-14e5469e35da" />

* Review Modal
  
<img width="1920" height="1020" alt="{2A7A2D04-353B-4B5C-94F9-38F932B31500}" src="https://github.com/user-attachments/assets/fcbd1670-6990-4b67-92f6-3191fab5bd4f" />

<img width="1920" height="1020" alt="{9F0DB781-D6E9-45C4-A4E7-4FCF823BE2FD}" src="https://github.com/user-attachments/assets/e4491ec9-fdc6-4f72-a726-c63046c9da8a" />


---

# Installation

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/InsightHub.git
```

---

## 2. Open the Project

Open the project folder using **Visual Studio Code**.

---

## 3. Install JSON Server

```bash
npm install -g json-server
```

---

## 4. Start the Backend

```bash
cd data
json-server --watch data/db.json --port 3000
```

Backend URL:

```
http://localhost:3000
```

---

## 5. Launch the Application

Open **index.html** .

---


