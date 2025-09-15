const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");

router.post("/", commentController.postComment); // post top-level comment
router.post("/:parentId/replies", commentController.replyToComment); // post reply
router.get("/video/:videoId", commentController.getCommentsByVideoId); // get all top-level comments with replies
router.delete("/:commentId", commentController.deleteCommentWithReplies);

module.exports = router;
