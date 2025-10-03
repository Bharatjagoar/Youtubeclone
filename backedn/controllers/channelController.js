// controllers/channelController.js
const Channel = require("../models/channel");
const User = require("../models/User");
const mongoose = require("mongoose");

module.exports.createChannel = async (req, res) => {
  const { name, description, avatarUrl, user, username } = req.body;
  // Accept user from body or from auth middleware
  const userId = user || (req.user && req.user._id);

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const exists = await Channel.findOne({ user: userId });
    if (exists) {
      return res.status(400).json({ message: "User already has a channel" });
    }

    const usernameExists = username ? await Channel.findOne({ username }) : null;
    if (usernameExists) {
      return res.status(400).json({ message: "This channel username is already taken" });
    }

    const channelcreated = await Channel.create({
      user: userId,
      name,
      username,
      description,
      avatarUrl,
    });

    // Update user with channel reference (if you have a User model)
    try {
      await User.findByIdAndUpdate(userId, { channel: channelcreated._id }, { new: true });
    } catch (e) {
      // not fatal — just log if User doesn't exist or update fails
      console.warn("Failed to update user with channel reference:", e.message);
    }

    return res.status(201).json({
      message: "Channel created successfully",
      channel: channelcreated,
    });
  } catch (error) {
    console.error("Error creating channel:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports.getChannelById = async (req, res) => {
  try {
    const channel = await Channel.findOne({ user: req.params.userId });
    if (!channel) return res.status(404).json({ message: "Channel not found" });
    res.json(channel);
  } catch (err) {
    console.error("getChannelById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.updateChannel = async (req, res) => {
  const { name, description } = req.body;
  try {
    const channel = await Channel.findById(req.params.channelId);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    // only owner may update
    if (!req.user || !channel.user.equals(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    channel.name = name ?? channel.name;
    channel.description = description ?? channel.description;
    await channel.save();

    res.json(channel);
  } catch (err) {
    console.error("updateChannel error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.deleteChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    if (!req.user || !channel.user.equals(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await channel.remove();
    res.json({ message: "Channel deleted successfully" });
  } catch (err) {
    console.error("deleteChannel error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Upload a video (stores { title, description, url } into channel.videos)
module.exports.uploadVideo = async (req, res) => {
  try {
    const { title, description = "", url, user } = req.body;
    const { channelId } = req.params;
    console.log(req.body, req.params)
    if (!title || !url) {
      return res.status(400).json({ message: "Title and video URL are required" });
    }

    const channel = await Channel.findById(channelId);
    console.log(channel);
    if (!channel) return res.status(404).json({ message: "Channel not found" });
    const objectId = String(channel.user);
    console.log(objectId, user);
    // ownership check: requireAuth middleware should set req.user
    if (!(objectId == user)) {
      console.log("Forbidden", user, objectId)
      return res.status(403).json({ message: "Forbidden" });
    }

    // push and save
    channel.videos.push({ title, description, url });
    await channel.save();

    // the saved subdocument (with _id) will be the last element
    const savedVideo = channel.videos[channel.videos.length - 1];

    return res.status(201).json({
      message: "Video uploaded successfully",
      video: savedVideo,
      channel,
    });
  } catch (err) {
    console.error("uploadVideo error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Fetch a single video by its DB subdocument _id
module.exports.getVideoById = async (req, res) => {
  try {
    const { videoId } = req.params;

    // find the channel containing that video (projection brings matched subdoc)
    const channel = await Channel.findOne(
      { "videos._id": videoId },
      { "videos.$": 1, name: 1, username: 1, avatarUrl: 1, user: 1 }
    );

    if (!channel || !channel.videos || channel.videos.length === 0) {
      return res.status(404).json({ message: "Video not found" });
    }

    const video = channel.videos[0];
    return res.json({
      video,
      channel: {
        _id: channel._id,
        name: channel.name,
        username: channel.username,
        avatarUrl: channel.avatarUrl,
        user: channel.user,
      },
    });
  } catch (err) {
    console.error("getVideoById error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Delete a video from a channel
module.exports.deleteVideo = async (req, res) => {
  try {
    const { channelId, videoId ,userid} = req.params;

    // Find the channel
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const objectId = String(channel.user);
    console.log(objectId, userid);
    // ownership check: requireAuth middleware should set req.user
    if (!(objectId == userid)) {
      console.log("Forbidden", userid, objectId)
      return res.status(403).json({ message: "Forbidden" });
    }

    // Find the video index in the array
    const videoIndex = channel.videos.findIndex(
      (vid) => vid._id.toString() === videoId
    );
    if (videoIndex === -1) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Remove it
    channel.videos.splice(videoIndex, 1);
    await channel.save();

    return res.json({
      message: "Video deleted successfully",
      channel,
    });
  } catch (err) {
    console.error("deleteVideo error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
