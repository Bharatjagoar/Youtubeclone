const express = require("express");
const router = express.Router();
const {
  postComment,
  replyToComment,
  getCommentsByVideoId,
} = require("../controllers/commentController");

router.post("/", postComment);
router.post("/reply/:parentId", replyToComment);
router.get("/:videoId", getCommentsByVideoId); // ✅ NEW

module.exports = router;
