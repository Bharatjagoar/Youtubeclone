import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import ChannelPage from "./pages/ChannelPage.jsx";
import VideoPlayer from "./pages/VideoPlayer.jsx";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="channel/:channelId" element={<ChannelPage />} />
          <Route path="video/:videoId" element={<VideoPlayer />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;