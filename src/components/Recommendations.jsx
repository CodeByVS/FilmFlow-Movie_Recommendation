import React, { useState, useEffect } from 'react';
import { resolveMoviePoster } from '../utils/imageResolver';

// Self-contained asynchronous poster loading component
export function MoviePoster({ movieId, title, genres, className, onImageResolved }) {
  const [imgSrc, setImgSrc] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    resolveMoviePoster(movieId, title, genres)
      .then(src => {
        if (isMounted) {
          setImgSrc(src);
          setLoading(false);
          if (onImageResolved) onImageResolved(src);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoading(false);
          if (onImageResolved) onImageResolved(null);
        }
      });
      
    return () => { isMounted = false; };
  }, [movieId, title, genres]);

  if (!imgSrc && !loading) return null;

  return (
    <img 
      src={loading ? 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=150&q=50' : imgSrc} 
      className={className} 
      alt={title}
      style={{ 
        opacity: loading ? 0.6 : 1, 
        transition: 'opacity 0.4s ease' 
      }}
    />
  );
}

// Sub-component for individual recommendation cards to manage own layout state
function RecCard({ movie, onSelectMovie }) {
  const [hasImage, setHasImage] = useState(true);

  return (
    <div 
      className={`rec-card ${hasImage ? '' : 'no-image'} fade-in`}
      onClick={() => onSelectMovie(movie.movie_id, movie.title)}
    >
      {hasImage && (
        <div className="rec-img-wrapper">
          <MoviePoster 
            movieId={movie.movie_id} 
            title={movie.title} 
            genres={movie.genres} 
            className="rec-img" 
            onImageResolved={(src) => setHasImage(!!src)}
          />
          <span className="rec-score-badge">{movie.score}% Match</span>
        </div>
      )}
      <div className="rec-details">
        <div>
          <h3 className="rec-title" title={movie.title}>{movie.title}</h3>
          <div className="rec-meta">
            <span>{movie.year}</span>
            <span>
              <i className="fas fa-star" style={{ color: '#ffb800', marginRight: '4px' }}></i>
              {movie.rating}
              {!hasImage && (
                <span style={{ 
                  marginLeft: '12px', 
                  backgroundColor: 'var(--primary-color)', 
                  color: 'white', 
                  padding: '2px 6px', 
                  borderRadius: '4px', 
                  fontSize: '10px', 
                  fontWeight: '700' 
                }}>
                  {movie.score}% Match
                </span>
              )}
            </span>
          </div>
          <p className="rec-overview">{movie.description}</p>
        </div>
      </div>
    </div>
  );
}

export default function Recommendations({ 
  targetMovieTitle, 
  recommendations, 
  loading, 
  onSelectMovie 
}) {
  if (loading) {
    return (
      <div className="recommendation-section" id="recommendations">
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <i className="fas fa-spinner spinner" style={{ fontSize: '32px' }}></i>
          <p style={{ marginTop: '15px', color: 'var(--text-muted)' }}>Finding similar movies...</p>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="recommendation-section" id="recommendations">
      <div className="recommendation-header">
        <h2>Recommended for You</h2>
        <p>Similar matches based on genres, keywords, cast, and crew details of <span style={{ color: 'var(--primary-color)', fontWeight: '700' }}>{targetMovieTitle}</span></p>
      </div>

      <div className="rec-grid">
        {recommendations.map(movie => (
          <RecCard 
            key={movie.movie_id} 
            movie={movie} 
            onSelectMovie={onSelectMovie} 
          />
        ))}
      </div>
    </div>
  );
}
