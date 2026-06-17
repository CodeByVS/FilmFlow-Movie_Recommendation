import React, { useState } from 'react';
import { MoviePoster } from './Recommendations';

function MovieRowCard({ movie, onSelectMovie }) {
  const [hasImage, setHasImage] = useState(true);

  return (
    <div 
      className={`movie-card ${hasImage ? '' : 'no-image'} fade-in`}
      onClick={() => onSelectMovie(movie.movie_id, movie.title)}
    >
      {hasImage && (
        <div className="movie-card-img-wrapper">
          <MoviePoster 
            movieId={movie.movie_id} 
            title={movie.title} 
            genres={movie.genres} 
            className="movie-card-img" 
            onImageResolved={(src) => setHasImage(!!src)}
          />
        </div>
      )}
      <div className="movie-card-content">
        <h3 className="movie-card-title" title={movie.title}>{movie.title}</h3>
        <div>
          <div className="movie-card-info">
            <span>{movie.year}</span>
            <span className="movie-card-rating">
              <i className="fas fa-star"></i> {movie.rating}
            </span>
          </div>
          <div className="movie-card-tags" title={movie.genres.join(', ')}>
            {movie.genres.join(', ')}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MovieRow({ title, iconClass, movies, onSelectMovie }) {
  if (!movies || movies.length === 0) return null;

  return (
    <div className="movie-section">
      <h2 className="section-title">
        <i className={iconClass}></i> {title}
      </h2>
      <div className="movie-grid">
        {movies.map(movie => (
          <MovieRowCard 
            key={movie.movie_id} 
            movie={movie} 
            onSelectMovie={onSelectMovie} 
          />
        ))}
      </div>
    </div>
  );
}
