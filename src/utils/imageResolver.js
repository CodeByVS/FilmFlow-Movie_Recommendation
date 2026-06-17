// Client-side Movie Poster Resolver with cache and fallback mechanisms
const posterCache = new Map();

const GENRE_FALLBACK_IMAGES = {
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
    'western': 'https://images.unsplash.com/photo-1533240332313-0db49b439ad3?w=500&q=80',
    'general': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80'
};

const TMDB_API_KEY = '844dba0bfd8f3a4e372e05a5078410e7'; // Common public testing key

export function getGenreFallback(genres = []) {
    for (let g of genres) {
        const gl = g.toLowerCase().trim();
        if (GENRE_FALLBACK_IMAGES[gl]) return GENRE_FALLBACK_IMAGES[gl];
    }
    return GENRE_FALLBACK_IMAGES['general'];
}

export async function resolveMoviePoster(movieId, title, genres = []) {
    const cacheKey = `${movieId}`;
    if (posterCache.has(cacheKey)) {
        return posterCache.get(cacheKey);
    }

    // Attempt 1: Fetch via TMDB API using public key
    try {
        const tmdbUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}`;
        const response = await fetch(tmdbUrl);
        if (response.ok) {
            const data = await response.json();
            if (data.poster_path) {
                const imgUrl = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
                posterCache.set(cacheKey, imgUrl);
                return imgUrl;
            }
        }
    } catch (e) {
        console.warn(`TMDB lookup failed for ${title}:`, e);
    }

    // Attempt 2: Fetch via Wikipedia PageImages API (keyless)
    try {
        const searchTitle = title.includes("Redemption") || title.includes("Godfather") || title.includes("Knight")
            ? `${title} film`
            : `${title} (film)`;
        
        const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(searchTitle)}&prop=pageimages&pithumbsize=500&format=json&origin=*`;
        const response = await fetch(wikiUrl);
        if (response.ok) {
            const data = await response.json();
            if (data.query && data.query.pages) {
                const pages = Object.values(data.query.pages);
                // Sort pages by index (closer search matches first)
                pages.sort((a, b) => a.index - b.index);
                
                // Find first page that has a thumbnail
                const matchPage = pages.find(p => p.thumbnail && p.thumbnail.source);
                if (matchPage) {
                    const imgUrl = matchPage.thumbnail.source;
                    posterCache.set(cacheKey, imgUrl);
                    return imgUrl;
                }
            }
        }
    } catch (e) {
        console.warn(`Wikipedia image lookup failed for ${title}:`, e);
    }

    // Return null if no poster is found
    posterCache.set(cacheKey, null);
    return null;
}
