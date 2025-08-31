import React from "react";
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
    "Animals"
];

const Categories = () => {
    return (
        <div className="categories">
            {categories.map((cat, index) => (
                <button key={index} className="category-btn">
                    {cat}
                </button>
            ))}
        </div>
    );
};

export default Categories;
