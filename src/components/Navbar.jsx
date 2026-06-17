import React from 'react';

export default function Navbar({ 
  theme, 
  toggleTheme, 
  searchVal, 
  setSearchVal, 
  onSearch 
}) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="navbar">
      <div className="navbar-container">
        <div className="logo-container">
          <h1 className="logo">
            <a href="/">FilmFlow</a>
          </h1>
        </div>
        
        <div className="menu-container">
          <ul className="menu-list">
            <li className="menu-list-item">
              <a href="/" className="active">Home</a>
            </li>
          </ul>
        </div>

        <div className="search-container">
          <i className="fas fa-search search-icon-inside"></i>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search movies..." 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        <div className="profile-container">
          <div 
            className="toggle" 
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <i className="fas fa-moon toggle-icon"></i>
            <i className="fas fa-sun toggle-icon"></i>
            <div className="toggle-ball"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
