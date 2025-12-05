const express = require("express");
const router = express.Router();

router.post("/api/logout", (req, res) => {
  // 这里只是模拟，实际可清除 session/token
  res.json({ success: true, message: "已退出登录" });
});

module.exports = router;
