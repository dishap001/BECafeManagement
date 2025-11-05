const express = require("express");
const connection = require("../connection");
const router = express.Router();
const { authenticateToken } = require("../services/authentication");
const { checkRole } = require("../services/checkRole");

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

module.exports = router;