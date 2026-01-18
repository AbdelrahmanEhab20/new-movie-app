import { useEffect, useState } from 'react'
import './App.css'
import { useDebounce } from 'react-use';
import Search from './components/Search'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { getTrendingListOfMovies, updateSearchCount } from './appwrite';

// API constants 
const API_BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TEMP_ACCESS_KEY_ID;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [moviesList, setMoviesList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [trendingMovies, setTrendingMovies] = useState([]);

  // Debounce search term input
  useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm);
    },
    500,
    [searchTerm]
  );

  //Function to fetch data from API
  const fetchData = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const endpoint = query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` :
        `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.Response === 'False') {
        setErrorMessage(data.Error || 'Error fetching movies data');
        setMoviesList([]);
        return null;
      }
      setMoviesList(data.results || []);
      if (query && data.results.length > 0) {
        // Update search count in Appwrite
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }
  //Function to load data from appwrite to show trending movies
  const loadTrendingMovies = async () => {
    try {
      const trendingData = await getTrendingListOfMovies();
      setTrendingMovies(trendingData);
    } catch (error) {
      console.error('Error loading trending movies:', error);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchData(debouncedSearchTerm);
  }, [debouncedSearchTerm]);
  // Load trending movies on mount
  useEffect(() => {
    loadTrendingMovies();
  }, []);
  return (
    <main>
      {/* pattern */}
      <div className="pattern" />
      {/* wrapper */}
      <div className="wrapper">
        <header>
          <img src="./hero-img.png" alt="Hero Banner" />
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without The Hassle</h1>
          {/* search */}
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>
        <section className='trending'>
          <h2>Trending </h2>
          <ul>
            {trendingMovies.length > 0 ? (
              trendingMovies.map((movie, index) => (
                <li key={movie.$id} className="trending-movie-card">
                  <p className="trending-rank">{index + 1}</p>
                  <img
                    src={movie.poster_url}
                    alt={movie.searchTerm}
                  // className="trending-movie-poster"
                  />
                </li>
              ))
            ) : (
              <p>No trending movies available.</p>
            )}
          </ul>
        </section>
        {/* Movies Section */}
        <section className='all-movies'>
          <h2 >Popular</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="error-message">{errorMessage}</p>
          ) : moviesList.length > 0 ? (
            <ul className="movies-grid">
              {moviesList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          ) : (
            <p>No movies found.</p>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
