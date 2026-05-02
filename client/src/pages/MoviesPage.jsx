import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Film, Play, Star, Ticket, Search, ThumbsUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../lib/api';

const MoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const res = await api.get('/movies');
        setMovies(res.data.movies || []);
      } catch (error) {
        console.error('Failed to load movies', error);
      }
    };
    loadMovies();
  }, []);

  return (
    <div>
      <Navbar />
      <main className="pt-[68px] min-h-screen bg-gradient-to-b from-white to-gray-100">
        <section className="pt-16 pb-8">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-6 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                  Recommended Movies
                </h1>
                <p className="text-gray-500 text-[1rem]">
                  Pick a movie, then choose a real seat map.
                </p>
              </div>
              <div className="relative w-full md:w-80">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for movies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border-[1.5px] border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all shadow-sm"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8">
              {movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                <div className="col-span-full text-center py-24 text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                  No movies found matching "{searchQuery}".
                </div>
              ) : movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase())).map((movie) => (
                <Link to={`/movies/${movie._id}`} className="block group cursor-pointer" key={movie._id}>
                  <div className="relative aspect-[3/5] bg-gray-100 rounded-xl overflow-hidden mb-3 shadow-md border border-black/5">
                    <img
                      src={movie.poster || 'https://via.placeholder.com/500x750?text=No+Poster'}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent flex items-end">
                      <div className="p-3 w-full flex items-center text-white text-[0.95rem] font-bold gap-1.5 drop-shadow-md">
                        <Star size={18} className="text-red-500 fill-red-500" />
                        {movie.rating > 0 ? `${movie.rating} / 10` : 'New Release'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-[1.1rem] font-bold text-gray-900 leading-tight mb-1 line-clamp-1 group-hover:text-red-600 transition-colors">
                      {movie.title}
                    </h2>
                    <p className="text-gray-500 text-[0.8rem] font-medium truncate">
                      {movie.genre?.join('/') || 'Drama/Action'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            
          </div>
        </section>
      </main>
    </div>
  );
};

export default MoviesPage;
