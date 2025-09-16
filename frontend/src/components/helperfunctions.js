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

function cleanText(text) {
  // Regular expression to match hashtags and a broad range of emojis
  // It matches words starting with # and common Unicode emoji ranges.
  const emojiAndHashtagRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83e[\udc00-\udfff])|#\w+/g;

  // Replace all matches with an empty string
  const cleanedText = text.replace(emojiAndHashtagRegex, '').trim();

  return cleanedText;
}

export {formatCount,formatRelativeDate,cleanText};