from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pickle
import pandas as pd
import json
import os

# Initialize Flask application with React build folder as static root
app = Flask(__name__, static_folder='dist', static_url_path='')
CORS(app)

# Global variables for data
movie_list = None
similarity = None
metadata = {}

# Unsplash category cover images (used in API search as placeholder before client-side resolution)
GENRE_IMAGES = {
    'action': 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&q=80',
    'adventure': 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=500&q=80',
    'animation': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&q=80',
    'comedy': 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=500&q=80',
    'crime': 'https://images.unsplash.com/photo-1453873531674-2151101906c7?w=500&q=80',
    'documentary': 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80',
    'drama': 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&q=80',
    'family': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=500&q=80',
    'fantasy': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80',
    'history': 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=500&q=80',
    'horror': 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500&q=80',
    'music': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
    'mystery': 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=500&q=80',
    'romance': 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500&q=80',
    'science fiction': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80',
    'thriller': 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500&q=80',
    'war': 'https://images.unsplash.com/photo-1533282960533-51328aa49826?w=500&q=80',
    'western': 'https://images.unsplash.com/photo-1533240332313-0db49b439ad3?w=500&q=80'
}

def get_unsplash_image(genres_list):
    """Select a relevant high-quality image from Unsplash based on genres."""
    for g in genres_list:
        g_lower = g.lower().strip()
        if g_lower in GENRE_IMAGES:
            return GENRE_IMAGES[g_lower]
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80'

def load_data():
    """Load and join similarity models and metadata."""
    global movie_list, similarity, metadata
    
    print("Loading similarity models...")
    movie_list_path = os.path.join("model", "movie_list.pkl")
    similarity_path = os.path.join("model", "similarity.pkl")
    
    if not os.path.exists(movie_list_path):
        raise FileNotFoundError(f"Pickle file for movie list is missing at {movie_list_path}.")
        
    if not os.path.exists(similarity_path):
        print("Similarity matrix pickle file is missing. Generating it dynamically...")
        try:
            from model.generate_similarity import generate_similarity_matrix
            generate_similarity_matrix()
        except Exception as e:
            raise RuntimeError(f"Failed to generate similarity matrix dynamically: {e}")
        
    movie_list = pickle.load(open(movie_list_path, "rb"))
    similarity = pickle.load(open(similarity_path, "rb"))
    print(f"Models loaded successfully. Movie list contains {len(movie_list)} movies.")

    
    # Load raw metadata
    movies_csv_path = "tmdb_5000_movies.csv"
    if os.path.exists(movies_csv_path):
        print("Parsing metadata from tmdb_5000_movies.csv...")
        movies_csv = pd.read_csv(movies_csv_path)
        for _, row in movies_csv.iterrows():
            try:
                genres_data = json.loads(row['genres'])
                genres = [g['name'] for g in genres_data]
            except Exception:
                genres = []
            
            year = ""
            if isinstance(row['release_date'], str) and len(row['release_date']) >= 4:
                year = row['release_date'][:4]
                
            metadata[int(row['id'])] = {
                'overview': row['overview'] if isinstance(row['overview'], str) else "No overview available.",
                'genres': genres,
                'year': year,
                'rating': float(row['vote_average']) if not pd.isna(row['vote_average']) else 0.0
            }
        print("Metadata parsing complete.")
    else:
        print("Warning: tmdb_5000_movies.csv not found.")

load_data()

# Frontend Routes
@app.route('/')
def route_home():
    return send_from_directory('dist', 'index.html')

@app.route('/search')
def route_search():
    return send_from_directory('dist', 'index.html')

# Catch-all Route for client-side single page routing
@app.errorhandler(404)
def page_not_found(e):
    return send_from_directory('dist', 'index.html')

# API Endpoints
@app.route('/api/movies')
def api_movies():
    """Retrieve all available movies with brief metadata (for search autocomplete/dropdowns)."""
    if movie_list is None:
        return jsonify({"error": "Data models not loaded"}), 500
        
    results = []
    for _, row in movie_list.iterrows():
        m_id = int(row['movie_id'])
        meta = metadata.get(m_id, {'genres': [], 'year': '', 'rating': 0.0})
        results.append({
            'movie_id': m_id,
            'title': row['title'],
            'genres': meta['genres'],
            'year': meta['year'],
            'rating': meta['rating']
        })
    return jsonify(results)

@app.route('/api/search')
def api_search():
    """Search for movies matching a keyword in their title or tags."""
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify([])
        
    matching = movie_list[movie_list['title'].str.contains(query, case=False, na=False)]
    
    if matching.empty:
        matching = movie_list[movie_list['tags'].str.contains(query, case=False, na=False)]
        
    results = []
    for _, row in matching.head(24).iterrows():
        m_id = int(row['movie_id'])
        m_title = row['title']
        meta = metadata.get(m_id, {
            'overview': 'No overview available.',
            'genres': [],
            'year': '',
            'rating': 0.0
        })
        
        results.append({
            'movie_id': m_id,
            'title': m_title,
            'description': meta['overview'],
            'genres': meta['genres'],
            'year': meta['year'],
            'rating': meta['rating'],
            'image': get_unsplash_image(meta['genres'])
        })
    return jsonify(results)

@app.route('/api/recommend')
def api_recommend():
    """Get the top 6 similar movies for a given movie ID."""
    movie_id_str = request.args.get('movie_id', '').strip()
    if not movie_id_str:
        return jsonify({"error": "movie_id parameter is required"}), 400
        
    try:
        movie_id = int(movie_id_str)
    except ValueError:
        return jsonify({"error": "movie_id must be an integer"}), 400
        
    try:
        idx = movie_list[movie_list['movie_id'] == movie_id].index[0]
    except IndexError:
        return jsonify({"error": "Movie not found in model dataset"}), 404
        
    distances = similarity[idx]
    movie_list_sorted = sorted(list(enumerate(distances)), key=lambda x: x[1], reverse=True)
    
    recommendations = []
    for i in movie_list_sorted[1:7]:
        rec_idx = i[0]
        rec_id = int(movie_list.iloc[rec_idx]['movie_id'])
        rec_title = movie_list.iloc[rec_idx]['title']
        score = float(i[1])
        
        meta = metadata.get(rec_id, {
            'overview': 'No overview available.',
            'genres': [],
            'year': '',
            'rating': 0.0
        })
        
        recommendations.append({
            'movie_id': rec_id,
            'title': rec_title,
            'description': meta['overview'],
            'genres': meta['genres'],
            'year': meta['year'],
            'rating': meta['rating'],
            'score': round(score * 100, 1),
            'image': get_unsplash_image(meta['genres'])
        })
        
    return jsonify(recommendations)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

