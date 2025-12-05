// ...
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "sun521998",
  database: "weight_journal",
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("数据库连接失败:", err);
  } else {
    console.log("数据库连接成功");
    connection.release();
  }
});

// 路由拆分
const userRouter = require("./routes/user")(db);
const weightRouter = require("./routes/weight")(db);
app.use("/api", userRouter);
app.use("/api/weight", weightRouter);

// 启动服务
app.listen(3001, () => {
  console.log("后端服务已启动，端口 3001");
});
