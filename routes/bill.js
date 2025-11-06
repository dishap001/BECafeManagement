const express = require("express");
const connection = require("../connection");
const router = express.Router();
const ejs = require("ejs");
const pdf = require("html-pdf");
const fs = require("fs");
const path = require("path");
const uuid = require("uuid");
const generatedUuid = uuid.v1();
const { authenticateToken } = require("../services/authentication");
const { checkRole } = require("../services/checkRole");

/* ============================================================
   ✅ GENERATE BILL REPORT (PDF)
   URL: POST /bill/generateReport
   Access: Admin Only
   Body Example:
   {
     "name": "Disha",
     "email": "example@gmail.com",
     "contactNumber": "9876543210",
     "paymentMethod": "CASH",
     "totalAmount": 480,
     "productDetails": "[{\"name\":\"Tea\",\"price\":40,\"quantity\":2}]"
   }
=============================================================== */

router.post("/generateReport", authenticateToken, checkRole, (req, res) => {
  const generatedUuid = uuid.v1();
  const orderDetails = req.body;

  const productDetails = JSON.parse(orderDetails.productDetails);

  const query =
    "INSERT INTO bill (name, uuid, email, contactNumber, paymentMethod, total, productDetails, createdBy) VALUES (?,?,?,?,?,?,?,?)";

  connection.query(
    query,
    [
      orderDetails.name,
      generatedUuid,
      orderDetails.email,
      orderDetails.contactNumber,
      orderDetails.paymentMethod,
      orderDetails.totalAmount,
      orderDetails.productDetails,
      req.locals.email,
    ],
    (err, results) => {
      if (err) {
        return res.status(500).json(err);
      }

      // ✅ Render EJS template
      ejs.renderFile(
        path.join(__dirname, "report.ejs"),
        {
          productDetails: productDetails,
          name: orderDetails.name,
          email: orderDetails.email,
          contactNumber: orderDetails.contactNumber,
          paymentMethod: orderDetails.paymentMethod,
          totalAmount: orderDetails.totalAmount,
        },
        (err, html) => {
          if (err) {
            console.log(err);
            return res.status(500).json(err);
          }

          // ✅ Generate PDF
          pdf.create(html).toFile(
            `./generated_pdf/${generatedUuid}.pdf`,
            (err, data) => {
              if (err) {
                console.log(err);
                return res.status(500).json(err);
              }

              return res.status(200).json({
                message: "Report generated successfully",
                reportUuid: generatedUuid,
              });
            }
          );
        }
      );
    }
  );
});

module.exports = router;
