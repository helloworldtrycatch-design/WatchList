const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = '1af5c9dacbfde032a6ac8b2ca5666e5d';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export interface TMDBItem {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  media_type?: 'movie' | 'tv';
  vote_average: number;
}

export interface TMDBResponse {
  results: TMDBItem[];
  total_results: number;
}

export const searchMovies = async (query: string, region?: string): Promise<TMDBResponse> => {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      query,
      ...(region && { region })
    });
    
    const response = await fetch(`${TMDB_BASE_URL}/search/movie?${params}`);
    return await response.json();
  } catch (error) {
    console.error('Error searching movies:', error);
    return { results: [], total_results: 0 };
  }
};

export const searchTV = async (query: string): Promise<TMDBResponse> => {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      query
    });
    
    const response = await fetch(`${TMDB_BASE_URL}/search/tv?${params}`);
    return await response.json();
  } catch (error) {
    console.error('Error searching TV shows:', error);
    return { results: [], total_results: 0 };
  }
};

export const getImageUrl = (path: string | null): string => {
  if (!path) return '/placeholder-poster.jpg';
  return `${TMDB_IMAGE_BASE_URL}${path}`;
};

export const getPopularMovies = async (): Promise<TMDBResponse> => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return { results: [], total_results: 0 };
  }
};