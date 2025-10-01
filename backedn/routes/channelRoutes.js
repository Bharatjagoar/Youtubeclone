const express = require("express");
const channelcontroller = require("../controllers/channelController");

const router = express.Router();

// Create a new channel (authenticated)
router.post("/", channelcontroller.createChannel);

// Get channel by ID (public)
router.get("/:channelId",channelcontroller.getChannelById);

// Update channel details (authenticated, owner only)
router.put("/:channelId", channelcontroller.updateChannel);

// Delete channel (authenticated, owner only)
router.delete("/:channelId", channelcontroller.deleteChannel);

module.exports = router;