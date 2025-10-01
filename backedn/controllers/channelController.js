// const Channel = require("../models/channel");
const Channel = require("../models/channel");


const User = require("../models/User");

module.exports.createChannel = async (req, res) => {
  const { name, description, avatarUrl, user, username } = req.body;

  if (!user) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Prevent duplicate channel per user
    const exists = await Channel.findOne({ user });
    if (exists) {
      return res.status(400).json({ message: "User already has a channel" });
    }

    // Prevent duplicate username (handle)
    const usernameExists = await Channel.findOne({ username });
    if (usernameExists) {
      return res
        .status(400)
        .json({ message: "This channel username is already taken" });
    }

    // Create channel
    const channelcreated = await Channel.create({
      user,
      name,
      username,
      description,
      avatarUrl,
    });

    // Update user with channel reference
    const updatedUser = await User.findByIdAndUpdate(
      user,
      { channel: channelcreated._id },
      { new: true }
    ).populate("channel");

    return res.status(201).json({
      message: "Channel created successfully",
      channel: channelcreated,
      user: updatedUser, // 👈 return updated user as well
    });
  } catch (error) {
    console.error("Error creating channel:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};



// 2) Get Channel by ID
module.exports.getChannelById = async (req, res) => {
  const channel = await Channel.findById(req.params.channelId);
  if (!channel) {
    return res.status(404).json({ message: "Channel not found" });
  }
  res.json(channel);
};

// 3) Update Channel (name & description)
module.exports.updateChannel = async (req, res) => {
  const { name, description } = req.body;
  const channel = await Channel.findById(req.params.channelId);

  if (!channel) {
    return res.status(404).json({ message: "Channel not found" });
  }
  if (!channel.user.equals(req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  channel.name = name ?? channel.name;
  channel.description = description ?? channel.description;
  await channel.save();

  res.json(channel);
};

// 4) Delete Channel
module.exports.deleteChannel = async (req, res) => {
  const channel = await Channel.findById(req.params.channelId);

  if (!channel) {
    return res.status(404).json({ message: "Channel not found" });
  }
  if (!channel.user.equals(req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await channel.remove();
  res.json({ message: "Channel deleted successfully" });
};
