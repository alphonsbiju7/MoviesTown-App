const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const TMDB_API_KEY = 'd3b7674e510faeafe20ff0e7ce98303d';
const SAVED_KEY = 'moviestown_saved_movies';
const DEFAULT_POSTER = 'https://images.unsplash.com/photo-1489599992891-b5c6f1e9f26b?auto=format&fit=crop&w=900&q=80';
const INDIAN_LANGUAGES = new Set(['ml', 'hi', 'ta', 'te', 'kn', 'bn', 'mr', 'pa', 'gu', 'or', 'as']);

const movieGrid = document.getElementById('movieGrid');
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearBtn');
const navButtons = document.querySelectorAll('.top-links .link-btn');
const genreChips = document.getElementById('genreChips');
const resultsTitle = document.getElementById('resultsTitle');
const resultCount = document.getElementById('resultCount');
const statusLine = document.getElementById('statusLine');
const heroSection = document.getElementById('heroSection');
const heroTitle = document.getElementById('heroTitle');
const heroMeta = document.getElementById('heroMeta');
const heroOverview = document.getElementById('heroOverview');
const heroDetailsBtn = document.getElementById('heroDetailsBtn');
const watchNowBtn = document.getElementById('watchNowBtn');
const movieModal = document.getElementById('movieModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalPoster = document.getElementById('modalPoster');
const modalTitle = document.getElementById('modalTitle');
const modalMeta = document.getElementById('modalMeta');
const modalOverview = document.getElementById('modalOverview');
const modalDirector = document.getElementById('modalDirector');
const modalRuntime = document.getElementById('modalRuntime');
const modalCountry = document.getElementById('modalCountry');
const modalAwards = document.getElementById('modalAwards');
const modalPlayBtn = document.getElementById('modalPlayBtn');
const modalSaveBtn = document.getElementById('modalSaveBtn');

const fallbackCatalog = [
  { id: 1, title: 'Drishyam', year: '2013', poster: DEFAULT_POSTER, backdrop: DEFAULT_POSTER, genreNames: ['Thriller', 'Drama'], originalLanguage: 'ml', country: 'India', rating: 8.2, overview: 'A family is pushed into a tense battle of secrets, survival, and strategy after a shocking incident.' },
  { id: 2, title: 'The Dark Knight', year: '2008', poster: DEFAULT_POSTER, backdrop: DEFAULT_POSTER, genreNames: ['Action', 'Crime'], originalLanguage: 'en', country: 'USA', rating: 9.0, overview: 'Batman faces chaos when the Joker turns Gotham into a city of fear and impossible choices.' },
  { id: 3, title: 'Premam', year: '2015', poster: DEFAULT_POSTER, backdrop: DEFAULT_POSTER, genreNames: ['Romance', 'Drama'], originalLanguage: 'ml', country: 'India', rating: 8.3, overview: 'A coming-of-age romance that follows love, heartbreak, and youth across different phases of life.' }
];

const state = {
  catalog: [],
  filtered: [],
  selectedGenre: 'All',
  searchTerm: '',
  currentHero: null,
  activeMovieId: null,
  genreMap: new Map(),
  detailsCache: new Map(),
  savedIds: new Set(loadSavedMovies()),
  searchTimer: null
};

function loadSavedMovies() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSavedMovies() {
  localStorage.setItem(SAVED_KEY, JSON.stringify([...state.savedIds]));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getApiKey() {
  return TMDB_API_KEY;
}

function setStatus(message) {
  statusLine.textContent = message;
}

function setLoadingGrid(message) {
  movieGrid.innerHTML = `
    <div class="loading-state">
      <div class="loading-stack">
        <div class="loader"></div>
        <p>${escapeHtml(message)}</p>
      </div>
    </div>
  `;
}

function setActiveNav(section) {
  navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.nav === section);
  });
}

function scrollToHero() {
  heroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function scrollToCatalog() {
  document.getElementById('movieGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetToAllMovies() {
  state.selectedGenre = 'All';
  state.searchTerm = '';
  searchInput.value = '';
  buildGenreChips();
  applyFilters();
}

function tmdbUrl(path, params = {}) {
  const query = new URLSearchParams({ api_key: getApiKey(), language: 'en-US', ...params });
  return `${TMDB_BASE}${path}?${query.toString()}`;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

function mapGenreIds(ids = []) {
  return ids.map((id) => state.genreMap.get(id)).filter(Boolean);
}

function getDirector(movie) {
  const crewDirector = movie.credits?.crew?.find((member) => member.job === 'Director');
  return movie.director || crewDirector?.name || '';
}

function normalizeTmdbMovie(movie) {
  const year = movie.release_date ? movie.release_date.slice(0, 4) : 'TBA';
  const countries = movie.production_countries?.map((entry) => entry.iso_3166_1).filter(Boolean) || [];
  const originalLanguage = movie.original_language || '';
  const genreNames = movie.genres?.length ? movie.genres.map((genre) => genre.name) : mapGenreIds(movie.genre_ids);
  const isMollywood = originalLanguage === 'ml';
  const isIndian = isMollywood || INDIAN_LANGUAGES.has(originalLanguage) || countries.includes('IN');

  return {
    id: movie.id,
    title: movie.title || movie.name || 'Untitled',
    year,
    poster: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : DEFAULT_POSTER,
    backdrop: movie.backdrop_path ? `${TMDB_IMAGE_BASE}${movie.backdrop_path}` : DEFAULT_POSTER,
    genreNames: genreNames.length ? genreNames : ['Movie'],
    originalLanguage,
    country: countries.length ? countries.join(', ') : 'International',
    rating: Number(movie.vote_average) || 0,
    overview: movie.overview || 'No overview available.',
    runtime: movie.runtime ? `${movie.runtime} min` : '',
    director: getDirector(movie),
    awards: movie.awards || '',
    cast: movie.credits?.cast?.slice(0, 4).map((member) => member.name).join(', ') || '',
    isMollywood,
    isIndian
  };
}

function buildGenreChips() {
  const genreSet = new Set();
  state.catalog.forEach((movie) => movie.genreNames.forEach((genre) => genreSet.add(genre)));

  const chipList = ['All', 'Mollywood', 'Indian', ...Array.from(genreSet).slice(0, 9)];

  genreChips.innerHTML = chipList
    .map((genre) => `<button class="genre-chip ${genre === state.selectedGenre ? 'active' : ''}" data-genre="${escapeHtml(genre)}">${escapeHtml(genre)}</button>`)
    .join('');

  genreChips.querySelectorAll('.genre-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.selectedGenre = chip.dataset.genre || 'All';
      buildGenreChips();
      applyFilters();
    });
  });
}

function sortPriority(a, b) {
  if (a.isMollywood !== b.isMollywood) {
    return a.isMollywood ? -1 : 1;
  }

  if (a.isIndian !== b.isIndian) {
    return a.isIndian ? -1 : 1;
  }

  return b.rating - a.rating;
}

function setHero(movie) {
  if (!movie) {
    return;
  }

  state.currentHero = movie;
  heroSection.style.backgroundImage = `url('${movie.backdrop || movie.poster || DEFAULT_POSTER}')`;
  heroTitle.textContent = movie.title;
  heroMeta.textContent = `${movie.year} • ${movie.genreNames.slice(0, 3).join(' • ')} • IMDb ${movie.rating.toFixed(1)}`;
  heroOverview.textContent = movie.overview;
}

function handleNav(section) {
  setActiveNav(section);

  if (section === 'home') {
    resetToAllMovies();
    scrollToHero();
    return;
  }

  if (section === 'movies') {
    resetToAllMovies();
    scrollToCatalog();
    return;
  }

  if (section === 'series') {
    setStatus('Series browsing is not available yet, so showing the movie catalog instead.');
    resetToAllMovies();
    scrollToCatalog();
  }
}

function movieCard(movie) {
  const savedLabel = state.savedIds.has(movie.id) ? 'Saved' : 'Save';
  const regionLabel = movie.isMollywood ? 'Mollywood' : movie.isIndian ? 'Indian' : 'Global';

  return `
    <article class="movie-card" data-id="${movie.id}" tabindex="0" role="button" aria-label="Open ${escapeHtml(movie.title)} details">
      <div class="poster-wrap">
        <img class="movie-poster" src="${escapeHtml(movie.poster)}" alt="${escapeHtml(movie.title)}" loading="lazy">
        <span class="badge">IMDb ${movie.rating.toFixed(1)}</span>
      </div>
      <div class="movie-info">
        <h4 class="movie-title">${escapeHtml(movie.title)}</h4>
        <div class="movie-meta">
          <span>${escapeHtml(movie.year)}</span>
          <span>${escapeHtml(regionLabel)}</span>
        </div>
        <div class="movie-actions-row">
          <span class="mini-note">${escapeHtml(savedLabel)}</span>
        </div>
      </div>
    </article>
  `;
}

function renderMovies(list) {
  if (!list.length) {
    movieGrid.innerHTML = `
      <div class="no-results">
        <div>🎞️</div>
        <h4>No titles found</h4>
        <p>Try another search or remove the filter.</p>
      </div>
    `;
    resultCount.textContent = '0 titles';
    return;
  }

  movieGrid.innerHTML = list.map(movieCard).join('');
  resultCount.textContent = `${list.length} title${list.length === 1 ? '' : 's'}`;

  movieGrid.querySelectorAll('.movie-card').forEach((card) => {
    const open = () => {
      const movie = state.filtered.find((item) => item.id === Number(card.dataset.id));
      if (movie) {
        openMovieDetails(movie);
      }
    };

    card.addEventListener('click', open);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    });
  });
}

function applyFilters(initial = false) {
  let filtered = [...state.catalog];
  const query = state.searchTerm.trim().toLowerCase();

  if (state.selectedGenre === 'Mollywood') {
    filtered = filtered.filter((movie) => movie.isMollywood);
  } else if (state.selectedGenre === 'Indian') {
    filtered = filtered.filter((movie) => movie.isIndian);
  } else if (state.selectedGenre !== 'All') {
    filtered = filtered.filter((movie) => movie.genreNames.includes(state.selectedGenre));
  }

  if (query) {
    filtered = filtered.filter((movie) => [movie.title, movie.year, movie.country, movie.genreNames.join(' '), movie.overview].join(' ').toLowerCase().includes(query));
  }

  filtered.sort(sortPriority);
  state.filtered = filtered;

  if (query) {
    resultsTitle.textContent = 'Search Results';
    setStatus(`Showing ${filtered.length} result${filtered.length === 1 ? '' : 's'} for "${state.searchTerm.trim()}"`);
  } else if (state.selectedGenre === 'Mollywood') {
    resultsTitle.textContent = 'Mollywood Picks';
    setStatus('Showing Mollywood titles first');
  } else if (state.selectedGenre === 'Indian') {
    resultsTitle.textContent = 'Indian Cinema';
    setStatus('Showing Indian titles first');
  } else {
    resultsTitle.textContent = 'Trending In MOVIESTOWN';
    setStatus(`Browsing ${filtered.length} movies`);
  }

  renderMovies(filtered);

  if (initial || !state.currentHero || !filtered.some((movie) => movie.id === state.currentHero.id)) {
    setHero(filtered[0] || state.catalog[0]);
  }
}

async function fetchCatalogFromTmdb() {
  setStatus('Connecting to TMDB...');
  setLoadingGrid('Loading movie catalog...');

  const genreList = await fetchJson(tmdbUrl('/genre/movie/list')).catch(() => ({ genres: [] }));
  state.genreMap = new Map((genreList.genres || []).map((genre) => [genre.id, genre.name]));

  const requests = [
    fetchJson(tmdbUrl('/discover/movie', { sort_by: 'popularity.desc', with_original_language: 'ml', page: '1' })),
    fetchJson(tmdbUrl('/discover/movie', { sort_by: 'popularity.desc', with_origin_country: 'IN', page: '1' })),
    fetchJson(tmdbUrl('/discover/movie', { sort_by: 'popularity.desc', page: '1' }))
  ];

  const responses = await Promise.allSettled(requests);
  const merged = [];
  const seen = new Set();

  for (const response of responses) {
    if (response.status !== 'fulfilled') {
      continue;
    }

    for (const movie of response.value.results || []) {
      if (seen.has(movie.id)) {
        continue;
      }
      seen.add(movie.id);
      merged.push(normalizeTmdbMovie(movie));
    }
  }

  state.catalog = merged.length ? merged : fallbackCatalog;
  buildGenreChips();
  applyFilters(true);
}

async function searchTmdbMovies(query) {
  setStatus(`Searching worldwide movies for "${query}"...`);
  setLoadingGrid(`Searching for "${query}"...`);

  const [genreList, pageOne, pageTwo] = await Promise.all([
    fetchJson(tmdbUrl('/genre/movie/list')).catch(() => ({ genres: [] })),
    fetchJson(tmdbUrl('/search/movie', { query, include_adult: 'false', page: '1' })),
    fetchJson(tmdbUrl('/search/movie', { query, include_adult: 'false', page: '2' })).catch(() => ({ results: [] }))
  ]);

  state.genreMap = new Map((genreList.genres || []).map((genre) => [genre.id, genre.name]));

  const seen = new Set();
  const merged = [];
  for (const movie of [...(pageOne.results || []), ...(pageTwo.results || [])]) {
    if (seen.has(movie.id)) {
      continue;
    }
    seen.add(movie.id);
    merged.push(normalizeTmdbMovie(movie));
  }

  merged.sort(sortPriority);
  state.catalog = merged.length ? merged : fallbackCatalog;
  state.selectedGenre = 'All';
  buildGenreChips();
  applyFilters(true);
}

async function fetchMovieDetails(movieId) {
  if (state.detailsCache.has(movieId)) {
    return state.detailsCache.get(movieId);
  }

  const payload = await fetchJson(tmdbUrl(`/movie/${movieId}`, { append_to_response: 'credits,videos' }));
  const details = normalizeTmdbMovie(payload);
  state.detailsCache.set(movieId, details);
  return details;
}

function setSavedButton(movieId) {
  modalSaveBtn.textContent = state.savedIds.has(movieId) ? '✓ Saved' : '+ Save';
}

function syncSavedState(movieId) {
  if (state.savedIds.has(movieId)) {
    state.savedIds.delete(movieId);
  } else {
    state.savedIds.add(movieId);
  }

  saveSavedMovies();
  setSavedButton(movieId);
  renderMovies(state.filtered);
}

function populateModal(movie) {
  modalPoster.src = movie.poster || DEFAULT_POSTER;
  modalPoster.alt = `${movie.title} poster`;
  modalTitle.textContent = movie.title;
  modalMeta.textContent = `${movie.year} • ${movie.runtime || 'Runtime unavailable'} • ${movie.genreNames.join(', ')} • IMDb ${movie.rating.toFixed(1)}`;
  modalOverview.textContent = movie.overview || 'Detailed plot information was not provided by the API.';
  modalDirector.textContent = movie.director || 'Not listed';
  modalRuntime.textContent = movie.runtime || 'Not listed';
  modalCountry.textContent = movie.country || 'International';
  modalAwards.textContent = movie.awards || 'Not listed';
  setSavedButton(movie.id);
}

function openModal() {
  movieModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  movieModal.classList.add('hidden');
  document.body.style.overflow = '';
}

async function openMovieDetails(movie) {
  state.activeMovieId = movie.id;
  openModal();
  modalTitle.textContent = 'Loading details...';
  modalMeta.textContent = '';
  modalOverview.textContent = 'Fetching detailed movie information...';
  modalDirector.textContent = 'Loading';
  modalRuntime.textContent = 'Loading';
  modalCountry.textContent = 'Loading';
  modalAwards.textContent = 'Loading';
  modalPoster.src = movie.poster || DEFAULT_POSTER;

  try {
    const details = await fetchMovieDetails(movie.id);
    populateModal(details);
  } catch (error) {
    console.error('Detail load error:', error);
    populateModal(movie);
    setStatus('Showing cached movie details');
  }
}

async function boot() {
  try {
    await fetchCatalogFromTmdb();
  } catch (error) {
    console.error('TMDB load error:', error);
    state.catalog = fallbackCatalog;
    buildGenreChips();
    applyFilters(true);
    setStatus('TMDB is unavailable right now, showing a small fallback catalog');
    setLoadingGrid('Using fallback catalog...');
    renderMovies(state.catalog);
  }
}

function queueSearch(query) {
  clearTimeout(state.searchTimer);
  state.searchTimer = setTimeout(async () => {
    const term = query.trim();
    if (!term) {
      await fetchCatalogFromTmdb();
      return;
    }

    try {
      await searchTmdbMovies(term);
    } catch (error) {
      console.error('Search error:', error);
      setStatus('Search failed. Try again.');
      movieGrid.innerHTML = `
        <div class="no-results">
          <div>⚠️</div>
          <h4>Search unavailable</h4>
          <p>Please try again in a moment.</p>
        </div>
      `;
    }
  }, 300);
}

searchInput.addEventListener('input', (event) => {
  state.searchTerm = event.target.value;
  queueSearch(state.searchTerm);
});

clearBtn.addEventListener('click', async () => {
  searchInput.value = '';
  state.searchTerm = '';
  await fetchCatalogFromTmdb();
  searchInput.focus();
});

navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    handleNav(button.dataset.nav || 'home');
  });
});

heroDetailsBtn.addEventListener('click', () => {
  if (state.currentHero) {
    openMovieDetails(state.currentHero);
  }
});

watchNowBtn.addEventListener('click', () => {
  if (state.currentHero) {
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(`${state.currentHero.title} trailer`)}`, '_blank', 'noopener,noreferrer');
  }
});

closeModalBtn.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);
modalPlayBtn.addEventListener('click', () => {
  const title = modalTitle.textContent || 'movie';
  window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} trailer`)}`, '_blank', 'noopener,noreferrer');
});
modalSaveBtn.addEventListener('click', () => {
  const movieId = state.activeMovieId;
  if (movieId) {
    syncSavedState(movieId);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
  }
});

boot();
