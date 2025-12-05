const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  // 通过 token 获取 user_id
  function getUserIdByTokenFromReq(req, cb) {
    let token = req.headers["authorization"];
    if (token && token.startsWith("Bearer ")) token = token.slice(7);
    if (!token) return cb(null);
    db.query(
      "SELECT id FROM users WHERE token = ?",
      [token],
      (err, results) => {
        if (err || results.length === 0) return cb(null);
        cb(results[0].id);
      }
    );
  }

  // 新增或更新体重记录
  router.post("/", (req, res) => {
    console.log("收到参数", req.body);
    const { weight, date, unit } = req.body;
    if (!weight || !date)
      return res.status(400).json({ success: false, message: "参数缺失" });
    getUserIdByTokenFromReq(req, (userId) => {
      if (!userId)
        return res.status(401).json({ success: false, message: "无效token" });
      db.query(
        "INSERT INTO weight_records (user_id, record_date, weight, unit) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE weight = VALUES(weight), unit = VALUES(unit)",
        [userId, date, weight, unit || "kg"],
        (err) => {
          if (err)
            return res
              .status(500)
              .json({ success: false, message: "数据库错误" });
          res.json({ success: true, message: "记录成功" });
        }
      );
    });
  });

  // 查询体重记录（可查某天或全部）
  router.get("/", (req, res) => {
    const { date } = req.query;
    getUserIdByTokenFromReq(req, (userId) => {
      if (!userId)
        return res.status(401).json({ success: false, message: "无效token" });
      let sql =
        "SELECT record_date, weight, unit FROM weight_records WHERE user_id = ?";
      const params = [userId];
      if (date) {
        sql += " AND record_date = ?";
        params.push(date);
      }
      sql += " ORDER BY record_date DESC";
      db.query(sql, params, (err, results) => {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: "数据库错误" });
        // 将 record_date 转为 YYYY-MM-DD 字符串
        const data = results.map((r) => {
          let dateStr = r.record_date;
          if (r.record_date instanceof Date) {
            // 用本地年月日拼接，避免 toISOString() 的时区偏移
            const y = r.record_date.getFullYear();
            const m = String(r.record_date.getMonth() + 1).padStart(2, "0");
            const d = String(r.record_date.getDate()).padStart(2, "0");
            dateStr = `${y}-${m}-${d}`;
          } else if (
            typeof r.record_date === "string" &&
            r.record_date.length >= 10
          ) {
            dateStr = r.record_date.slice(0, 10);
          }
          return { ...r, record_date: dateStr };
        });
        res.json({ success: true, data });
      });
    });
  });

  // 获取用户目标体重（从 users 表）
  router.get("/target", (req, res) => {
    getUserIdByTokenFromReq(req, (userId) => {
      if (!userId)
        return res.status(401).json({ success: false, message: "无效token" });
      db.query(
        "SELECT target_weight FROM users WHERE id = ?",
        [userId],
        (err, rows) => {
          if (err)
            return res
              .status(500)
              .json({ success: false, message: "数据库错误" });
          const target = rows && rows[0] ? rows[0].target_weight : null;
          res.json({ success: true, data: { targetWeight: target } });
        }
      );
    });
  });

  // 设置用户目标体重（写入 users 表）
  router.post("/target", (req, res) => {
    const { targetWeight } = req.body || {};
    if (typeof targetWeight !== "number") {
      return res.status(400).json({ success: false, message: "缺少目标体重" });
    }
    getUserIdByTokenFromReq(req, (userId) => {
      if (!userId)
        return res.status(401).json({ success: false, message: "无效token" });
      db.query(
        "UPDATE users SET target_weight = ? WHERE id = ?",
        [targetWeight, userId],
        (err, result) => {
          if (err)
            return res
              .status(500)
              .json({ success: false, message: "数据库错误" });
          if (result.affectedRows > 0) {
            res.json({ success: true, message: "目标体重已保存" });
          } else {
            res.status(400).json({ success: false, message: "保存失败" });
          }
        }
      );
    });
  });

  return router;
};
