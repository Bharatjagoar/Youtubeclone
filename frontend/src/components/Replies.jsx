import Avatar from "./Avatar";


const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

const formatCount = (num) => {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return num?.toString();
};

const formatRelativeDate = (dateString) => {
    const published = new Date(dateString);
    const now = new Date();
    const diff = now - published;
    const sec = Math.floor(diff / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
    const mon = Math.floor(day / 30);
    const yr = Math.floor(day / 365);

    if (yr > 0) return `${yr} year${yr > 1 ? "s" : ""} ago`;
    if (mon > 0) return `${mon} month${mon > 1 ? "s" : ""} ago`;
    if (day > 0) return `${day} day${day > 1 ? "s" : ""} ago`;
    if (hr > 0) return `${hr} hour${hr > 1 ? "s" : ""} ago`;
    if (min > 0) return `${min} minute${min > 1 ? "s" : ""} ago`;
    return "Just now";
};

// ✅ Recursive reply renderer


export default function Replies({ replies, activeReplyBox, setActiveReplyBox, replyText, setReplyText, handlePostReply }) {
    if (!replies || replies.length === 0) return null;

    return (
        <div className="replies">
            {replies.map((reply) => (
                <div key={reply._id} className="comment reply">
                    <Avatar username={reply.author} avatarColor={reply.avatarColor} size={28} />
                    <div className="comment-body">
                        <div className="comment-header">
                            <span className="comment-author">{reply.author}</span>
                            <span className="comment-time">{formatRelativeDate(reply.createdAt)}</span>
                        </div>
                        <p className="comment-text">{reply.text}</p>
                        <div className="comment-actions">
                            <button
                                className="reply-btn"
                                onClick={() =>
                                    setActiveReplyBox((prev) => (prev === reply._id ? null : reply._id))
                                }
                            >
                                Reply
                            </button>
                        </div>

                        {activeReplyBox === reply._id && (
                            <div className="reply-box">
                                <textarea
                                    className="reply-input"
                                    placeholder="Reply..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                />
                                <button className="reply-post-btn" onClick={() => handlePostReply(reply._id)}>
                                    Post Reply
                                </button>
                            </div>
                        )}

                        {/* Recursive replies */}
                        <Replies
                            replies={reply.replies}
                            activeReplyBox={activeReplyBox}
                            setActiveReplyBox={setActiveReplyBox}
                            replyText={replyText}
                            setReplyText={setReplyText}
                            handlePostReply={handlePostReply}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}