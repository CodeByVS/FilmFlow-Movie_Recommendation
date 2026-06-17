import pickle
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os

def generate_similarity_matrix():
    print("Loading movie list dataset...")
    # Load movie list pickle
    movie_list_path = os.path.join("model", "movie_list.pkl")
    if not os.path.exists(movie_list_path):
        raise FileNotFoundError(f"Could not find movie list file at {movie_list_path}")
        
    movies_df = pickle.load(open(movie_list_path, "rb"))
    print(f"Loaded {len(movies_df)} movies successfully.")

    # Fill any empty tags
    movies_df['tags'] = movies_df['tags'].fillna('')

    print("Computing TF-IDF vectors...")
    # Initialize TF-IDF Vectorizer
    # Stop words are removed to improve similarity calculation
    tfidf = TfidfVectorizer(max_features=5000, stop_words="english")
    tfidf_matrix = tfidf.fit_transform(movies_df['tags'])
    print(f"TF-IDF matrix shape: {tfidf_matrix.shape}")

    print("Calculating cosine similarity matrix...")
    # Compute similarity matrix
    similarity_matrix = cosine_similarity(tfidf_matrix)
    print(f"Cosine similarity matrix shape: {similarity_matrix.shape}")

    # Save the similarity matrix
    similarity_path = os.path.join("model", "similarity.pkl")
    print(f"Saving similarity matrix to {similarity_path}...")
    pickle.dump(similarity_matrix, open(similarity_path, "wb"))
    print("Similarity matrix saved successfully!")

if __name__ == "__main__":
    generate_similarity_matrix()
