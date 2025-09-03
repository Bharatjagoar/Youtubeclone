// routes/commentRoutes.js
const express = require("express");
const router = express.Router();
const { postComment, replyToComment } = require("../controllers/commentController");

router.post("/", postComment);
router.post("/reply/:parentId", replyToComment);

module.exports = router;