import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Calendar, Navigation, Star, Loader2 } from 'lucide-react';
import api from '../lib/api';
import Navbar from '../components/Navbar';

// Haversine distance in km
const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
};

// Group shows by theater
const groupByTheater = (shows) => {
  const map = {};
  shows.forEach(show => {
    const tid = show.theater._id;
    if (!map[tid]) map[tid] = { theater: show.theater, shows: [] };
    map[tid].shows.push(show);
  });
  return Object.values(map);
};

// Convert 24hr string like '15:30' to '3:30 PM'
const formatTime = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':');
  const d = new Date();
  d.setHours(h, m);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const TheatreListPage = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLoc, setUserLoc] = useState(null);
  const [locLoading, setLocLoading] = useState(true);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => { setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocLoading(false); },
        () => setLocLoading(false),
        { timeout: 5000 }
      );
    } else setLocLoading(false);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [movieRes, showsRes] = await Promise.all([
          api.get(`/movies/${movieId}`),
          api.get(`/shows?movieId=${movieId}`),
        ]);
        setMovie(movieRes.data.movie);
        setGroups(groupByTheater(showsRes.data.shows));
      } catch {
        setMovie(null);
        setGroups([]);
      }
      setLoading(false);
    };
    load();
  }, [movieId]);

  const getDistance = (theater) => {
    if (!userLoc || !theater.latitude || !theater.longitude) return null;
    return haversine(userLoc.lat, userLoc.lng, theater.latitude, theater.longitude);
  };

  // Format today's date label
  const formatDate = (d) => {
    const date = new Date(d);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex items-center gap-3 text-gray-500">
        <Loader2 size={20} className="animate-spin" /> Loading shows...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-[68px]">
        {/* ── Movie Header ── */}
        <div className="relative bg-gray-900 overflow-hidden">
          {movie?.poster && (
            <div className="absolute inset-0">
              <img src={movie.poster} alt="" className="w-full h-full object-cover scale-105 blur-sm opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-gray-900/70" />
            </div>
          )}
          <div className="relative max-w-5xl mx-auto px-6 py-8 flex items-center gap-6">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex-shrink-0">
              <ArrowLeft size={18} />
            </button>
            {movie?.poster && (
              <img src={movie.poster} alt={movie?.title} className="w-16 h-22 rounded-xl object-cover shadow-2xl flex-shrink-0 border border-white/10" style={{ height: 88 }} onError={e => e.target.style.display = 'none'} />
            )}
            <div>
              <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Select Tickets</div>
              <h1 className="text-white text-2xl font-extrabold">{movie?.title}</h1>
              <div className="flex items-center gap-3 mt-1.5 text-gray-400 text-sm flex-wrap">
                {movie?.genre?.[0] && <span className="text-red-400 font-semibold">{movie.genre.join(', ')}</span>}
                <span className="flex items-center gap-1"><Clock size={12} /> {movie?.duration} min</span>
                {movie?.rating > 0 && <span className="flex items-center gap-1"><Star size={12} className="text-yellow-400" fill="currentColor" /> {movie?.rating}</span>}
                <span className="text-gray-500">{movie?.language}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Date selector ── */}
        <div className="bg-white border-b border-gray-200 sticky top-[68px] z-10 shadow-sm">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-2">
            <Calendar size={15} className="text-gray-400" />
            <span className="text-gray-600 text-sm font-medium mr-2">Showing for:</span>
            <div className="flex gap-2 overflow-x-auto">
              {(() => {
                const dates = [...new Set(groups.flatMap(g => g.shows.map(s => s.showDate.split('T')[0])))].slice(0, 7);
                return dates.length ? dates.map(d => (
                  <span key={d} className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-semibold whitespace-nowrap">
                    {formatDate(d)}
                  </span>
                )) : <span className="text-gray-400 text-sm">All upcoming dates</span>;
              })()}
            </div>
          </div>
        </div>

        {/* ── Theatre List ── */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          {groups.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <div className="text-5xl mb-4">🏛️</div>
              <div className="text-xl font-bold text-gray-500 mb-2">No shows available</div>
              <p className="text-sm">Check back later or try a different date</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-5">
                <div className="text-gray-900 font-bold text-lg">{groups.length} Theater{groups.length !== 1 ? 's' : ''} Near You</div>
                {!locLoading && !userLoc && (
                  <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">📍 Enable location for distances</span>
                )}
              </div>

              {groups.map(({ theater, shows }) => {
                const dist = getDistance(theater);
                return (
                  <div key={theater._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    {/* Theater header */}
                    <div className="flex items-start justify-between px-6 py-5 border-b border-gray-50">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h2 className="text-gray-900 font-extrabold text-lg">{theater.name}</h2>
                          {dist && (
                            <span className="flex items-center gap-1 text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-full flex-shrink-0">
                              <Navigation size={10} /> {dist} km
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5 text-gray-500 text-sm">
                          <MapPin size={13} className="text-red-400 flex-shrink-0" />
                          <span className="truncate">{theater.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Show times */}
                    <div className="px-6 py-4">
                      <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">Available Shows</div>
                      <div className="flex flex-wrap gap-2">
                        {shows.map(show => {
                          const totalTheaterSeats = theater.layoutConfig?.length > 0
                            ? theater.layoutConfig.reduce((sum, r) => sum + r.leftSeats + r.rightSeats, 0)
                            : (theater.totalRows || 0) * (theater.seatsPerRow || 0);
                          const availableSeats = totalTheaterSeats - (show.bookedSeats?.length || 0);
                          const isFilling = availableSeats < 20;
                          return (
                            <button key={show._id}
                              onClick={() => navigate(`/shows/${show._id}/seats`)}
                              className={`flex flex-col items-center px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all duration-150 active:scale-95 ${isFilling
                                ? 'border-amber-300 bg-amber-50 text-amber-700 hover:border-amber-400'
                                : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700'
                                }`}
                            >
                              <span className={`text-[0.65rem] uppercase font-bold tracking-widest text-gray-400`}>
                                {new Date(show.showDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                              </span>
                              <span className="text-base font-black tracking-tight">{formatTime(show.showTime)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TheatreListPage;
