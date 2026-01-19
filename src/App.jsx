import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import { useDebounce } from 'react-use';
import Search from './components/Search'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import MovieDetail from './components/MovieDetail';
import Pagination from './components/Pagination';
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

const Home = ({
  searchTerm,
  setSearchTerm,
  moviesList,
  isLoading,
  errorMessage,
  trendingMovies,
  currentPage,
  setCurrentPage,
  totalPages
}) => {
  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero-img.png" alt="Hero Banner" />
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without The Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending </h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.searchTerm} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className='all-movies'>
          <h2>All Movies</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="error-message">{errorMessage}</p>
          ) : moviesList.length > 0 ? (
            <>
              <ul className="movies-grid">
                {moviesList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </ul>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <p>No movies found.</p>
          )}
        </section>
      </div>
    </main>
  )
}

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [moviesList, setMoviesList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search term input
  useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to page 1 when search term changes
    },
    500,
    [searchTerm]
  );

  //Function to fetch data from API
  const fetchData = async (query = '', page = 1) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${page}`;

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
      setTotalPages(data.total_pages || 1);

      if (query && data.results.length > 0) {
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
    fetchData(debouncedSearchTerm, currentPage);
  }, [debouncedSearchTerm, currentPage]);

  // Load trending movies on mount
  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Home
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            moviesList={moviesList}
            isLoading={isLoading}
            errorMessage={errorMessage}
            trendingMovies={trendingMovies}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
          />
        }
      />
      <Route path="/movie/:movieId" element={<MovieDetail />} />
    </Routes>
  )
}

export default App