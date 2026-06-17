import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Recommendations, { MoviePoster } from './components/Recommendations';
import MovieRow from './components/MovieRow';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';


// Sub-component to manage layout of each search result card when poster is missing
function SearchCard({ movie, onSelectMovie }) {
  const [hasImage, setHasImage] = useState(true);

  return (
    <div 
      className={`search-item ${hasImage ? '' : 'no-image'} fade-in`}
      onClick={() => onSelectMovie(movie.movie_id, movie.title)}
    >
      {hasImage && (
        <MoviePoster 
          movieId={movie.movie_id} 
          title={movie.title} 
          genres={movie.genres} 
          className="search-item-img" 
          onImageResolved={(src) => setHasImage(!!src)}
        />
      )}
      <div className="search-item-content">
        <h3 className="search-item-title" title={movie.title}>{movie.title}</h3>
        <div className="search-item-info">
          <span>{movie.year}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <i className="fas fa-star" style={{ color: '#ffb800' }}></i>
            {movie.rating}
          </span>
        </div>
        <p className="search-item-desc">{movie.description}</p>
        <button className="search-item-button">Get Recommendations</button>
      </div>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('darkMode') !== 'disabled' ? 'dark' : 'light');
  const [allMovies, setAllMovies] = useState([]);
  
  // Search state
  const [searchVal, setSearchVal] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Recommendation state
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [selectedMovieTitle, setSelectedMovieTitle] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  // Sync theme to body class
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-mode');
    }
  }, [theme]);

  // Load all movies on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/movies`)
      .then(res => res.json())
      .then(data => {
        setAllMovies(data);
        
        // Handle URL deep-linking on load
        const urlParams = new URLSearchParams(window.location.search);
        const paramMovieId = urlParams.get('movie_id');
        if (paramMovieId) {
          const matched = data.find(m => m.movie_id == paramMovieId);
          if (matched) {
            handleSelectMovie(matched.movie_id, matched.title);
          }
        }
      })
      .catch(err => console.error("Error loading movie dataset: ", err));
  }, []);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('darkMode', next === 'dark' ? 'enabled' : 'disabled');
      return next;
    });
  };

  const handleSelectMovie = (movieId, title) => {
    setSelectedMovieId(movieId);
    setSelectedMovieTitle(title);
    setRecLoading(true);
    setIsSearching(false); // Switch back to home view to show recommendations
    
    const newUrl = `${window.location.origin}${window.location.pathname}?movie_id=${movieId}`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    fetch(`${API_BASE}/api/recommend?movie_id=${movieId}`)
      .then(res => res.json())
      .then(data => {
        setRecommendations(data);
        setRecLoading(false);
        setTimeout(() => {
          const element = document.getElementById('recommendations');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      })
      .catch(err => {
        console.error("Error fetching recommendations:", err);
        setRecommendations([]);
        setRecLoading(false);
      });
  };

  const handleSearch = () => {
    const query = searchVal.trim();
    if (!query) return;

    setSearchLoading(true);
    setIsSearching(true);
    setActiveFilter('all');
    window.history.pushState({}, '', window.location.pathname);

    fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        setSearchResults(data);
        setSearchLoading(false);
      })
      .catch(err => {
        console.error("Search API failed:", err);
        setSearchResults([]);
        setSearchLoading(false);
      });
  };

  const handleBackToHome = () => {
    setIsSearching(false);
    setSearchVal('');
    setSelectedMovieId(null);
    setSelectedMovieTitle('');
    setRecommendations([]);
    window.history.pushState({}, '', window.location.pathname);
  };

  // Filter logic for search results
  const getFilteredSearchResults = () => {
    if (activeFilter === 'movie' || activeFilter === 'all') {
      return searchResults;
    }
    if (activeFilter === 'tv') {
      return [];
    }
    if (activeFilter === 'recent') {
      return searchResults.filter(item => item.year && parseInt(item.year) >= 2010);
    }
    if (activeFilter === 'popular') {
      return searchResults.filter(item => item.rating && parseFloat(item.rating) >= 7.0);
    }
    return searchResults;
  };

  // Filter curated categories
  const actionMovies = allMovies.filter(m => m.genres.some(g => g.toLowerCase() === 'action' || g.toLowerCase() === 'adventure')).slice(0, 6);
  const scifiMovies = allMovies.filter(m => m.genres.some(g => g.toLowerCase() === 'science fiction' || g.toLowerCase() === 'fantasy')).slice(0, 6);
  const dramaMovies = allMovies.filter(m => m.genres.some(g => g.toLowerCase() === 'drama' || g.toLowerCase() === 'thriller')).slice(0, 6);

  return (
    <div className="app-wrapper">
      <Navbar 
        theme={theme} 
        toggleTheme={toggleTheme} 
        searchVal={searchVal}
        setSearchVal={setSearchVal}
        onSearch={handleSearch}
      />

      {isSearching ? (
        /* Search results view */
        <div className="search-page-container">
          <div className="search-header">
            <h1>Search Results</h1>
            <p>Showing matches for: <span style={{ color: 'var(--primary-color)', fontWeight: '700' }}>{searchVal}</span></p>
            
            <div className="search-filters">
              {['all', 'movie', 'tv', 'recent', 'popular'].map(type => (
                <button 
                  key={type}
                  className={`filter-button ${activeFilter === type ? 'active' : ''}`}
                  onClick={() => setActiveFilter(type)}
                >
                  {type === 'all' && 'All'}
                  {type === 'movie' && 'Movies'}
                  {type === 'tv' && 'TV Shows'}
                  {type === 'recent' && 'Recent (>2010)'}
                  {type === 'popular' && 'Popular (>7.0)'}
                </button>
              ))}
            </div>
          </div>

          {searchLoading ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <i className="fas fa-spinner spinner" style={{ fontSize: '32px' }}></i>
              <p style={{ marginTop: '15px', color: 'var(--text-muted)' }}>Searching database...</p>
            </div>
          ) : (
            <div className="search-results-grid">
              {getFilteredSearchResults().length === 0 ? (
                <div className="no-results">
                  <i className="fas fa-search-minus"></i>
                  <h2>No results found</h2>
                  <p>We couldn't find any items matching your filter in our database.</p>
                  <button className="return-home-btn" onClick={handleBackToHome}>Return Home</button>
                </div>
              ) : (
                getFilteredSearchResults().map(movie => (
                  <SearchCard 
                    key={movie.movie_id} 
                    movie={movie} 
                    onSelectMovie={handleSelectMovie} 
                  />
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        /* Standard Dashboard View */
        <>
          <Hero allMovies={allMovies} onSelectMovie={handleSelectMovie} />
          
          <Recommendations 
            targetMovieTitle={selectedMovieTitle}
            recommendations={recommendations}
            loading={recLoading}
            onSelectMovie={handleSelectMovie}
          />

          <div id="genres-section">
            <MovieRow 
              title="Action & Adventure" 
              iconClass="fas fa-bolt" 
              movies={actionMovies} 
              onSelectMovie={handleSelectMovie} 
            />
            <MovieRow 
              title="Science Fiction & Fantasy" 
              iconClass="fas fa-space-shuttle" 
              movies={scifiMovies} 
              onSelectMovie={handleSelectMovie} 
            />
            <MovieRow 
              title="Drama & Thrillers" 
              iconClass="fas fa-mask" 
              movies={dramaMovies} 
              onSelectMovie={handleSelectMovie} 
            />
          </div>
        </>
      )}

      <footer className="site-footer" style={{ padding: '30px 50px', backgroundColor: 'rgba(0, 0, 0, 0.9)', textAlign: 'center', borderTop: '1px solid var(--border-color)', marginTop: '50px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>&copy; 2026 FilmFlow Recommendation Engine. Powered by React, Vite, and Flask.</p>
      </footer>
    </div>
  );
}
