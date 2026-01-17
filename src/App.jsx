import { useEffect, useState } from 'react'
import './App.css'
import Search from './components/Search'

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

  //Function to fetch data from API
  const fetchData = async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, API_OPTIONS);
      const data = await response.json();
      console.log("data")
      console.log(data)
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  }
  // Fetch initial data
  useEffect(() => {
    fetchData('/movie/popular').then(data => {
      console.log('Popular Movies:', data);
    });
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
        </header>
        {/* search */}
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>
    </main>
  )
}

export default App
