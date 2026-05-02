# Project Report: Movie Booking System

## 1. Title Page
* **Project Title:** Movie Booking System
* **Submitted by:** [Your Name / Team Names]
* **Submitted to:** [Your Professor / Project Guide / Organization Name]
* **Date:** [Current Date]

## 2. Acknowledgements
A brief section thanking your guides, mentors, and anyone who helped you complete the project.

## 3. Abstract
The Movie Booking System is a comprehensive web-based application designed to provide users with a seamless experience for browsing movies, viewing theater schedules, and booking seats. The system features a secure user authentication module, an interactive seat selection interface (`SeatPickerPage`, `VisualTheaterEditor`), and an admin dashboard (`AdminDashboard`) for managing movies, theaters, showing schedules, and user bookings. It is built using modern web technologies, specifically the MERN stack (MongoDB, Express.js, React, Node.js).

## 4. Table of Contents
1. Introduction
2. System Requirement Specification (SRS)
3. System Architecture & Tech Stack
4. Database Design (Entity-Relationship)
5. Module Description
6. User Interface (Screenshots)
7. Testing
8. Conclusion and Future Enhancements
9. Bibliography / References

## 5. Introduction
* **Purpose:** To digitize and simplify the movie ticket booking process for customers and provide a management platform for theater administrators.
* **Scope:** The system allows customers to register, browse movies, select theaters, pick specific seats using a visual layout, and view their booking history. Admins can upload movie details, manage theaters, and schedule shows.

## 6. System Requirement Specification (SRS)
### Hardware Requirements:
* **Processor:** Minimum Intel Core i3 or equivalent
* **RAM:** 4GB or higher
* **Storage:** 500 MB free space (for software)

### Software Requirements:
* **Frontend:** React.js, Vite, Tailwind CSS / regular CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **Tools:** Visual Studio Code, Git, Postman (for API testing)

## 7. System Architecture & Tech Stack
* **Client-Side (Frontend):** 
  * Implemented using React.js.
  * Handles routing via React Router (`LandingPage`, `LoginPage`, `MoviesPage`, `MyBookingsPage`).
  * State management using Context API (`AuthContext`).
* **Server-Side (Backend):** 
  * Implemented using Node.js and Express.js.
  * Exposes RESTful APIs (`/api/auth`, `/api/movies`, `/api/theaters`, `/api/shows`, `/api/payment`, `/api/admin`).
* **Database:** 
  * MongoDB is used to store unstructured data securely.
* **Architecture Diagram:** *(Insert a generic flowchart showing Client <-> REST API <-> Node Express Server <-> MongoDB)*

## 8. Database Design
Based on your backend models, the database consists of the following key collections:
1. **User (`User.js`):** `_id`, `name`, `email`, `password`, `role (admin/user)`.
2. **Movie (`Movie.js`):** `_id`, `title`, `description`, `genre`, `duration`, `posterUrl`.
3. **Theater (`Theater.js`):** `_id`, `name`, `location`, `seatLayout`.
4. **Show (`Show.js`):** `_id`, `movie_id`, `theater_id`, `date`, `time`, `price`.
5. **Booking (`Booking.js`):** `_id`, `user_id`, `show_id`, `seats[]`, `totalAmount`, `paymentStatus`.

*(Insert an ER Diagram here representing relationships: User 1:N Booking, Show 1:N Booking, Movie 1:N Show, Theater 1:N Show)*

## 9. Module Description
### User Module
* **Authentication:** Secure login and registration using JWT (JSON Web Tokens). (Mapped to `LoginPage.jsx`, `RegisterPage.jsx`, `auth.js`)
* **Browsing:** Users can view currently running and upcoming movies. (`MoviesPage.jsx`, `TheatreListPage.jsx`)
* **Seat Selection:** An interactive UI allowing users to visually pick available seats. (`SeatPickerPage.jsx`, `VisualTheaterEditor.jsx`)
* **Profile Management:** Viewing booking history. (`MyBookingsPage.jsx`, `ProfilePage.jsx`)

### Admin Module
* **Admin Dashboard:** Centralized control panel for administrators. (`AdminDashboard.jsx`, `admin.js`)
* **Movie Management:** Adding, editing, and deleting movie details along with poster uploads. (`upload.js`, `movies.js`)
* **Theater & Show Management:** Defining theater seating arrangements and assigning movies to specific time slots. (`theaters.js`, `shows.js`)

## 10. User Interface (Screenshots)
*(Please insert screenshots of your running application under these headings)*
* **Fig 1.1:** Landing / Home Page
* **Fig 1.2:** Login & Registration Page
* **Fig 1.3:** Movie Listings Page
* **Fig 1.4:** Interactive Seat Selection Layout
* **Fig 1.5:** Payment / Booking Confirmation
* **Fig 1.6:** User Booking History Page
* **Fig 1.7:** Admin Dashboard

## 11. Testing
* **Unit Testing:** Verified individual API endpoints (Auth, Movies, Bookings) using Postman.
* **Integration Testing:** Ensured the React frontend correctly communicates with the Node.js backend.
* **Validation:** Implemented form validations and protected routes (`ProtectedRoute.jsx`, `AdminRoute.jsx`) to restrict unauthorized access.

## 12. Conclusion & Future Enhancements
* **Conclusion:** The Movie Booking System successfully streamlines the ticketing process, providing a user-friendly interface for customers and an efficient management system for administrators.
* **Future Enhancements:** 
  * Integration of a real payment gateway (like Stripe or Razorpay).
  * Email/SMS confirmation for successful bookings.
  * Adding a recommendation engine based on user preferences.
  * QR Code generation for e-tickets.

## 13. References
* React Documentation: https://react.dev/
* Node.js Documentation: https://nodejs.org/
* Express.js Guide: https://expressjs.com/
* MongoDB Manual: https://www.mongodb.com/docs/
