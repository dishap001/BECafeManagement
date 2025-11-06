const express = require("express");
const connection = require("../connection");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const nodemailer = require("nodemailer");
const { authenticateToken } = require("../services/authentication");
const { checkRole } = require("../services/checkRole");

/* ============================================================
   ✅ 1. USER SIGNUP
   URL: POST /user/signup
   Access: Public
   Body Example:
   {
     "name": "Disha",
     "contactNumber": "9898982299",
     "email": "disha@gmail.com",
     "password": "123456"
   }
=============================================================== */
router.post("/signup", (req, res) => {
  let user = req.body;
  const selectQuery =
    "select email,password,role,status from users where email=?";

  connection.query(selectQuery, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        const query =
          "insert into users (name,contactNumber,email,password,role,status) values(?,?,?,?,'false','user')";
        connection.query(
          query,
          [user.name, user.contactNumber, user.email, user.password],
          (err, results) => {
            if (!err) {
              return res.status(200).json({
                message: "Successfully Registered",
              });
            } else {
              return res.status(500).json(err);
            }
          }
        );
      } else {
        return res.status(400).json({ message: "User already exists" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

/* ============================================================
   ✅ 2. USER LOGIN
   URL: POST /user/login
   Access: Public
   Body Example:
   {
     "email": "admin@gmail.com",
     "password": "admin"
   }
   ✅ Response: JWT Token
=============================================================== */
router.post("/login", (req, res) => {
  const user = req.body;
  const selectQuery =
    "select email,password ,role,status from users where email=?";
  connection.query(selectQuery, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0 || results[0].password != user.password) {
        return res.status(401).json({ message: "Invalid Credentials" });
      } else if (results[0].status === "false") {
        return res.status(401).json({ message: "Wait for Admin Approval" });
      } else if (results[0].password == user.password) {
        const response = { email: results[0].email, role: results[0].role };
        const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, {
          expiresIn: "8h",
        });
        res.status(200).json({ token: accessToken });
      } else {
        return res.status(400).json({ message: "Something went wrong" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

/* ============================================================
   ✅ 3. FORGOT PASSWORD
   URL: POST /user/forgotPassword
   Access: Public
   Body Example:
   {
     "email": "disha@gmail.com"
   }
   ✅ Sends password to user email
=============================================================== */
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

router.post("/forgotPassword", (req, res) => {
  const { email } = req.body;

  const selectQuery = "SELECT email, password FROM users WHERE email=?";
  connection.query(selectQuery, [email], (err, results) => {
    if (err) {
      return res.status(500).json(err);
    }

    // if no user found
    if (results.length <= 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    // user found → send mail
    const mailOptions = {
      from: `"Cafe Management System" <${process.env.EMAIL}>`,
      to: results[0].email,
      subject: "☕ Your Cafe Management System Login Details",
      html: `
  <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
      <div style="background-color: #2b6777; color: #ffffff; text-align: center; padding: 20px 10px;">
        <h2 style="margin: 0;">Cafe Management System</h2>
        <p style="margin: 0; font-size: 14px;">Your password recovery email</p>
      </div>
      
      <div style="padding: 25px 30px; color: #333333;">
        <p style="font-size: 16px;">Hi <b>${results[0].email}</b>,</p>
        <p style="font-size: 15px;">Here are your login details for accessing the <b>Cafe Management System</b>:</p>
        
        <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 5px 0;"><b>Email:</b> ${results[0].email}</p>
          <p style="margin: 5px 0;"><b>Password:</b> ${results[0].password}</p>
        </div>
        
        <p style="font-size: 15px;">You can log in to your account using the button below:</p>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="http://localhost:4200/" 
             style="background-color: #52ab98; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
             🔑 Login to Cafe Portal
          </a>
        </div>

        <p style="font-size: 13px; color: #666666;">
          ⚠️ We recommend changing your password after logging in for better security.
        </p>
      </div>

      <div style="background-color: #f3f4f6; text-align: center; padding: 12px; font-size: 12px; color: #888888;">
        <p style="margin: 0;">© 2025 Cafe Management System. All rights reserved.</p>
      </div>
    </div>
  </div>
  `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("❌ Email error:", error);
        return res.status(500).json({ message: "Failed to send email" });
      }
      console.log("✅ Email sent:", info.response);
      return res
        .status(200)
        .json({ message: "Password sent to your email id" });
    });
  });
});

/* ============================================================
   ✅ 4. GET ALL USERS
   URL: GET /user/getUsers
   Access: Admin Only
=============================================================== */
router.get("/getUsers", authenticateToken, checkRole, (req, res) => {
  var query =
    "select id ,name,email,contactNumber,status from users where role='user'";
  connection.query(query, (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else {
      return res.status(500).json(err);
    }
  });
});

/* ============================================================
   ✅ 5. UPDATE USER STATUS
   URL: PATCH /user/updateStatus
   Access: Admin Only
   Body Example:
   {
     "id": 2,
     "status": "true"
   }
=============================================================== */
router.patch("/updateStatus", authenticateToken, checkRole, (req, res) => {
  let user = req.body;
  var query = "update users set status=? where id=?";
  connection.query(query, [user.status, user.id], (err, results) => {
    if (!err) {
      if (results.affectedRows == 0) {
        return res.status(404).json({ message: "User Not Found" });
      } else {
        return res
          .status(200)
          .json({ message: "User status Updated successfully" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

/* ============================================================
   ✅ 6. CHECK TOKEN VALIDITY
   URL: GET /user/checkToken
   Access: Logged-in Users
=============================================================== */
router.get("/checkToken", authenticateToken, (req, res) => {
  return res.status(200).json({ message: "true" });
});

/* ============================================================
   ✅ 7. CHANGE PASSWORD
   URL: POST /user/changePassword
   Access: Logged-in Users
   Body Example:
   {
     "email": "admin@gmail.com",
     "oldPassword": "admin",
     "newPassword": "admin123"
   }
=============================================================== */
router.post("/changePassword", authenticateToken, (req, res) => {
  const user = req.body;
  const email = req.body.email;
  var query = "select * from users where email=? and password=?";
  connection.query(query, [email, user.oldPassword], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        return res
          .status(400)
          .json({ message: "Invalid Email or Old Password" });
      } else if (results[0].password == user.oldPassword) {
        var updateQuery = "update users set password=? where email=?";
        connection.query(
          updateQuery,
          [user.newPassword, email],
          (err, results) => {
            if (!err) {
              return res
                .status(200)
                .json({ message: "Password changed successfully" });
            } else {
              return res.status(500).json(err);
            }
          }
        );
      } else {
        return res.status(400).json({ message: "Something went wrong" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

module.exports = router;
