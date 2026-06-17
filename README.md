# FilmFlow | Premium Movie Recommendation System

FilmFlow is a content-based Movie Recommendation System built with a React + Vite frontend and a Flask backend. The system leverages TF-IDF vectorization and cosine similarity calculations on movie features (genres, keywords, cast, and crew) to recommend relevant movies.

---

## 🚀 Key Features

* **Autocomplete Search**: Instantly find movies in the database of 4,800+ films with real-time suggestion dropdowns.
* **Smart Content Recommendations**: Computes similarity scores dynamically to suggest the top 6 similar films.
* **Premium Responsive UI**: Curated aesthetic styling with a custom dark mode, fluid micro-animations, and full mobile responsiveness.
* **Adaptive Card Grid**: Missing movie posters are resolved dynamically on the client side using a TMDB key and Wikipedia PageImages API. If no image is found, the layout auto-expands seamlessly without showing broken image icons.
* **Unified Build Structure**: Single-page application served directly from the Flask web server.

---

## 🛠️ Tech Stack

* **Frontend**: React 19, Vite 8, Vanilla CSS, FontAwesome icons.
* **Backend**: Flask, Pandas, Scikit-learn, Flask-CORS.
* **Data & Models**: TMDB 5000 Movies Dataset, pre-computed TF-IDF & Cosine Similarity matrices saved as Python pickle models.

---

## 📂 Project Structure

```text
Movie_Recommdation_System/
├── dist/                          # Compiled production assets served by Flask
├── model/                         # Python pickle files for similarity engine
│   ├── movie_list.pkl
│   └── similarity.pkl
├── src/                           # React application source code
│   ├── components/                # UI Components (Hero, Navbar, MovieRow, etc.)
│   ├── utils/                     # Utility scripts (Wikipedia & TMDB poster resolvers)
│   ├── App.jsx                    # Root React Component
│   └── index.css                  # Core CSS design system
├── app.py                         # Flask API backend server
├── package.json                   # Frontend dependencies and Vite configuration
├── vite.config.js                 # Vite server/build config
├── requirements.txt               # Backend Python dependencies
└── README.md                      # This documentation
```

---

## 🔧 Installation & Setup

### 1. Prerequisites
Ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* [Python](https://www.python.org/) (v3.8 or higher)
* [pnpm](https://pnpm.io/) (used for package management)

### 2. Backend Setup
Install the required Python packages:
```powershell
pip install -r requirements.txt
```

### 3. Frontend Setup
Install the frontend node modules:
```powershell
pnpm install
```

---

## 🏃 Running the Application

### Production Server (Flask serving Frontend)
Compile the React frontend into production assets and launch the Flask server:
```powershell
pnpm run build
python app.py
```
Open your browser and navigate to:
**[http://localhost:5000](http://localhost:5000)**

### Development Mode (Vite Dev Server + Flask API)
To enable hot-reloading during frontend development, run the services concurrently:
1. **Start Backend API**:
   ```powershell
   python app.py
   ```
2. **Start Frontend Dev Server**:
   ```powershell
   pnpm run dev
   ```
The frontend dev server will serve the site (typically on `http://localhost:5173`) and proxy API requests directly to the Flask backend on `localhost:5000`.

---

## 🔬 System Architecture

The recommendation engine uses a content-based filtering algorithm:
1. **Feature Extraction**: Concatenates movie genres, keywords, cast, and crew into a text tag for each movie.
2. **TF-IDF Vectorization**: Converts the text tags into numerical vectors.
3. **Similarity Calculation**: Calculates the cosine similarity between all pairs of movie vectors.
4. **Retrieval**: When a movie is selected, the server queries the pre-computed similarity matrix to retrieve the top 6 movies with the highest similarity scores.
