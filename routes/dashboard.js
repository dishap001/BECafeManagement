const express = require("express");
const connection = require("../connection");
const router = express.Router();
const { authenticateToken } = require("../services/authentication");

router.get("/details", authenticateToken, (req, res, next) => {
  var categoryCount;
  var productCount;
  var billCount;
  var query = "SELECT COUNT(id) AS categoryCount FROM category";
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      categoryCount = results[0].categoryCount;
    }
  });

  query = "SELECT COUNT(id) AS productCount FROM product";
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      productCount = results[0].productCount;
    }
  });

  query = "SELECT COUNT(id) AS billCount FROM bill";
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      billCount = results[0].billCount;
      var data = {
        categoryCount: categoryCount,
        productCount: productCount,
        billCount: billCount,
      };
      return res.status(200).json(data);
    }
  });
});
module.exports = router;
