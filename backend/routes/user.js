const express = require("express");
const crypto = require("crypto");

module.exports = (db) => {
  const router = express.Router();

  // 登录接口
  router.post("/login", (req, res) => {
    const { username, password } = req.body;
    db.query(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password],
      (err, results) => {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: "数据库错误" });
        if (results.length > 0) {
          // 登录成功，生成 token 并存入数据库
          const token = crypto.randomBytes(24).toString("hex");
          db.query(
            "UPDATE users SET token = ? WHERE username = ?",
            [token, username],
            (err2) => {
              if (err2)
                return res
                  .status(500)
                  .json({ success: false, message: "token写入失败" });
              res.json({ success: true, message: "登录成功", token });
            }
          );
        } else {
          res.status(401).json({ success: false, message: "用户名或密码错误" });
        }
      }
    );
  });

  // 退出登录接口
  router.post("/logout", (req, res) => {
    const { token } = req.body;
    db.query(
      "UPDATE users SET token = NULL WHERE token = ?",
      [token],
      (err, result) => {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: "数据库错误" });
        if (result.affectedRows > 0) {
          res.json({ success: true, message: "已退出登录" });
        } else {
          res
            .status(400)
            .json({ success: false, message: "无效 token 或已退出" });
        }
      }
    );
  });

  return router;
};
