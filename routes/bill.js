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
   ✅ 1. GENERATE BILL REPORT (Create PDF + Save Bill in DB)
   URL: POST /bill/generateReport
   Access: Admin Only
   Body Example:
   {
     "name": "Disha",
     "email": "example@gmail.com",
     "contactNumber": "9876543210",
     "paymentMethod": "CASH",
     "totalAmount": 480,
     "productDetails": "[{\"name\":\"Tea\",\"category\":\"Hot\",\"price\":40,\"quantity\":2,\"total\":80}]"
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
/* ============================================================
   ✅ 2. GET BILL PDF (Download or Generate Again)
   URL: POST /bill/getPdf
   Access: Admin Only
   Body Example:
   {
     "reportUuid": "aa22bb44-11cc-33dd-99ee-1234567890ff",
     "name": "Disha",
     "email": "example@gmail.com",
     "contactNumber": "9876543210",
     "paymentMethod": "CASH",
     "totalAmount": 480,
     "productDetails": "[{\"name\":\"Tea\",\"category\":\"Hot\",\"price\":40,\"quantity\":2,\"total\":80}]"
   }
=============================================================== */

router.post("/getPdf", authenticateToken, (req, res) => {
  const orderDetails = req.body;
  const pdfPath = `./generated_pdf/${orderDetails.reportUuid}.pdf`;

  // ✅ If PDF exists, return it directly
  if (fs.existsSync(pdfPath)) {
    res.contentType("application/pdf");
    return fs.createReadStream(pdfPath).pipe(res);
  }

  // ✅ PDF doesn't exist → generate new one
  const productDetails = JSON.parse(orderDetails.productDetails);

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
      } else {
        // ✅ Create PDF (IF–ELSE as you requested)
        pdf.create(html).toFile(pdfPath, (err, data) => {
          if (err) {
            console.log(err);
            return res.status(500).json(err);
          } else {
            res.contentType("application/pdf");
            return fs.createReadStream(pdfPath).pipe(res);
          }
        });
      }
    }
  );
});

/* ============================================================
   ✅ 3. GET ALL BILLS
   URL: GET /bill/getBills
   Access: Admin Only
   Response Example:
   [
     {
       "id": 1,
       "name": "Disha",
       "uuid": "44aa11bb-22cc-33dd-44ff-556677889900",
       "email": "example@gmail.com",
       "contactNumber": "9876543210",
       "paymentMethod": "CASH",
       "total": 480
     }
   ]
=============================================================== */

router.get("/getBills", authenticateToken, (req, res,next) => {
  const query = "SELECT * FROM bill ORDER BY id DESC";
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.status(200).json(results);
  });
});

/* ============================================================
   ✅ 4. DELETE BILL
   URL: DELETE /bill/delete/:id
   Access: Admin Only
   If bill exists → ✅ "Bill deleted successfully"
   If bill does not exist → ❌ "Bill not found"
=============================================================== */

router.delete("/delete/:id", authenticateToken, (req, res) => {
  const billId = req.params.id;

  const query = "DELETE FROM bill WHERE id = ?";  

  connection.query(query, [billId], (err, results) => {
    if (err) {
      return res.status(500).json(err);
    }

    // ✅ If no record was deleted → bill doesn't exist
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Bill not found" });
    }

    return res.status(200).json({ message: "Bill deleted successfully" });
  });
});

module.exports = router;

