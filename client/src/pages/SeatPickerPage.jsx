import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, X, Check, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { DUMMY_SHOWS, DUMMY_THEATERS } from '../lib/dummyTheaters';
import { DUMMY_MOVIES } from '../lib/dummyMovies';

const ROW_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Generate seat grid from theater config
const generateGrid = (theater, bookedSeats = []) => {
  const rows = [];
  for (let r = 0; r < theater.totalRows; r++) {
    const rowLetter = ROW_LETTERS[r];
    let type = 'standard';
    if (r < theater.recliners) type = 'recliner';
    else if (r < theater.recliners + theater.premiumRows) type = 'premium';

    const count = type === 'recliner'
      ? Math.max(6, theater.seatsPerRow - 4) // recliners: fewer, centered
      : theater.seatsPerRow;

    const seats = Array.from({ length: count }, (_, i) => {
      const id = `${rowLetter}${i + 1}`;
      return { id, number: i + 1, type, isBooked: bookedSeats.includes(id) };
    });

    rows.push({ rowLetter, type, seats });
  }
  return rows;
};

// Per-type styles
const seatStyles = {
  recliner: {
    base: 'w-9 h-8 border rounded-t-lg text-[10px] font-bold transition-all duration-150 flex flex-col items-center justify-end pb-0.5 cursor-pointer select-none',
    available: 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 hover:scale-110 hover:shadow-sm',
    selected: 'border-red-600 bg-red-600 text-white scale-110 shadow-md shadow-red-200',
    booked: 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-70',
  },
  premium: {
    base: 'w-8 h-7 border rounded-t-md text-[10px] font-bold transition-all duration-150 flex flex-col items-center justify-end pb-0.5 cursor-pointer select-none',
    available: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300 hover:scale-105 hover:shadow-sm',
    selected: 'border-red-600 bg-red-600 text-white scale-105 shadow-md shadow-red-200',
    booked: 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-70',
  },
  standard: {
    base: 'w-7 h-6 border rounded-t-sm text-[10px] font-bold transition-all duration-150 flex flex-col items-center justify-end pb-0.5 cursor-pointer select-none',
    available: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:scale-105',
    selected: 'border-red-600 bg-red-600 text-white scale-105 shadow-sm shadow-red-200',
    booked: 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-70',
  },
};

const Seat = ({ seat, isSelected, onClick }) => {
  const styles = seatStyles[seat.type];
  const stateClass = seat.isBooked ? styles.booked : isSelected ? styles.selected : styles.available;

  return (
    <div
      className={`${styles.base} ${stateClass}`}
      onClick={seat.isBooked ? undefined : onClick}
      title={seat.isBooked ? 'Booked' : `${seat.id}`}
      style={{ boxShadow: !seat.isBooked && !isSelected ? '0 1px 0 rgba(17,24,39,0.12)' : undefined }}
    >
      {seat.isBooked ? '✕' : seat.number}
    </div>
  );
};

const SeatPickerPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [show, setShow] = useState(null);
  const [grid, setGrid] = useState([]);
  const [selected, setSelected] = useState([]); // [{id, type, price}]
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (showId?.startsWith('dshow-')) {
        const dummyShow = DUMMY_SHOWS.find((s) => s._id === showId);
        const dummyTheater = dummyShow ? DUMMY_THEATERS.find((t) => t._id === dummyShow.theaterId) : null;
        const dummyMovie = dummyShow ? DUMMY_MOVIES.find((m) => m._id === dummyShow.movieId) : null;

        if (dummyShow && dummyTheater && dummyMovie) {
          const mergedShow = { ...dummyShow, movie: dummyMovie, theater: dummyTheater };
          setShow(mergedShow);
          setGrid(generateGrid(dummyTheater, dummyShow.bookedSeats || []));
          setLoading(false);
          return;
        }
      }

      try {
        const { data } = await api.get(`/shows/${showId}`);
        setShow(data.show);
        setGrid(generateGrid(data.show.theater, data.show.bookedSeats));
      } catch { setError('Failed to load show details.'); }
      setLoading(false);
    };
    load();
  }, [showId]);

  const toggleSeat = useCallback((seat) => {
    setSelected(prev => {
      const exists = prev.find(s => s.id === seat.id);
      if (exists) return prev.filter(s => s.id !== seat.id);
      if (prev.length >= 10) return prev; // max 10
      const price = show?.theater?.prices?.[seat.type] || 0;
      return [...prev, { id: seat.id, type: seat.type, price }];
    });
  }, [show]);

  const total = selected.reduce((s, x) => s + x.price, 0);

  const handleBook = async () => {
    if (!selected.length) return;

    if (showId?.startsWith('dshow-')) {
      const bookingCode = `DUM${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      setSuccess({
        bookingCode,
        seats: selected.map((s) => s.id),
        totalAmount: total,
      });
      return;
    }

    setBooking(true);
    setError('');
    try {
      const { data } = await api.post(`/shows/${showId}/book`, {
        seats: selected.map(s => s.id),
        seatDetails: selected.map(s => ({ seatId: s.id, type: s.type, price: s.price })),
        totalAmount: total,
      });
      setSuccess(data.booking);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally { setBooking(false); }
  };

  // Types present in this theatre for legend
  const typeInfo = show ? [
    show.theater.recliners > 0 && { type: 'recliner', label: 'Recliner', price: show.theater.prices?.recliner, icon: '🛋️', color: 'text-red-600' },
    show.theater.premiumRows > 0 && { type: 'premium', label: 'Premium', price: show.theater.prices?.premium, icon: '⭐', color: 'text-amber-600' },
    { type: 'standard', label: 'Standard', price: show.theater.prices?.standard, icon: '💺', color: 'text-gray-600' },
  ].filter(Boolean) : [];

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex items-center gap-3 text-gray-500">
        <Loader2 size={22} className="animate-spin text-red-500" />
        <span>Loading cinema hall...</span>
      </div>
    </div>
  );

  if (error && !show) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center text-gray-500">
        <div className="text-5xl mb-3">⚠️</div>
        <div>{error}</div>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Go Back</button>
      </div>
    </div>
  );

  // Booking success screen
  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-white" />
        </div>
        <h2 className="text-gray-900 text-2xl font-extrabold mb-2">Booking Confirmed!</h2>
        <div className="text-gray-500 text-sm mb-6">Your seats are reserved</div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left mb-5">
          <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Booking Code</div>
          <div className="text-red-400 font-bold text-xl tracking-widest">{success.bookingCode}</div>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Movie</span>
              <span className="text-gray-900 font-semibold">{show?.movie?.title}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Seats</span>
              <span className="text-gray-900 font-semibold">{success.seats?.join(', ')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total</span>
              <span className="text-green-400 font-bold">₹{success.totalAmount}</span>
            </div>
          </div>
        </div>
        <button onClick={() => navigate('/movies')} className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition-colors">
          Browse More Movies
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors flex-shrink-0">
          <ArrowLeft size={17} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-gray-900 font-bold truncate">{show?.movie?.title}</div>
          <div className="text-gray-500 text-xs">{show?.theater?.name} · {show?.showTime} · {new Date(show?.showDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
        </div>
        {selected.length > 0 && (
          <div className="text-right flex-shrink-0">
            <div className="text-gray-900 font-bold">₹{total}</div>
            <div className="text-gray-500 text-xs">{selected.length} seat{selected.length !== 1 ? 's' : ''}</div>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-60px)]">
        {/* ── Cinema Hall ── */}
        <div className="flex-1 overflow-auto px-4 py-8">
          {/* Screen */}
          <div className="flex flex-col items-center mb-10 mx-auto" style={{ maxWidth: 680 }}>
            {/* Screen arc wall */}
            <div className="w-[85%] h-10 rounded-t-full border-t-2 border-x-2 border-gray-200"
              style={{ background: 'linear-gradient(to bottom, rgba(239,246,255,0.9), transparent)' }} />
            {/* Glowing screen line */}
            <div className="w-[78%] h-[6px] rounded-full" style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(148,163,184,0.35) 30%, rgba(255,255,255,1) 50%, rgba(148,163,184,0.35) 70%, transparent 100%)',
              boxShadow: '0 0 24px 8px rgba(148,163,184,0.2), 0 0 60px 20px rgba(226,232,240,0.6)',
            }} />
            <div className="mt-3 text-[11px] tracking-[0.4em] text-gray-500 uppercase font-semibold">S C R E E N</div>
            <div className="mt-1 text-[10px] text-gray-400 tracking-widest">ALL EYES THIS WAY</div>
          </div>

          {/* Seat Grid */}
          <div className="mx-auto" style={{ maxWidth: 680 }}>
            <div className="space-y-2">
              {grid.map(({ rowLetter, seats, type }) => {
                const half = Math.ceil(seats.length / 2);
                const leftSeats = seats.slice(0, half);
                const rightSeats = seats.slice(half);

                return (
                  <div key={rowLetter} className="flex items-center gap-2">
                    {/* Row label */}
                    <div className="w-6 text-center text-gray-500 text-xs font-bold flex-shrink-0">{rowLetter}</div>

                    {/* Seats wrapper */}
                    <div className="flex-1 flex items-center justify-center gap-1.5">
                      {/* Left block */}
                      <div className="flex items-center gap-1">
                        {leftSeats.map(seat => (
                          <Seat key={seat.id} seat={seat} isSelected={selected.some(s => s.id === seat.id)}
                            onClick={() => toggleSeat(seat)} />
                        ))}
                      </div>
                      {/* Aisle */}
                      <div className={`flex-shrink-0 ${type === 'recliner' ? 'w-10' : 'w-6'}`} />
                      {/* Right block */}
                      <div className="flex items-center gap-1">
                        {rightSeats.map(seat => (
                          <Seat key={seat.id} seat={seat} isSelected={selected.some(s => s.id === seat.id)}
                            onClick={() => toggleSeat(seat)} />
                        ))}
                      </div>
                    </div>

                    {/* Row label right */}
                    <div className="w-6 text-center text-gray-500 text-xs font-bold flex-shrink-0">{rowLetter}</div>
                  </div>
                );
              })}
            </div>

            {/* Legend + Prices */}
            <div className="mt-10 border-t border-gray-200 pt-8">
              <div className="text-gray-500 text-xs font-semibold uppercase tracking-widest text-center mb-6">Seat Categories & Prices</div>
              <div className="flex flex-wrap justify-center gap-6">
                {typeInfo.map(({ type, label, price, icon, color }) => (
                  <div key={type} className="flex items-center gap-3">
                    {/* Sample seat visual */}
                    <div className={`w-7 h-6 rounded-t-md border flex items-end justify-center pb-0.5 text-[9px] font-bold text-gray-500`}
                      style={{ borderColor: type === 'recliner' ? '#fecaca' : type === 'premium' ? '#fde68a' : '#d1d5db', backgroundColor: type === 'recliner' ? '#fef2f2' : type === 'premium' ? '#fffbeb' : '#ffffff', boxShadow: '0 1px 0 rgba(17,24,39,0.12)' }}>
                      1
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${color}`}>{icon} {label}</div>
                      <div className="text-gray-700 text-sm font-extrabold">₹{price} <span className="text-gray-500 font-normal text-xs">/ seat</span></div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Status legend */}
              <div className="flex items-center justify-center gap-8 mt-6 text-xs text-gray-500">
                <span className="flex items-center gap-2"><span className="w-5 h-4 rounded-t-sm border border-gray-300 bg-white inline-block"/>&nbsp;Available</span>
                <span className="flex items-center gap-2"><span className="w-5 h-4 rounded-t-sm border border-red-600 bg-red-600 inline-block shadow-sm shadow-red-200"/>&nbsp;Selected</span>
                <span className="flex items-center gap-2"><span className="w-5 h-4 rounded-t-sm border border-gray-200 bg-gray-100 opacity-70 inline-block"/>&nbsp;Booked</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Booking Summary Sidebar ── */}
        <div className="lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col">
          <div className="p-6 flex-1">
            <h2 className="text-gray-900 font-bold text-base mb-4">Your Selection</h2>

            {selected.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <div className="text-4xl mb-3">🎭</div>
                <div className="text-sm">Click on seats to select them</div>
                <div className="text-xs mt-1 text-gray-400">Max 10 seats per booking</div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Group by type */}
                {['recliner', 'premium', 'standard'].map(type => {
                  const seatsOfType = selected.filter(s => s.type === type);
                  if (!seatsOfType.length) return null;
                  const price = seatsOfType[0].price;
                  return (
                    <div key={type} className={`rounded-xl p-3 border ${type === 'recliner' ? 'bg-red-50 border-red-200' : type === 'premium' ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className={`text-xs font-bold mb-1 ${type === 'recliner' ? 'text-red-600' : type === 'premium' ? 'text-amber-600' : 'text-gray-600'}`}>
                            {type === 'recliner' ? '🛋️ Recliner' : type === 'premium' ? '⭐ Premium' : '💺 Standard'}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {seatsOfType.map(s => (
                              <span key={s.id} onClick={() => toggleSeat(s)}
                                className="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded cursor-pointer hover:border-red-300 hover:text-red-600 transition-colors">
                                {s.id} <X size={9}/>
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">{seatsOfType.length}×₹{price}</div>
                          <div className="text-gray-900 font-bold">₹{seatsOfType.length * price}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Total + Book */}
          <div className="p-6 border-t border-gray-200">
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-2.5 mb-3">
                <AlertCircle size={13} className="mt-0.5 flex-shrink-0" /> {error}
              </div>
            )}
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-gray-500 text-xs">{selected.length} seat{selected.length !== 1 ? 's' : ''} selected</div>
                <div className="text-gray-900 text-xl font-extrabold">₹{total}</div>
              </div>
              {selected.length > 0 && (
                <button onClick={() => setSelected([])} className="text-xs text-gray-500 hover:text-red-600 transition-colors">Clear all</button>
              )}
            </div>
            <button
              onClick={handleBook}
              disabled={selected.length === 0 || booking}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold text-sm transition-all duration-150 shadow-md shadow-red-200 disabled:shadow-none"
            >
              {booking ? (
                <span className="flex items-center justify-center gap-2"><Loader2 size={15} className="animate-spin" /> Booking...</span>
              ) : selected.length === 0 ? 'Select Seats to Continue' : `Confirm Booking · ₹${total}`}
            </button>
            <div className="text-center text-gray-500 text-xs mt-3">No cancellations once booked</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatPickerPage;
