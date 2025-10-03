const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const commentRoutes = require("./routes/commentRoutes");
const channelRoutes = require("./routes/channelRoutes")

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3000", // your frontend origin
  credentials: true               // allow cookies to be sent
}));
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/comments", commentRoutes);
app.use("/channels", channelRoutes);

// Connect DB and start server
connectDB();

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});