// components/Layout.jsx
import React from "react";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import Categories from "./Categories.jsx";
import { Outlet, useLocation } from "react-router-dom";

function Layout() {
  const location = useLocation();
  const showCategories = location.pathname === "/"; // Only show on homepage

  return (
    <div className="app">
      <div className="Navbar">
        <Header />
      </div>
      <div className="Content">
        <Sidebar />
        <div className="categoriesContainer">
          {showCategories && <Categories />}
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Layout;