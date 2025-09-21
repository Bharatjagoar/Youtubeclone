// src/components/RelatedVideos.jsx

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { cleanText } from "./helperfunctions";
import { formatCount } from "./helperfunctions";

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

function RelatedVideos({ query }) {
  const { videoId } = useParams();
  const navigate = useNavigate();
    console.log("related component rendered !! ");
  // Cleaned search term
  const searchQuery = cleanText(query);

  // State for videos, paging, loading, error
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sentinel ref for infinite scroll
  const sentinelRef = useRef(null);

  // Fetch one page of related videos
  const loadRelatedVideos = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      // 1. Search endpoint
      const searchParams = {
        part: "snippet",
        q: searchQuery,
        type: "video",
        maxResults: 10,
        key: API_KEY,
      };
      if (nextPageToken) {
        searchParams.pageToken = nextPageToken;
      }

      const searchRes = await axios.get(
        "https://www.googleapis.com/youtube/v3/search",
        { params: searchParams }
      );

      const { items: searchItems, nextPageToken: newToken } =
        searchRes.data;

      // Extract video IDs
      const ids = searchItems
        .map((item) => item.id.videoId)
        .filter(Boolean);

      if (ids.length === 0) {
        setNextPageToken(null);
        return;
      }

      // 2. Videos endpoint for details
      const detailsRes = await axios.get(
        "https://www.googleapis.com/youtube/v3/videos",
        {
          params: {
            part: "snippet,statistics",
            id: ids.join(","),
            key: API_KEY,
          },
        }
      );

      const newVideos = detailsRes.data.items.map((v) => ({
        id: v.id,
        title: v.snippet.title,
        thumbnail: v.snippet.thumbnails.medium.url,
        channel: v.snippet.channelTitle,
        views: v.statistics.viewCount,
      }));

      // Append new videos & update nextPageToken
      setRelatedVideos((prev) => [...prev, ...newVideos]);
      setNextPageToken(newToken || null);
    } catch (err) {
      console.error("Error fetching related videos:", err);
      setError("Failed to load related videos.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, nextPageToken, loading]);

  // Reset and load first page when query or videoId changes
  useEffect(() => {
    setRelatedVideos([]);
    setNextPageToken(null);
    setError(null);
    loadRelatedVideos();
  }, [searchQuery, videoId]);

  // IntersectionObserver to trigger loadRelatedVideos()
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          nextPageToken
        ) {
          loadRelatedVideos();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadRelatedVideos, nextPageToken]);

  // Render states
  if (error)
    return <p className="text-red-500">{error}</p>;

  return (
    <div className="related-videos">
      <h4 className="font-semibold mb-2">Up Next</h4>

      {relatedVideos.map((v) => (
        <div
          key={v.id}
          className="sidebar-card cursor-pointer flex mb-3 hover:bg-gray-100 rounded-lg p-2 transition"
          onClick={() => navigate(`/video/${v.id}`)}
        >
          <img
            src={v.thumbnail}
            alt={v.title}
            className="w-40 h-24 object-cover rounded-lg"
          />
          <div className="ml-3 flex flex-col justify-between">
            <p className="sidebar-title font-medium line-clamp-2">
              {v.title}
            </p>
            <p className="sidebar-channel text-sm text-gray-600">
              {v.channel}
            </p>
            <p className="sidebar-views text-xs text-gray-500">
              {formatCount(parseInt(v.views))} views
            </p>
          </div>
        </div>
      ))}

      {/* Sentinel triggers more loading */}
      <div
        ref={sentinelRef}
        className="sentinel text-center py-4"
      >
        {loading && (
          <p className="text-gray-500">
            Loading more videos…
          </p>
        )}
        {!nextPageToken && !loading && (
          <p className="text-gray-500">
            No more videos
          </p>
        )}
      </div>
    </div>
  );
}

export default RelatedVideos;
