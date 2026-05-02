import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Film, Star, Clock, Ticket, ChevronRight, Play, Zap, Shield, CreditCard, ThumbsUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../lib/api';

const FEATURES = [
  { icon: <Zap size={22} />, title: 'Instant Booking', desc: 'Confirm your seat in under 60 seconds — no waiting, no hassle.' },
  { icon: <Shield size={22} />, title: 'Secure Payments', desc: 'Industry-grade encryption keeps your payment data safe.' },
  { icon: <CreditCard size={22} />, title: 'Easy Refunds', desc: 'Cancel up to 2 hours before the show and get an instant refund.' },
];

const LandingPage = () => {
  const [movies, setMovies] = useState([]);

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

      {/* ── Hero ── */}
      <section className="min-h-screen flex items-center relative overflow-hidden bg-gradient-to-br from-[#0f0f0f] via-[#1a0a0a] to-[#0f0f0f]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_rgba(225,29,72,0.15)_0%,_transparent_60%),radial-gradient(circle_at_80%_20%,_rgba(225,29,72,0.08)_0%,_transparent_50%)]" />
        <div className="max-w-[1280px] w-full mx-auto px-6 relative z-10">
          <div className="max-w-[680px] pt-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-600/15 border border-red-600/30 rounded-full text-red-500 text-xs font-bold tracking-wider uppercase mb-6 shadow-[0_0_15px_rgba(225,29,72,0.15)]">
              <Zap size={14} fill="currentColor" />
              Book smarter, watch better
            </div>
            <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[1.05] text-white mb-5">
              Your Cinema,<br />
              <span className="bg-gradient-to-br from-red-500 to-red-600 bg-clip-text text-transparent">Your Way.</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-[520px] leading-relaxed mb-10">
              Browse 200+ movies, pick your perfect seat, and book instantly.
              Experience movies the way they were meant to be — on the big screen.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/movies" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 font-bold text-base rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30 hover:from-red-700 hover:to-red-800 transition-all hover:-translate-y-0.5">
                <Ticket size={18} /> Browse Movies
              </Link>
              <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 font-bold text-base rounded-xl bg-white/10 text-white border border-white/20 backdrop-blur-md hover:bg-white/20 transition-all hover:-translate-y-0.5">
                <Play size={16} fill="currentColor" /> Watch Trailer
              </Link>
            </div>
            <div className="flex gap-10 mt-12 pt-8 border-t border-white/10">
              {[['200+', 'Movies'], ['50+', 'Theaters'], ['1M+', 'Happy Users'], ['4.8★', 'App Rating']].map(([val, label]) => (
                <div key={label}>
                  <div className="text-2xl font-black text-white">{val}</div>
                  <div className="text-xs text-gray-500 font-semibold">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating poster strip on right */}
        <div className="hidden lg:flex absolute right-0 top-0 bottom-0 w-[42%] overflow-hidden flex-col [mask-image:linear-gradient(to_left,black_60%,transparent_100%)]">
          <div className="grid grid-cols-2 gap-2 p-8 pt-20 opacity-60">
            {movies.slice(0, 6).map((m) => (
              <div key={m._id} className="rounded-xl overflow-hidden aspect-[2/3] bg-[#1f1f1f]">
                <img src={m.poster || 'https://via.placeholder.com/500x750?text=No+Poster'} alt={m.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Now Showing ── */}
      <section className="py-20">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex justify-between items-end mb-8">
            <div>
              <div className="inline-block px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold tracking-wide uppercase mb-3">🎬 Now Showing</div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-1">Trending This Week</h2>
              <p className="text-gray-500">Hot picks everyone's watching right now</p>
            </div>
            <Link to="/movies" className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 font-bold text-sm rounded-lg bg-transparent text-red-600 border-2 border-red-600 hover:bg-red-600 hover:text-white transition-all hover:-translate-y-0.5">
              View All <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8">
            {movies.filter(m => m.status === 'now_showing').map((movie) => (
              <Link to={`/movies/${movie._id}`} key={movie._id} className="block group cursor-pointer">
                <div className="relative aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden mb-3 shadow-md border border-black/5">
                  <img src={movie.poster || 'https://via.placeholder.com/500x750?text=No+Poster'} alt={movie.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" onError={(e) => { e.target.style.display = 'none'; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent flex items-end">
                    <div className="p-3 w-full flex items-center text-white text-[0.95rem] font-bold gap-1.5 drop-shadow-md">
                      <Star size={18} className="text-red-500 fill-red-500" />
                      {movie.rating > 0 ? `${movie.rating} / 10` : 'New Release'}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-[1.1rem] font-bold text-gray-900 leading-tight mb-1 line-clamp-1 group-hover:text-red-600 transition-colors">{movie.title}</div>
                  <div className="text-[0.8rem] text-gray-500 font-medium truncate">{movie.genre?.join('/') || 'Drama/Action'}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Coming Soon ── */}
      <section className="py-20 bg-gray-50 border-y border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="mb-8">
            <div className="inline-block px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold tracking-wide uppercase mb-3">📅 Coming Soon</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-1">New Releases Ahead</h2>
            <p className="text-gray-500">Mark your calendar for these blockbusters</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8">
            {movies.filter(m => m.status === 'coming_soon').map((movie) => (
              <div key={movie._id} className="block group cursor-pointer opacity-90 hover:opacity-100">
                <div className="relative aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden mb-3 shadow-md border border-black/5">
                  <img src={movie.poster || 'https://via.placeholder.com/500x750?text=No+Poster'} alt={movie.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" onError={(e) => { e.target.style.display = 'none'; }} />
                  <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-md text-[0.7rem] font-black uppercase shadow-lg shadow-red-600/30">
                    SOON
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent flex items-end">
                    <div className="p-3 w-full flex items-center text-white text-[0.95rem] font-bold gap-1.5 drop-shadow-md">
                      <Star size={18} className="text-amber-400 fill-amber-400" />
                      {movie.rating > 0 ? `${movie.rating} / 10` : 'Anticipated'}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-[1.1rem] font-bold text-gray-900 leading-tight mb-1 line-clamp-1">{movie.title}</div>
                  <div className="text-[0.8rem] text-gray-500 font-medium truncate">{movie.genre?.join('/') || 'Drama/Action'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why CineBook ── */}
      <section className="py-24">
        <div className="max-w-[1280px] mx-auto px-6 text-center">
          <div className="inline-block px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold tracking-wide uppercase mb-3 text-center mx-auto">✨ Why CineBook</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Built for Movie Lovers</h2>
          <p className="text-gray-500 mb-12">Everything you need for a perfect movie night</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="p-8 rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.05)] text-left transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
                <div className="w-14 h-14 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-6">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="pb-24">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="rounded-[2rem] p-12 sm:p-16 text-center relative overflow-hidden bg-gradient-to-br from-gray-900 via-[#1a0a0a] to-red-950 shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(225,29,72,0.2)_0%,_transparent_70%)] pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center">
              <Film size={48} className="text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(225,29,72,0.5)]" />
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Ready for your next movie night?
              </h2>
              <p className="text-red-100/70 mb-10 text-lg">
                Join over 1 million movie lovers who book with CineBook
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
                <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-base rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30 hover:from-red-700 hover:to-red-800 transition-all hover:-translate-y-0.5">
                   Create Free Account
                </Link>
                <Link to="/movies" className="inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-base rounded-xl bg-white/10 text-white border border-white/20 backdrop-blur-md hover:bg-white/20 transition-all hover:-translate-y-0.5">
                  Explore Movies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-950 pt-16 pb-8 border-t border-gray-900">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2 text-xl font-extrabold text-white mb-4">
                <Film size={20} className="text-red-500" />Cine<span className="text-red-500">Book</span>
              </div>
              <p className="text-gray-500 text-sm max-w-[260px] leading-relaxed">Your ultimate destination for flawless movie ticket booking experiences.</p>
            </div>
            <div className="flex gap-12 sm:gap-20">
              {[['Quick Links', ['Home', 'Movies', 'Login', 'Register']], ['Support', ['FAQ', 'Contact', 'Refunds', 'Privacy']]].map(([title, links]) => (
                <div key={title}>
                  <h4 className="text-white font-bold mb-4">{title}</h4>
                  <ul className="flex flex-col gap-3">
                    {links.map(l => (
                      <li key={l}>
                        <a href="#" className="text-gray-500 text-sm font-medium hover:text-white transition-colors">{l}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-gray-600 text-xs font-semibold tracking-wide">
            © 2026 CineBook. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
