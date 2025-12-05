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

  // 获取个人资料（通过 Authorization Bearer token）——来自 users 表
  router.get("/user/profile", (req, res) => {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token)
      return res.status(401).json({ success: false, message: "未提供令牌" });

    db.query(
      "SELECT id, avatar, nickname, gender, birth_year, height FROM users WHERE token = ?",
      [token],
      (err, rows) => {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: "数据库错误" });
        if (!rows || rows.length === 0)
          return res.status(401).json({ success: false, message: "无效令牌" });
        const u = rows[0];
        const data = {
          avatarUri: u.avatar || null,
          nickname: u.nickname || null,
          gender: u.gender || null,
          birthYear: u.birth_year || null,
          heightCm: u.height || null,
        };
        res.json({ success: true, data });
      }
    );
  });

  // 更新个人资料——写回 users 表
  router.post("/user/profile", (req, res) => {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token)
      return res.status(401).json({ success: false, message: "未提供令牌" });

    const { avatarUri, nickname, gender, birthYear, heightCm } = req.body || {};

    db.query("SELECT id FROM users WHERE token = ?", [token], (err, rows) => {
      if (err)
        return res.status(500).json({ success: false, message: "数据库错误" });
      if (!rows || rows.length === 0)
        return res.status(401).json({ success: false, message: "无效令牌" });
      const userId = rows[0].id;

      const sql =
        "UPDATE users SET avatar = ?, nickname = ?, gender = ?, birth_year = ?, height = ? WHERE id = ?";
      const params = [
        avatarUri || null,
        nickname || null,
        gender || null,
        birthYear || null,
        heightCm || null,
        userId,
      ];
      db.query(sql, params, (uerr, result) => {
        if (uerr)
          return res
            .status(500)
            .json({ success: false, message: "保存资料失败" });
        if (result.affectedRows > 0) {
          res.json({ success: true, message: "保存成功" });
        } else {
          res.status(400).json({ success: false, message: "保存失败" });
        }
      });
    });
  });

  return router;
};
