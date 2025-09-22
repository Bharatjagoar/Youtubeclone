// src/components/Categories.jsx
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  setQuery,
  clearResults,
  fetchSearchResults,
} from "../redux/searchSlice"; // adjust path if needed
import "./Categories.css";

const categories = [
  "All",
  "Music",
  "Gaming",
  "Sports",
  "News",
  "Podcasts",
  "Movies",
  "Web Development",
  "Dance",
  "Comedy",
  "Technology",
  "Cricket",
  "Football",
  "Live",
  "Fitness",
  "Travel",
  "Cooking",
  "Education",
  "Motivation",
  "DIY",
  "Science",
  "Fashion",
  "Beauty",
  "History",
  "Anime",
  "Cars",
  "Finance",
  "Politics",
  "Nature",
  "Animals",
];

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedCategory === "All") {
      // Show TrendingGrid
      dispatch(clearResults());
    } else {
      // Trigger a search for the chosen category
      dispatch(setQuery(selectedCategory));
      dispatch(fetchSearchResults(selectedCategory));
    }
  }, [selectedCategory, dispatch]);

  return (
    <div className="categories">
      {categories.map((cat, idx) => (
        <button
          key={idx}
          className={`category-btn ${
            selectedCategory === cat ? "selected" : ""
          }`}
          onClick={() => setSelectedCategory(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default Categories;
