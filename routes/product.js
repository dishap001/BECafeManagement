/**
 * PRODUCT ROUTES – Cafe Management System
 *
 * Endpoints included:
 * 1. POST   /addProduct
 * 2. GET    /getProducts
 * 3. GET    /getByCategory/:id
 * 4. GET    /getById/:id
 * 5. PATCH  /updateProduct
 * 6. DELETE /delete/:id
 * 7. PATCH  /updateStatus
 *
 * Requirements:
 * - Must send Bearer Token for all routes (authenticateToken)
 * - Only Admins can create, update, delete products (checkRole)
 */

const express = require("express");
const connection = require("../connection");
const router = express.Router();
const { authenticateToken } = require("../services/authentication");
const { checkRole } = require("../services/checkRole");

/* ============================================================
   ✅ 1. ADD PRODUCT
   URL: POST /product/addProduct
   Access: Admin only
   Body Example:
   {
     "name": "Cold Coffee",
     "categoryId": 1,
     "description": "Chilled creamy coffee",
     "price": 120
   }
=============================================================== */
router.post("/addProduct", authenticateToken, checkRole, (req, res) => {
  const product = req.body;
  var query =
    "insert into product (name,categoryId,description,price,status) values (?,?,?,?,'true')";
  connection.query(
    query,
    [product.name, product.categoryId, product.description, product.price],
    (err, results) => {
      if (!err) {
        return res.status(200).json({ message: "Product added successfully" });
      } else {
        return res.status(500).json(err);
      }
    }
  );
});
/* ============================================================
   ✅ 2. GET ALL PRODUCTS
   URL: GET /product/getProducts
   Access: Logged-in users
   Returns product + category details
=============================================================== */
router.get("/getProducts", authenticateToken, (req, res, next) => {
  var query = `select p.id, p.name, p.description, p.price, p.status, c.id as categoryId, c.name as categoryName
  from product p inner join category as c where p.categoryId = c.id`;
  connection.query(query, (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else {
      return res.status(500).json(err);
    }
  });
});
/* ============================================================
   ✅ 3. GET PRODUCTS BY CATEGORY
   URL: GET /product/getByCategory/:id
   Access: Logged-in users
   Example: /product/getByCategory/1
=============================================================== */
router.get("/getByCategory/:id", authenticateToken, (req, res, next) => {
  const categoryId = req.params.id;
  var query = `select id ,name from product where categoryId=? and status='true'`;
  connection.query(query, [categoryId], (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else {
      return res.status(500).json(err);
    }
  });
});
/* ============================================================
   ✅ 4. GET PRODUCT BY ID
   URL: GET /product/getById/:id
   Example: /product/getById/5
=============================================================== */
router.get("/getById/:id", authenticateToken, (req, res, next) => {
  const id = req.params.id;
  var query = `select id, name, description, price from product where id=?`;
  connection.query(query, [id], (err, results) => {
    if (!err) {
      return res.status(200).json(results[0]);
    } else {
      return res.status(500).json(err);
    }
  });
});
/* ============================================================
   ✅ 5. UPDATE PRODUCT
   URL: PATCH /product/updateProduct
   Access: Admin only
   Body Example:
   {
     "id": 1,
     "name": "Hot Chocolate",
     "categoryId": 2,
     "description": "Sweet & creamy",
     "price": 150
   }
=============================================================== */
router.patch(
  "/updateProduct",
  authenticateToken,
  checkRole,
  (req, res, next) => {
    const product = req.body;
    var query =
      "update product set name=?,categoryId=?, description=?, price=? where id=?";
    connection.query(
      query,
      [
        product.name,
        product.categoryId,
        product.description,
        product.price,
        product.id,
      ],
      (err, results) => {
        if (!err) {
          if (results.affectedRows == 0) {
            return res.status(404).json({ message: "Product not found" });
          } else {
            return res
              .status(200)
              .json({ message: "Product updated successfully" });
          }
        } else {
          return res.status(500).json(err);
        }
      }
    );
  }
);

/* ============================================================
   ✅ 6. DELETE PRODUCT
   URL: DELETE /product/delete/:id
   Access: Admin only
   Example: DELETE /product/delete/3
=============================================================== */
router.delete("/delete/:id", authenticateToken, checkRole, (req, res, next) => {
  const id = req.params.id;
  var query = "delete from product where id=?";
  connection.query(query, [id], (err, results) => {
    if (!err) {
      if (results.affectedRows == 0) {
        return res.status(404).json({ message: "Product not found" });
      } else {
        return res
          .status(200)
          .json({ message: "Product deleted successfully" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

/* ============================================================
   ✅ 7. UPDATE PRODUCT STATUS
   URL: PATCH /product/updateStatus
   Access: Admin only
   Body Example:
   {
     "id": 1,
     "status": "false"
   }
=============================================================== */
router.patch(
  "/updateStatus",
  authenticateToken,
  checkRole,
  (req, res, next) => {
    const product = req.body;
    var query = "update product set status=? where id=?";
    connection.query(query, [product.status, product.id], (err, results) => {
      if (!err) {
        if (results.affectedRows == 0) {
          return res.status(404).json({ message: "Product not found" });
        } else {
          return res
            .status(200)
            .json({ message: "Product status updated successfully" });
        }
      } else {
        return res.status(500).json(err);
      }
    });
  }
);

module.exports = router;
