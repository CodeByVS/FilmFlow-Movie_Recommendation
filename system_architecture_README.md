# Movie Recommendation System Architecture

This documentation explains the system architecture of the movie recommendation system, as visualized by the `system_architecture.py` script.

## Overview

The movie recommendation system is built with a Flask backend that provides movie recommendations based on content similarity. The system uses TF-IDF vectorization and cosine similarity to find movies similar to a given movie. The backend serves both the web interface and provides API endpoints for searching and recommending movies.

## Generated Visualizations

Running the `system_architecture.py` script generates three key diagrams in the `static/visualizations` directory:

1. **System Architecture Diagram** (`system_architecture.png`)
   - Shows the overall system architecture including data sources, processing, storage, backend, and frontend
   - Illustrates the relationships between different system components
   - Highlights the data flow from raw CSV files to user interface

2. **Data Flow Diagram** (`data_flow_diagram.png`)
   - Visualizes how data moves through the system during the recommendation process
   - Shows the path from user input to final recommendations
   - Illustrates how the search and recommendation algorithms interact with the data

3. **Component Diagram** (`component_diagram.png`)
   - Details the main software components of the system
   - Shows how different Python modules interact with each other
   - Illustrates the relationships between Flask application, model generator, and frontend components

## System Components

### Data Layer
- **Data Sources**: TMDB movie datasets (CSV files)
- **Data Processing**: TF-IDF vectorization, cosine similarity calculation
- **Model Storage**: Pickle files storing movie data and similarity matrix

### Backend Layer
- **Flask Application**: Web server handling HTTP requests
- **API Endpoints**: 
  - `/api/search`: Search for movies by title
  - `/api/recommend`: Get movie recommendations based on a selected movie
  - `/api/movies`: Get all available movies

### Frontend Layer
- **HTML Templates**: User interface for searching and viewing recommendations
- **CSS Styling**: Responsive design with light/dark mode support
- **JavaScript**: Client-side interactivity and API communication

## Recommendation Algorithm

The recommendation system uses content-based filtering:

1. Movie features (genres, keywords, cast, crew) are extracted from the dataset
2. Text data is processed and converted to TF-IDF vectors
3. Cosine similarity is calculated between all movie vectors
4. When a user selects a movie, the system finds movies with the highest similarity scores

## How to Use the Visualization Tool

1. Run the script: `python system_architecture.py`
2. View the generated diagrams in the `static/visualizations` directory
3. Use these diagrams to understand the system architecture and data flow

## Dependencies

The visualization script requires:
- matplotlib
- numpy
- pandas
- pickle

## Integration with the Web Application

The visualizations can be integrated into the web application by adding a new route in `app.py` that displays the architecture diagrams, providing users with insights into how the recommendation system works.