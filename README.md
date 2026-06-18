# 🎬 MOVIESTOWN

> A premium Netflix-style movie discovery platform with smart content curation, built with TMDB API.

![MOVIESTOWN Banner](https://via.placeholder.com/1200x400/0f172a/e50914?text=MOVIESTOWN)

[![GitHub stars](https://img.shields.io/github/stars/alphonsbiju7/moviestown)](https://github.com/alphonsbiju7/moviestown/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/alphonsbiju7/moviestown)](https://github.com/alphonsbiju7/moviestown/network)
[![GitHub issues](https://img.shields.io/github/issues/alphonsbiju7/moviestown)](https://github.com/alphonsbiju7/moviestown/issues)
[![GitHub last commit](https://img.shields.io/github/last-commit/alphonsbiju7/moviestown)](https://github.com/alphonsbiju7/moviestown/commits/main)
[![Vercel](https://img.shields.io/badge/deployed-vercel-000000)](https://moviestown.vercel.app)

---

## ✨ Features

### 🎯 Smart Content Curation
- **Auto-Sliding Hero Section** – Netflix-style automatic slideshow with 6 handpicked titles
- **4+2 Content Strategy** – Shows 4 Malayalam movies + 2 other language movies in hero
- **Smart Sorting** – Prioritizes newest releases and highest-rated content
- **Trending & Featured Badges** – Visual indicators for trending, featured, and regional content

### 🔍 Discovery & Search
- **Global Search** – Search movies worldwide with TMDB-backed results
- **Indian & Mollywood Priority** – Prioritized discovery for Indian cinema and Malayalam films
- **Genre Filtering** – Browse content by genre chips for easy discovery
- **Instant Results** – Real-time search with 300ms debounce for smooth experience

### 🖼️ Movie Cards & Details
- **Poster-Heavy Cards** – Beautiful movie cards with ratings, genres, and release dates
- **Region Labels** – Shows Mollywood 🇮🇳, Indian 🇮🇳, or Global 🌍 tags
- **Detailed Modal View** – Full details including director, runtime, country, awards, and cast
- **Trailer Search** – Quick YouTube trailer search directly from detail view

### ⭐ User Features
- **Favorites System** – Save your favorite movies locally in browser storage
- **Theme Support** – Persistent dark/light theme with smooth transitions
- **Responsive Design** – Optimized for all devices from mobile to desktop

### 🎨 UI/UX
- **Netflix-Inspired Design** – Premium dark theme with glassmorphism effects
- **Smooth Animations** – Fade transitions, hover effects, and loading states
- **Interactive Hero** – Pause-on-hover slideshow with dot navigation
- **Professional Footer** – GitHub & LinkedIn links with hover effects

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| HTML5 | Semantic structure |
| CSS3 | Styling, Animations, Responsive Grid |
| JavaScript (ES6+) | Logic, API Integration, DOM Manipulation |
| TMDB API | Movie & Series Data |
| LocalStorage | Favorites & Theme Persistence |
| Vercel | Deployment & Hosting |

---

## 📁 Project Structure

moviestown/
├── index.html # Main page structure
├── style.css # Complete styling & themes
├── script.js # TMDB API integration & logic
├── README.md # Documentation


---

## 🔑 API Configuration

This app uses TMDB API with a pre-configured key for quick local use.

> **Note:** The API key is included for demo purposes. For production, use environment variables.

### Get Your Own API Key
1. Visit [TMDB](https://www.themoviedb.org/settings/api)
2. Sign up for a free account
3. Request an API key
4. Replace `TMDB_API_KEY` in `script.js`

---

## 🧪 How to Run Locally

### Option 1: Direct Open

# Just open index.html in your browser
open index.html

Option 2: Local Server (Recommended)

# Using Python 3
python -m http.server 8000

# Using Node.js (if you have live-server)
npx live-server

# Then open http://localhost:8000


Option 3: Clone & Run

git clone https://github.com/alphonsbiju7/moviestown.git
cd moviestown
open index.html



🎯 How It Works
Hero Section Logic
Fetches top movies from TMDB

Filters Malayalam movies (isMollywood = true)

Sorts by release year (newest first) and rating (highest first)

Selects 4 Malayalam movies + 2 other language movies

Auto-slides through selected movies every 5 seconds

Shows badges (🔥 Trending / ⭐ Featured) based on rating

Search Logic
User types in search bar

300ms debounce prevents excessive API calls

Fetches results from TMDB search endpoint

Prioritizes Indian and Malayalam results

Updates both hero slider and movie grid

Favorites Logic
Click Save on any movie card

Stored in browser localStorage

Persists across sessions

Syncs with UI instantly

📊 API Endpoints Used
text
GET /3/discover/movie              # Popular movies
GET /3/search/movie                # Search movies
GET /3/movie/{id}                  # Movie details
GET /3/movie/{id}/credits          # Movie cast & crew
GET /3/genre/movie/list            # Genre list
🤝 Contributing
Fork the repository

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📝 License
MIT License - Free to use and modify.

👨‍💻 Author
Alphons Biju

GitHub: @alphonsbiju7

LinkedIn: Alphons Biju

Email: alphonsbiju.tech@gmail.com

🙏 Acknowledgements
TMDB for providing the movie database

Font Awesome for icons

Google Fonts for typography

Vercel for hosting

📊 Project Stats
https://img.shields.io/github/stars/alphonsbiju7/moviestown
https://img.shields.io/github/forks/alphonsbiju7/moviestown
https://img.shields.io/github/issues/alphonsbiju7/moviestown
https://img.shields.io/github/last-commit/alphonsbiju7/moviestown

<div align="center"> Made with ❤️ by Alphons Biju </div> ```


