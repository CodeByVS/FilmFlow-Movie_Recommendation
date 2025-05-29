import numpy as np
import pandas as pd
import pickle
import os

# Create sample movie data for testing
def create_sample_data():
    # Ensure model directory exists
    os.makedirs('model', exist_ok=True)
    
    # Create a sample movies dataframe
    movies_data = {
        'movie_id': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        'title': [
            'The Shawshank Redemption', 
            'The Godfather', 
            'The Dark Knight', 
            'Pulp Fiction', 
            'Inception',
            'Fight Club',
            'Forrest Gump',
            'The Matrix',
            'Interstellar',
            'Avatar'
        ],
        'tags': [
            'prison escape drama friendship hope', 
            'mafia crime family power drama', 
            'batman joker crime superhero thriller', 
            'crime quentin tarantino violence nonlinear',
            'dream heist thriller christopher nolan',
            'split personality anarchist consumerism david fincher',
            'life journey history love adventure',
            'virtual reality artificial intelligence sci-fi action',
            'space time travel wormhole sci-fi',
            'pandora aliens environment sci-fi action'
        ]
    }
    
    # Create dataframe
    movies_df = pd.DataFrame(movies_data)
    
    # Create a simple similarity matrix (just for testing)
    # In a real scenario, this would be calculated using TF-IDF and cosine similarity
    num_movies = len(movies_df)
    similarity_matrix = np.zeros((num_movies, num_movies))
    
    # Create a simple similarity matrix based on shared words in tags
    for i in range(num_movies):
        for j in range(num_movies):
            if i == j:
                similarity_matrix[i][j] = 1.0  # Perfect similarity with itself
            else:
                # Count shared words between movie tags
                words_i = set(movies_df.iloc[i]['tags'].split())
                words_j = set(movies_df.iloc[j]['tags'].split())
                shared_words = len(words_i.intersection(words_j))
                total_words = len(words_i.union(words_j))
                
                # Simple Jaccard similarity
                similarity_matrix[i][j] = shared_words / total_words if total_words > 0 else 0
    
    # Save the sample data
    pickle.dump(movies_df, open('model/movie_list.pkl', 'wb'))
    pickle.dump(similarity_matrix, open('model/similarity.pkl', 'wb'))
    
    print("Sample model files created successfully!")
    print(f"Sample movies: {movies_df['title'].tolist()}")

if __name__ == "__main__":
    create_sample_data()
