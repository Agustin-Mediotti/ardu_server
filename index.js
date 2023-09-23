const mysql = require("mysql");
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

/* DB CONFIGURATION & CONNECTION */

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB,
});

connection.connect((err) => {
  if (err) {
    console.log(`error connecting: ${err.stack}`);
    return;
  }
  console.log(`connected as id ${connection.threadId}`);
});

/* MIDDLEWARE */

app.use(express.json());
app.use(cors());

app.get("/api/weather", (req, res) => {
  connection.query("SELECT * FROM `weather`", (error, results, fields) => {
    if (error) throw error;
    res.json(results);
    console.log(fields);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
