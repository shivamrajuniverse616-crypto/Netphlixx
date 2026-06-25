export const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
export const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';
export const IMAGE_BASE_URL_W500 = 'https://image.tmdb.org/t/p/w500';

export const requests = {
  fetchNowPlayingMovies: `${BASE_URL}/movie/now_playing?api_key=${API_KEY}`,
  fetchUpcomingMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&primary_release_date.gte=${new Date().toISOString().split('T')[0]}&sort_by=popularity.desc`,
  fetchTrendingMovies: `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`,
  fetchActionMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28`,
  fetchSciFiMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=878`,
  fetchComedyMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=35`,
  
  fetchTrendingTV: `${BASE_URL}/trending/tv/week?api_key=${API_KEY}`,
  fetchActionTV: `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=10759`,
  fetchSciFiTV: `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=10765`,
  fetchComedyTV: `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=35`,
  
  fetchSearch: `${BASE_URL}/search/multi?api_key=${API_KEY}&query=`,
};
