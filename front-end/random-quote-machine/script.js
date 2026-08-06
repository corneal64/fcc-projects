const quoteEl = document.getElementById("quote");
const authorEl = document.getElementById("author");
const newQuoteBtn = document.getElementById("new-quote");
const tweetLink = document.getElementById("tweet-link");
const loadingEl = document.getElementById("quote-loading");

// --- Local fallback quotes (used when API fails) ---
const fallbackQuotes = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    text: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
  },
  {
    text: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde",
  },
  {
    text: "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.",
    author: "Albert Einstein",
  },
  { text: "So many books, so little time.", author: "Frank Zappa" },
  {
    text: "A room without books is like a body without a soul.",
    author: "Marcus Tullius Cicero",
  },
  {
    text: "You must be the change you wish to see in the world.",
    author: "Mahatma Gandhi",
  },
  {
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
  },
  {
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
  },
  {
    text: "Everything you've ever wanted is on the other side of fear.",
    author: "George Addair",
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
  },
  { text: "The purpose of our lives is to be happy.", author: "Dalai Lama" },
  { text: "Get busy living or get busy dying.", author: "Stephen King" },
  {
    text: "Life is what happens when you're busy making other plans.",
    author: "John Lennon",
  },
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb",
  },
];

// --- State ---
let currentQuote = null;
let isLoading = false;

// --- Helpers ---
function randomIndex(arr) {
  return Math.floor(Math.random() * arr.length);
}

function getColor() {
  const colors = [
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#2563eb",
    "#7c3aed",
    "#9333ea",
  ];
  return colors[randomIndex(colors)];
}

function setLoading(loading) {
  isLoading = loading;
  newQuoteBtn.disabled = loading;
  if (loading) {
    loadingEl.style.display = "inline";
  } else {
    loadingEl.style.display = "none";
  }
}

function updateTweetLink() {
  if (!currentQuote) return;
  const text = `${currentQuote.text} — ${currentQuote.author}`;
  tweetLink.href =
    "https://twitter.com/intent/tweet?text=" +
    encodeURIComponent(text) +
    "&related=corneal64";
}

function updateBackground(color) {
  document.body.style.background = `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -40)} 100%)`;
}

function adjustColor(hex, amount) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function displayQuote(quote) {
  currentQuote = quote;
  const color = getColor();

  // Fade out
  quoteEl.classList.add("fade-out");
  authorEl.style.opacity = "0";

  setTimeout(() => {
    quoteEl.innerHTML = quote.text;
    quoteEl.classList.remove("fade-out", "fade-in");
    authorEl.textContent = quote.author;

    // Trigger reflow for animation restart
    void quoteEl.offsetWidth;

    // Fade in
    quoteEl.classList.add("fade-in");
    authorEl.style.opacity = "1";

    // Update accent color
    document.documentElement.style.setProperty("--accent", color);
    document.documentElement.style.setProperty(
      "--accent-dark",
      adjustColor(color, -30),
    );
    document.documentElement.style.setProperty(
      "--accent-soft",
      hexToRgba(color, 0.12),
    );

    updateBackground(color);
    updateTweetLink();
    setLoading(false);
  }, 300);
}

function hexToRgba(hex, alpha) {
  const num = parseInt(hex.slice(1), 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// --- Fetching ---
async function fetchQuote() {
  setLoading(true);

  try {
    const response = await fetch("https://dummyjson.com/quotes/random");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    displayQuote({
      text: data.quote,
      author: data.author,
    });
  } catch {
    // Fallback to local quotes
    const quote = fallbackQuotes[randomIndex(fallbackQuotes)];
    displayQuote(quote);
  }
}

// --- Event Listeners ---
newQuoteBtn.addEventListener("click", fetchQuote);

// --- Init ---
fetchQuote();
