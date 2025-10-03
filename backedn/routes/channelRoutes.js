const express = require("express");
const channelcontroller = require("../controllers/channelController");

const router = express.Router();

// Create a new channel (authenticated)
router.post("/", channelcontroller.createChannel);

// Get channel by ID (public)
router.get("/user/:userId",channelcontroller.getChannelById);

// Update channel details (authenticated, owner only)
router.put("/:channelId", channelcontroller.updateChannel);

// Delete channel (authenticated, owner only)
router.delete("/:channelId", channelcontroller.deleteChannel);

// Upload a new video to a channel
router.post("/:channelId/videos", channelcontroller.uploadVideo);

// Delete a video from a channel
router.delete("/:channelId/videos/:videoId/user/:userid", channelcontroller.deleteVideo);


module.exports = router;