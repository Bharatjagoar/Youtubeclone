const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: "" },
  url:         { type: String, required: true },   // e.g. cloudinary/video URL
  thumbnail:   { type: String },                   // optional thumbnail URL
  createdAt:   { type: Date, default: Date.now },
});

const ChannelSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,               // each user has one channel
  },
  name:        { type: String, required: true },
  username : {type : String },
  description: { type: String },
  avatarUrl:   { type: String },
  videos:      [VideoSchema],
  createdAt:   { type: Date, default: Date.now },
});

const channel = mongoose.model("Channel", ChannelSchema);
module.exports =  channel;
