import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const API_BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TEMP_ACCESS_KEY_ID;
const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
};

const MovieDetail = () => {
    const { movieId } = useParams()
    const navigate = useNavigate()
    const [movie, setMovie] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        const fetchMovieDetail = async () => {
            setIsLoading(true)
            setErrorMessage('')
            try {
                const response = await fetch(
                    `${API_BASE_URL}/movie/${movieId}`,
                    API_OPTIONS
                )
                if (!response.ok) {
                    throw new Error('Failed to fetch movie details')
                }
                const data = await response.json()
                setMovie(data)
            } catch (error) {
                console.error('Error fetching movie detail:', error)
                setErrorMessage(error.message)
            } finally {
                setIsLoading(false)
            }
        }
        fetchMovieDetail()
    }, [movieId])

    if (isLoading) {
        return (
            <main>
                <div className="pattern" />
                <div className="wrapper">
                    <p className="text-white">Loading...</p>
                </div>
            </main>
        )
    }

    if (errorMessage) {
        return (
            <main>
                <div className="pattern" />
                <div className="wrapper">
                    <p className="error-message">{errorMessage}</p>
                    <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">
                        Go Back
                    </button>
                </div>
            </main>
        )
    }

    if (!movie) return null

    return (
        <main>
            <div className="pattern" />
            <div className="wrapper">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    ← Back
                </button>

                <div className="movie-detail">
                    <div className="flex flex-col md:flex-row gap-8">
                        <img
                            src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : './No-Poster.png'}
                            alt={movie.title}
                            className="w-full md:w-1/3 rounded-lg object-cover"
                        />

                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-white mb-4">{movie.title}</h1>

                            <div className="space-y-3 mb-6 text-gray-200">
                                <p><strong>Release Date:</strong> {movie.release_date || 'N/A'}</p>
                                <p><strong>Rating:</strong> {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}/10</p>
                                <p><strong>Language:</strong> {movie.original_language.toUpperCase()}</p>
                                <p><strong>Runtime:</strong> {movie.runtime ? `${movie.runtime} minutes` : 'N/A'}</p>
                            </div>

                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-white mb-3">Overview</h2>
                                <p className="text-gray-200 leading-relaxed">
                                    {movie.overview || 'No overview available.'}
                                </p>
                            </div>

                            {movie.genres && movie.genres.length > 0 && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-3">Genres</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {movie.genres.map((genre) => (
                                            <span
                                                key={genre.id}
                                                className="px-3 py-1 bg-indigo-600/30 text-indigo-200 rounded-full text-sm"
                                            >
                                                {genre.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default MovieDetail