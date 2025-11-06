const express = require("express");
var cors = require("cors");
const userRoutes = require("./routes/user");
const connection = require("./connection");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
const billsRoutes = require("./routes/bill");
const app = express();
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/user", userRoutes);
app.use("/category", categoryRoutes);
app.use("/product", productRoutes);
app.use("/bills", billsRoutes);
// Test route
app.get("/", (req, res) => {
  res.send("Welcome to the Cafe Management System API");
});

module.exports = app;