const express = require("express");
const connection = require("../connection");
const e = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const nodemailer = require("nodemailer");

router.post("/signup", (req, res) => {
  let user = req.body;
  const selectQuery =
    "select email,password,role,status from users where email=?";
  connection.query(selectQuery, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        query =
          "insert into users (name,contactNumber,email,password,role,status) values(?,?,?,?,'false','user')";
        connection.query(
          query,
          [user.name, user.contactNumber, user.email, user.password],
          (err, results) => {
            if (!err) {
              return res
                .status(200)
                .json({ message: "Successfully Registered" });
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
var transporter  = nodemailer.createTransport({
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
      from: process.env.EMAIL_USER,
      to: results[0].email,
      subject: "Password by Cafe Management System",
      html: `
        <p>Your login details for Cafe Management System</p>
        <p>Email: <b>${results[0].email}</b></p>
        <p>Password: <b>${results[0].password}</b></p>
        <a href="http://localhost:4200/">Click to login</a>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("❌ Email error:", error);
        return res.status(500).json({ message: "Failed to send email" });
      }
      console.log("✅ Email sent:", info.response);
      return res.status(200).json({ message: "Password sent to your email id" });
    });
  });
});

module.exports = router;
