import './App.css'
import Search from './components/Search'

const App = () => {
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
        <Search />
      </div>
    </main>
  )
}

export default App
