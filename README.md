☕ Cafe Management System — Backend (Node.js + Express + MySQL)

The Cafe Management System Backend is a RESTful API built with Node.js, Express, and MySQL to manage cafe operations, user authentication, and email-based password recovery.

It provides essential functionality for user registration, login authentication using JWT, and a forgot password feature using Nodemailer with Gmail App Password integration.
This backend connects seamlessly with a frontend (e.g. Angular or React) for a complete full-stack cafe management application.

| Type                    | Method | URL                                         | Description                          |
| ----------------------- | ------ | ------------------------------------------- | ------------------------------------ |
| **Base URL**            | GET    | `http://localhost:8080/`                    | Check if server is running           |
| **Signup API**          | POST   | `http://localhost:8080/user/signup`         | Register new users                   |
| **Login API**           | POST   | `http://localhost:8080/user/login`          | Authenticate users and get JWT token |
| **Forgot Password API** | POST   | `http://localhost:8080/user/forgotPassword` | Send password via email              |


Default Login Credentials (for testing)
Role	Email	Password	Status
Admin	admin@gmail.com	admin	✅ Active (status=true)
User 1	dia@gmail.com	123456	🚫 Pending Approval (status=false)
User 2	neha@gmail.com	123456	🚫 Pending Approval (status=false)