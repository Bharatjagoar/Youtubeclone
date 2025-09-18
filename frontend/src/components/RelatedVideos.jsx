import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { cleanText } from "./helperfunctions";
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

function RelatedVideos({ query }) {
    const { videoId } = useParams(); // automatically get current videoId
    const navigate = useNavigate();
    const [searchquery,setsearchquery]=useState(cleanText(query));
    const [relatedVideos, setRelatedVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        
        const fetchRelatedVideos = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log(query);
                console.log("hellow", searchquery)
                // fdsa
                // Step 1: Search related videos by videoId
                const relRes = await axios.get("https://www.googleapis.com/youtube/v3/search", {
                    params: {
                        part: "snippet",
                        q: cleanText(query),         // 🔍 This is your search term
                        type: "video",          // Only return videos
                        maxResults: 50,
                        key: API_KEY,
                    },
                });
                console.log("the res ", relRes)
                const ids = relRes.data.items.map((i) => i.id.videoId).filter(Boolean);

                if (ids.length === 0) {
                    setRelatedVideos([]);
                    return;
                }

                // Step 2: Fetch details (title, views, etc.)
                const relDet = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
                    params: {
                        part: "snippet,statistics",
                        id: ids.join(","),
                        key: API_KEY,
                    },
                });

                setRelatedVideos(
                    relDet.data.items.map((v) => ({
                        id: v.id,
                        title: v.snippet.title,
                        thumbnail: v.snippet.thumbnails.medium.url,
                        channel: v.snippet.channelTitle,
                        views: v.statistics.viewCount,
                    }))
                );
            } catch (err) {
                console.error("Error fetching related videos:", err);
                setError("Failed to load related videos.");
            } finally {
                setLoading(false);
            }
        };

        fetchRelatedVideos();
    }, [videoId,query]);

    if (loading) return <p className="text-gray-500">Loading related videos...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    if (relatedVideos.length === 0) {
        return <p className="text-gray-500">No related videos found.</p>;
    }

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
                        <p className="sidebar-title font-medium line-clamp-2">{v.title}</p>
                        <p className="sidebar-channel text-sm text-gray-600">{v.channel}</p>
                        <p className="sidebar-views text-xs text-gray-500">
                            {parseInt(v.views).toLocaleString()} views
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default RelatedVideos;
