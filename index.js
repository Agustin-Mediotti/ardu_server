const mysql = require("mysql");
require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

/* DB CONFIGURATION & CONNECTION */

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(
  morgan("combined", {
    skip: (req, res) => {
      return res.statusCode < 400;
    },
    stream: accessLogStream,
  })
);

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB,
});

/* MIDDLEWARE */

app.use(express.json());
app.use(cors());

app.get("/api/weather", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;

    connection.query(
      { sql: "SELECT * FROM `weather`", timeout: 40000 },
      (error, results) => {
        res.json(results);
        if (error) throw error;
        connection.release();
      }
    );
  });
});

app.post("/api/weather", (req, res) => {
  const body = req.body;

  if (!body.temp || body.hum || body.pres) {
    return res.status(400).json({
      error: "malformed request",
    });
  }

  const weatherStatus = {
    ...body,
  };
  console.log(JSON.stringify(weatherStatus));

  pool.getConnection((err, connection) => {
    if (err) throw err;

    connection.query(
      "INSERT INTO `weather` SET ?",
      weatherStatus,
      (error, results) => {
        res.json(results);
        if (error) throw error;
        connection.release();
      }
    );
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
