const mysql = require("mysql");

const dotenv = require("dotenv");
dotenv.config();

var connection = mysql.createConnection({
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect(function (err) {
  if (err) {
    console.error("Error connecting to the database: " + err.stack);
    return;
  } else {
    console.log("Connected to the database as id " + connection.threadId);
  }
});
module.exports = connection;
