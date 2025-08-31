import React from "react";
import { FaYoutube, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const nav = useNavigate();
  const ReturnHome = ()=>{
    nav("/")
  }
  return (
    <header className="header">
      <div className="logo-combo" onClick={()=>{ReturnHome()}}>
        <FaYoutube size={24} color="red" className="youtube-icon" />
        <span className="logo-text">YouTube</span>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search"
          className="search-bar"
        />
        <button className="search-btn" aria-label="Search">
          <FaSearch />
        </button>
      </div>

      <button className="signin-btn">Sign In</button>
    </header>
  );
};

export default Header;