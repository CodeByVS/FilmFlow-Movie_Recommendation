import React, { useState, useEffect, useRef } from 'react';

export default function Hero({ allMovies, onSelectMovie }) {
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Filter matches on query input
  useEffect(() => {
    if (!query.trim()) {
      setMatches([]);
      setIsOpen(false);
      return;
    }

    const filtered = allMovies
      .filter(m => m.title.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10);
    
    setMatches(filtered);
    setIsOpen(filtered.length > 0);
  }, [query, allMovies]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectItem = (movie) => {
    setQuery(movie.title);
    setIsOpen(false);
    onSelectMovie(movie.movie_id, movie.title);
  };

  const handleCTA = () => {
    if (!query.trim()) return;
    
    // Find perfect or partial match
    let match = allMovies.find(m => m.title.toLowerCase() === query.toLowerCase().trim());
    if (!match) {
      match = allMovies.find(m => m.title.toLowerCase().includes(query.toLowerCase().trim()));
    }

    if (match) {
      handleSelectItem(match);
    } else {
      alert("Movie not found. Please pick from the auto-complete dropdown list.");
    }
  };

  return (
    <div className="hero">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h2 className="hero-title">Discover Your Next Favorite Movie</h2>
        <p className="hero-subtitle">Enter a movie you love, and let our content similarity engine recommend similar hits.</p>
        
        <div className="selector-container" ref={dropdownRef}>
          <div className="selector-input-wrapper">
            <input 
              type="text" 
              className="selector-input" 
              placeholder="Type a movie title (e.g., The Dark Knight, Avatar)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => { if (matches.length > 0) setIsOpen(true); }}
            />
            {isOpen && (
              <div className="dropdown-menu">
                {matches.map(movie => (
                  <div 
                    key={movie.movie_id} 
                    className="dropdown-item"
                    onClick={() => handleSelectItem(movie)}
                  >
                    {movie.title} {movie.year ? `(${movie.year})` : ''}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="selector-button" onClick={handleCTA}>
            Get Recommendations
          </button>
        </div>
      </div>
    </div>
  );
}
