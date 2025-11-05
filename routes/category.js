const express = require('express');
const router = express.Router();
const connection = require('../connection');
const { authenticateToken } = require('../services/authentication');
const { checkRole } = require('../services/checkRole');

router.post('/addCategory', authenticateToken, checkRole, (req, res) => {
    const category = req.body;
    var query = "insert into category (name) values (?)"    
    connection.query(query, [category.name], (err, results) => {
        if (!err) {
            return res.status(200).json({ message: "Category added successfully" });
        } else {
            return res.status(500).json(err);
        }       
    });    
});

router.get('/getCategory',authenticateToken,(req,res,next)=>{
    var query = "select * from category order by name";
    connection.query(query,(err,results)=>{
        if(!err){
            return res.status(200).json(results);
        }else{
            return res.status(500).json(err);
        }
    })
})

router.patch("/updateCategory",authenticateToken,checkRole,(req,res,next)=>{
    const product = req.body;
    var query = "update category set name=? where id=?";
    connection.query(query,[product.name,product.id],(err,results)=>{
        if(!err){
            if(results.affectedRows == 0){
                return res.status(404).json({message:"Category not found"});
            }else{
                return res.status(200).json({message:"Category updated successfully"});
            }
        }else{
            return res.status(500).json(err);
        }
    })
})

module.exports = router;