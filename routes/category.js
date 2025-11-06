const express = require('express');
const router = express.Router();
const connection = require('../connection');
const { authenticateToken } = require('../services/authentication');
const { checkRole } = require('../services/checkRole');

/* ============================================================
   ✅ 1. ADD CATEGORY
   URL: POST /category/addCategory
   Access: Admin Only
   Body Example:
   {
     "name": "Beverages"
   }
=============================================================== */
router.post('/addCategory', authenticateToken, checkRole, (req, res) => {
    const category = req.body;

    var query = "INSERT INTO category (name) VALUES (?)";

    connection.query(query, [category.name], (err, results) => {
        if (!err) {
            return res.status(200).json({ message: "Category added successfully" });
        } else {
            return res.status(500).json(err);
        }       
    });    
});

/* ============================================================
   ✅ 2. GET ALL CATEGORIES
   URL: GET /category/getCategory
   Access: Logged-in Users
   Response Example:
   [
     { "id": 1, "name": "Tea" },
     { "id": 2, "name": "Snacks" }
   ]
=============================================================== */
router.get('/getCategory', authenticateToken, (req, res, next) => {

    var query = "SELECT * FROM category ORDER BY name";

    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
});

/* ============================================================
   ✅ 3. UPDATE CATEGORY
   URL: PATCH /category/updateCategory
   Access: Admin Only
   Body Example:
   {
     "id": 2,
     "name": "Hot Beverages"
   }
=============================================================== */
router.patch("/updateCategory", authenticateToken, checkRole, (req, res, next) => {
    const category = req.body;

    var query = "UPDATE category SET name=? WHERE id=?";

    connection.query(query, [category.name, category.id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(404).json({ message: "Category not found" });
            } else {
                return res.status(200).json({ message: "Category updated successfully" });
            }
        } else {
            return res.status(500).json(err);
        }
    });
});

module.exports = router;
