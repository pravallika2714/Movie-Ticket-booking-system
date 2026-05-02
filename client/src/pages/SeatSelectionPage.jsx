import { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Armchair, Film, MonitorPlay, Ticket, Shield, Loader2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../lib/api';
import { io } from 'socket.io-client';

const getSeatClasses = (seatId, selected, isLockedByOther) => {
  const base = "w-8 h-8 sm:w-[34px] sm:h-[34px] rounded shrink-0 border-[1.5px] flex flex-col items-center justify-center gap-[1px] text-[0.55rem] sm:text-[0.55rem] font-bold transition-all duration-200 relative z-10 hover:z-30 hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] outline-none";
  if (isLockedByOther) return `${base} bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed hover:-translate-y-0 hover:shadow-none hover:z-10`;
  if (selected) return `${base} bg-red-600 text-white border-red-700`;
  return `${base} bg-transparent border-emerald-400 text-slate-600 hover:border-emerald-500`;
};

const SeatSelectionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState({
    title: 'Loading...', genre: '', duration: '', rating: '', format: '2D', language: ''
  });
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [realtimeLocks, setRealtimeLocks] = useState({});
  const [bookedSeats, setBookedSeats] = useState(new Set());
  const [prices, setPrices] = useState({ standard: 150, premium: 250, recliner: 400 });
  const [layoutConfig, setLayoutConfig] = useState([]);
  const socketRef = useRef(null);

  // Checkout states
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: '', type: 'success' });

  const showPopupMessage = (message, type = 'success') => {
    setPopup({ show: true, message, type });
    setTimeout(() => {
      setPopup(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    socketRef.current = io(backendUrl, {
      withCredentials: true,
    });

    socketRef.current.emit('join_show', id);

    socketRef.current.on('sync_locked_seats', (locks) => {
      const lockMap = {};
      locks.forEach(lock => {
        if (lock.socketId !== socketRef.current.id) {
           lockMap[lock.seat] = lock;
        }
      });
      setRealtimeLocks(lockMap);
    });

    socketRef.current.on('seat_locked', ({ seatId, socketId, status }) => {
      if (socketId !== socketRef.current.id) {
        setRealtimeLocks(prev => ({ ...prev, [seatId]: { socketId, status } }));
      }
    });

    socketRef.current.on('seat_unlocked', ({ seatId }) => {
      setRealtimeLocks(prev => {
        const next = { ...prev };
        delete next[seatId];
        return next;
      });
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [id]);

  useEffect(() => {
    const loadShowAndLayout = async () => {
      try {
        const { data } = await api.get(`/shows/${id}`);
        if (data?.show) {
          const { movie: m, theater: t } = data.show;
          setMovie({
            title: m.title,
            genre: m.genre?.join(', ') || '',
            duration: m.duration + ' min',
            rating: m.rating?.toString() || '0',
            format: '2D',
            language: m.language,
          });

          const loadedBookedSeats = new Set();
          if (data.show.bookedSeats) {
            data.show.bookedSeats.forEach(s => loadedBookedSeats.add(s));
          }
          setBookedSeats(loadedBookedSeats);

          if (t.layoutConfig && t.layoutConfig.length > 0) {
            setLayoutConfig(t.layoutConfig);
          } else {
            // Fallback for old theaters without layoutConfig
            const fallbackLayout = Array.from({ length: t.totalRows || 8 }, (_, i) => ({
              rowLabel: String.fromCharCode(65 + i),
              leftSeats: t.leftSeats || 5,
              rightSeats: t.rightSeats || 5,
              aisleGap: t.aisleGap || 2,
              tier: i < (t.recliners || 2) ? 'recliner' : i < (t.recliners || 2) + (t.premiumRows || 3) ? 'premium' : 'standard'
            }));
            setLayoutConfig(fallbackLayout);
          }

          if (t.prices) {
            setPrices({
              standard: t.prices.standard || 150,
              premium: t.prices.premium || 250,
              recliner: t.prices.recliner || 400
            });
          }
        }
      } catch {
        // Handle errors
      }
    };

    loadShowAndLayout();
  }, [id]);

  const toggleSeat = (seatId) => {
    if (bookedSeats.has(seatId) || realtimeLocks[seatId]) return;
    
    setSelectedSeats((current) => {
      if (current.includes(seatId)) {
        if (socketRef.current) socketRef.current.emit('deselect_seat', { showId: id, seatId });
        return current.filter((seat) => seat !== seatId);
      } else {
        if (socketRef.current) socketRef.current.emit('select_seat', { showId: id, seatId });
        return [...current, seatId];
      }
    });
  };

  const getSeatPrice = (seatId) => {
    const rowChar = seatId.charCodeAt(0) >= 65 ? seatId.charAt(0) : '?';
    const rowConf = layoutConfig.find(r => r.rowLabel === rowChar);
    if (!rowConf) return prices.standard;
    return prices[rowConf.tier] || prices.standard;
  };

  const seatPrice = selectedSeats.reduce((total, seatId) => total + getSeatPrice(seatId), 0);

  // Group layout rows into sections based on their tier
  const sectionsConfig = [
    { id: 'recliner', title: 'Recliner', subtitle: 'Top comfort', price: prices.recliner },
    { id: 'premium', title: 'Premium', subtitle: 'Best view', price: prices.premium },
    { id: 'standard', title: 'Classic', subtitle: 'Value seats', price: prices.standard },
  ];

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      
      // 1. Create order on backend
      const orderRes = await api.post('/payment/create-order', {
        showId: id,
        seats: selectedSeats,
        amount: seatPrice
      });

      const orderData = orderRes.data;

      // 2. Setup Razorpay options
      const options = {
        key: orderData.keyId, // razorpay key
        amount: orderData.order.amount,
        currency: "INR",
        name: "CineBook",
        description: `${movie.title} - ${selectedSeats.length} Tickets`,
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            const verifyRes = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id || orderData.order.id,
              razorpay_payment_id: response.razorpay_payment_id || 'mock_payment_' + Date.now(),
              razorpay_signature: response.razorpay_signature || 'mock_signature',
              bookingId: orderData.bookingId
            });
            if (verifyRes.data.success) {
               setIsProcessing(false);
               setShowCheckout(false);
               showPopupMessage('Booking Confirmed! Enjoy your movie.', 'success');
               setTimeout(() => navigate('/my-bookings'), 2000); // Redirect to my bookings after showing popup
            } else {
               setIsProcessing(false);
               showPopupMessage('Payment verification failed.', 'error');
            }
          } catch (err) {
            console.error(err);
            showPopupMessage('Payment verification failed.', 'error');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: "Movie Fan",
          email: "customer@cinebook.com",
          contact: "9999999999"
        },
        theme: {
          color: "#e11d48" // red-600 matched
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      // 3. Open Razorpay or mock it
      if (orderData.isMockMode || !window.Razorpay) {
        console.log("Mock Mode Active: Bypassing Razorpay UI directly to handler");
        options.handler({}); // bypass actual UI if keys aren't real
      } else {
        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response){
          showPopupMessage(`Payment failed: ${response.error.description}`, 'error');
          setIsProcessing(false);
        });
        rzp1.open();
      }

    } catch (error) {
      console.error(error);
      showPopupMessage('Error initiating checkout. Please try again.', 'error');
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <Navbar fixed={false} />
      <main className="pt-4 pb-20 mt-[68px] min-h-screen bg-[#fdfdfd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 grid gap-2 justify-items-center relative">

          <div className="w-full max-w-[1000px]">
            <div className="flex justify-between items-center mb-4 px-2">
              <button onClick={() => window.history.back()} className="inline-flex items-center gap-1 text-gray-500 hover:text-red-600 font-bold text-[0.8rem] transition-colors uppercase tracking-wide">
                <ArrowLeft size={14} /> Back
              </button>
              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wider">{movie.format}</span>
            </div>

            <div className="grid grid-cols-[auto_1fr_auto] gap-3 items-center bg-white p-3 rounded-xl mb-4 border border-gray-200 shadow-sm">
              <div className="w-10 h-14 sm:w-12 sm:h-16 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 text-white flex items-center justify-center shadow-md">
                <Film size={20} className="opacity-80" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-tight">{movie.title}</h1>
                <p className="text-gray-500 text-[0.75rem] sm:text-sm font-medium mt-0.5">{movie.genre} <span className="opacity-50 mx-1">•</span> {movie.duration} <span className="opacity-50 mx-1">•</span> {movie.language}</p>
              </div>
              <div className="text-right pl-3 border-l border-gray-200">
                <span className="block text-gray-400 text-[0.6rem] font-bold uppercase tracking-wider">Rating</span>
                <strong className="text-red-600 text-lg sm:text-xl font-black">{movie.rating}</strong>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-gray-500 text-[0.7rem] font-bold uppercase tracking-wide mb-6">
              <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-[3px] border-[1.5px] border-emerald-400 bg-transparent" /> Available</div>
              <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-[3px] border-none bg-red-600" /> Selected</div>
              <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-[3px] bg-gray-200" /> Sold</div>
            </div>

            {sectionsConfig.map((sectionConf) => {
              const rowsInTier = layoutConfig.filter(r => r.tier === sectionConf.id);
              if (rowsInTier.length === 0) return null;

              return (
                <section key={sectionConf.id} className="mt-5 border-t border-dashed border-gray-200 pt-5">
                  <div className="flex items-center justify-center gap-2 mb-0.5">
                    <div className="text-[0.95rem] font-extrabold text-gray-800 tracking-tight">{sectionConf.title}</div>
                    <div className="text-red-700 flex items-center text-[0.7rem] font-black bg-red-50 border border-red-100 px-1.5 py-0.5 rounded uppercase">
                      ₹{sectionConf.price}
                    </div>
                  </div>
                  <div className="text-center text-gray-400 text-[0.65rem] font-bold uppercase tracking-widest mb-4">{sectionConf.subtitle}</div>

                  <div className="grid gap-2 sm:gap-3 pb-2 p-1 overflow-x-auto w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <div className="min-w-min mx-auto w-full max-w-4xl">
                      {rowsInTier.map((rowConf) => (
                        <div key={rowConf.rowLabel} className="flex items-center mb-[0.35rem] sm:mb-2 w-full">
                          <div className="w-8 shrink-0 text-gray-400 text-[0.65rem] font-extrabold text-left select-none pl-1">{rowConf.rowLabel}</div>

                          <div className="flex-1 flex justify-end gap-1 sm:gap-1.5 p-1 shrink-0">
                            {/* Left Seats */}
                            {Array.from({ length: rowConf.leftSeats }).map((_, index) => {
                              const seatId = `${rowConf.rowLabel}${index + 1}`;
                              const isLocked = bookedSeats.has(seatId) || !!realtimeLocks[seatId];
                              return (
                                <button
                                  key={seatId}
                                  type="button"
                                  className={getSeatClasses(seatId, selectedSeats.includes(seatId), isLocked)}
                                  onClick={() => toggleSeat(seatId)}
                                  disabled={isLocked}
                                >
                                  <span className="leading-none">{seatId.slice(1)}</span>
                                </button>
                              );
                            })}
                          </div>

                          <div style={{ width: `${Math.max(15, rowConf.aisleGap * 10)}px` }} className="shrink-0" />

                          <div className="flex-1 flex justify-start gap-1 sm:gap-1.5 p-1 shrink-0">
                            {/* Right Seats */}
                            {Array.from({ length: rowConf.rightSeats }).map((_, index) => {
                              const seatId = `${rowConf.rowLabel}${rowConf.leftSeats + index + 1}`;
                              const isLocked = bookedSeats.has(seatId) || !!realtimeLocks[seatId];
                              return (
                                <button
                                  key={seatId}
                                  type="button"
                                  className={getSeatClasses(seatId, selectedSeats.includes(seatId), isLocked)}
                                  onClick={() => toggleSeat(seatId)}
                                  disabled={isLocked}
                                >
                                  <span className="leading-none">{seatId.slice(1)}</span>
                                </button>
                              );
                            })}
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )
            })}

            <div className="mt-12 max-w-sm mx-auto">
              <div className="flex justify-center items-center gap-2 text-gray-400 text-[0.65rem] font-black tracking-[0.15em] uppercase mb-2">
                <MonitorPlay size={12} className="opacity-50" /> Screen this side
              </div>
              <div className="h-2 rounded-full bg-gradient-to-b from-gray-100 via-gray-200 to-gray-50 shadow-[0_4px_10px_rgba(0,0,0,0.05)] relative overflow-hidden">
                <div className="absolute inset-x-[15%] inset-y-0 rounded-full bg-gradient-to-r from-transparent via-red-600/10 to-transparent blur-[1px]" />
              </div>
            </div>
          </div>

          {selectedSeats.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_15px_rgba(0,0,0,0.04)] px-4 py-3 pointer-events-auto">
              <div className="max-w-[1000px] mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-gray-800 font-bold items-baseline">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md">{selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''}</span>
                  <strong className="text-red-700 flex items-center text-xl">₹{seatPrice}</strong>
                </div>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-bold text-[0.8rem] transition-colors flex items-center gap-1.5 shadow-sm"
                  type="button"
                  onClick={() => setShowCheckout(true)}
                >
                  <Ticket size={14} /> Continue Booking
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ── Checkout Modal Overlay ── */}
      {showCheckout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-sm rounded-[1.5rem] shadow-2xl overflow-hidden animate-[pageFadeIn_0.2s_ease-out]">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-extrabold text-gray-900 text-lg">Order Summary</h3>
              <button 
                onClick={() => !isProcessing && setShowCheckout(false)}
                className="text-gray-400 hover:text-gray-700 transition"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Body */}
            <div className="px-6 py-6 pb-2">
              <div className="flex gap-4 mb-6">
                <div className="w-14 h-18 bg-gray-100 rounded-md shrink-0 border border-gray-200 overflow-hidden flex items-center justify-center">
                  <Film size={20} className="text-gray-300" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base leading-tight mb-1">{movie.title}</h4>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{movie.format} • {movie.language}</div>
                  <div className="text-sm font-semibold text-gray-700 mt-1">{selectedSeats.join(', ')} <span className="text-gray-400 text-xs">({selectedSeats.length} Tickets)</span></div>
                </div>
              </div>
              
              <div className="border-t border-dashed border-gray-200 pt-5 pb-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-500 text-sm font-medium">Ticket Fare</span>
                  <span className="text-gray-900 font-bold text-sm">₹{seatPrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm font-medium">Convenience Fee</span>
                  <span className="text-green-600 font-bold text-sm">Waived</span>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="bg-gray-50 px-6 py-5 border-t border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-900 font-extrabold text-lg">Total Amount</span>
                <span className="text-red-600 font-black text-2xl">₹{seatPrice}</span>
              </div>
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:to-red-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all flex justify-center items-center gap-2"
              >
                {isProcessing ? (
                  <><Loader2 size={18} className="animate-spin" /> Processing...</>
                ) : (
                  <><Shield size={16} /> Pay Securely via Razorpay</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Popup Notification ── */}
      {popup.show && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] max-w-sm w-[90%] pointer-events-none">
          <div className={`flex items-center gap-3 p-4 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] bg-white border ${popup.type === 'success' ? 'border-green-100' : 'border-red-100'} animate-[pageFadeIn_0.3s_ease-out]`}>
            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${popup.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {popup.type === 'success' ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
            </div>
            <div className="flex-1">
              <h4 className={`text-sm font-bold ${popup.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {popup.type === 'success' ? 'Success' : 'Error'}
              </h4>
              <p className="text-xs text-gray-600 mt-0.5">{popup.message}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SeatSelectionPage;
