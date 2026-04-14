# COMP 307 Winter 2026 Project: McBook (McGill Booking App)

**URL TO RUNNING WEBSITE:** [link to website ...]

## Team Members & Contributions
*The following table outlines the team members and the code they worked on.*

| Name | Student ID | Code Worked On (Contributions) |
| :--- | :--- | :--- |
| **Kaan Ataman (Leader)** | 261163904 | [tasks done] |
| **David Namgung** | 261183180 | [tasks done] |
| **Jessie Maeda-Yang** | 261179687 | [tasks done] |

---

## Project Overview
McBook is a full-stack scheduling and polling application built for the McGill School of Computer Science. It allows professors and TAs (Owners) to manage their office hours, and students (Users) to easily request, vote on, and book appointments. 

### Features
* **Role-Based Access:** Exclusive registration for `@mcgill.ca` (Owners) and `@mail.mcgill.ca` (Students).
* **Type 3 (Recurring Office Hours):** Owners can create recurring office hours for *X* weeks; students can book instantly.
* **Type 1 (Request a Meeting):** Students can propose custom meeting times with messages for owner approval via a Pending Inbox.
* **Type 2 (Group Polling):** Owners can propose multiple times; students vote, and the owner finalizes a shared, recurring group slot.
* **Custom Invitation URLs:** Shareable links (e.g., `/book/prof@mcgill.ca`) that seamlessly handle authentication and redirect users directly to a specific professor's booking page.
* **Integrated Communications:** Automated `mailto:` triggers for all booking, cancellation, deletion, and approval actions.
* ** BONUS (Calendar Export):** One-click `.ics` file generation for both owners and users to automatically add appointments to Google/Apple/Outlook calendars.

---

## The 70/30 Rule Declaration

**Over 70% of the core application was hand-coded by our team from scratch.** **The 70% Hand-Coded components include:**
* All Java Spring Boot Controllers, Services, and business logic (Booking engines, Polling logic, Recurring slot loops).
* All JPA Entity mapping and Repository interfaces.
* All React frontend components (`OwnerDashboard`, `StudentDashboard`, `Login`, `Register`, `ProfessorBookingPage`).
* All application state management, data filtering, and custom UI conditional rendering.
* The `.ics` Calendar Export file formatting and generation algorithms.

**The 30% of the project utilizing templates, frameworks, and libraries includes:**
* **Spring Boot Initializr:** Used to generate the initial backend project scaffolding and Maven dependencies.
* **Spring Data JPA / Hibernate:** Used to auto-generate SQL queries and manage database transactions without writing raw SQL.
* **Spring Security & BCrypt:** Used to provide the hashing framework for secure password storage.
* **React & Vite:** The core JavaScript framework and build tool used for the frontend structure.
* **Tailwind CSS:** A utility-first CSS framework used for styling, layout grids, and responsiveness instead of writing raw CSS files.
* **Framer Motion:** A React library used specifically for the pop-up modal animations.
* **Lucide React:** An icon library used for the SVG icons throughout the dashboards.

---

## Running the Application
Please see the accompanying **`HOW_TO_RUN.md`** file for step-by-step instructions on setting up the PostgreSQL database and launching the backend and frontend servers.


