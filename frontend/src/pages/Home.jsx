// src/pages/Home.jsx
import React from "react";
import { useSelector } from "react-redux";
import TrendingGrid from "../components/TrendingGrid";
import SearchResults from "../components/SearchResults";
import "./Home.css";

const Home = () => {
  const { isResult } = useSelector((state) => state.search);
  console.log(isResult);
  return (
    <div className="home">
      {isResult ? <SearchResults /> : <TrendingGrid />}
    </div>
  );
};

export default Home;