import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, Clock, MapPin, Loader2, Armchair, Film } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../lib/api';

const formatShowTime = (timeStr) => {
  if (!timeStr) return '';
  try {
    const [hourStr, minStr] = timeStr.split(':');
    const hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minStr} ${ampm}`;
  } catch {
    return timeStr;
  }
};

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await api.get('/payment/my-bookings');
        if (data.success) {
          setBookings(data.bookings);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <main className="max-w-[1000px] mx-auto px-4 py-8 mt-[60px]">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
          <Ticket className="text-red-600" /> My Bookings
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900">No bookings found</h3>
            <p className="text-gray-500 text-sm mt-1 mb-4">You haven't booked any movies yet.</p>
            <Link to="/movies" className="inline-flex bg-red-600 text-white px-5 py-2 font-bold rounded hover:bg-red-700 transition">
              Browse Movies
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => {
              // Try to use the permanent snapshot first, fallback to populated show
              const showData = booking.showSnapshot?.movieTitle ? {
                movie: {
                  title: booking.showSnapshot.movieTitle,
                  poster: booking.showSnapshot.moviePoster,
                  format: booking.showSnapshot.movieFormat,
                  language: booking.showSnapshot.movieLanguage
                },
                theater: {
                  name: booking.showSnapshot.theaterName,
                  location: booking.showSnapshot.theaterLocation
                },
                showDate: booking.showSnapshot.showDate,
                showTime: booking.showSnapshot.showTime
              } : booking.show;

              // Ensure we have data to render
              if (!showData || !showData.movie || !showData.theater) return null;

              const showDate = new Date(showData.showDate).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });

              // Format purchase time in 12hr clock (AM/PM)
              const purchaseDate = new Date(booking.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
              const purchaseTime = new Date(booking.createdAt).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              });

              const formattedShowTime = formatShowTime(showData.showTime);

              return (
                <div key={booking._id} className="relative bg-white rounded-xl shadow-md border border-gray-100 flex flex-col sm:flex-row overflow-hidden group hover:shadow-lg transition-all duration-300">
                  {/* Movie Poster Side */}
                  <div className="w-full sm:w-28 md:w-36 h-40 sm:h-auto bg-gray-200 relative overflow-hidden shrink-0">
                    <img src={showData.movie.poster} alt={showData.movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 right-2 bg-green-600 text-white text-[0.6rem] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                      Confirmed
                    </div>
                  </div>

                  {/* Ticket Details Side */}
                  <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between bg-white relative">
                    {/* Decorative Ticket Cutouts */}
                    <div className="hidden sm:block absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full border-r border-gray-100" />
                    
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-xl font-black text-gray-900 leading-tight">{showData.movie.title}</h3>
                      </div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-3">{showData.movie.format} • {showData.movie.language}</div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-[0.65rem] text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar size={12}/> Date & Time</div>
                          <div className="text-sm font-bold text-gray-800">{showDate}</div>
                          <div className="text-sm font-bold text-red-600">{formattedShowTime}</div>
                        </div>
                        <div>
                          <div className="text-[0.65rem] text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin size={12}/> Cinema</div>
                          <div className="text-sm font-bold text-gray-800 truncate" title={showData.theater.name}>{showData.theater.name}</div>
                          <div className="text-xs font-medium text-gray-500 truncate" title={showData.theater.location}>{showData.theater.location}</div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-gray-200 pt-3 mt-1 flex flex-wrap justify-between items-end gap-3">
                      <div>
                        <div className="text-[0.65rem] text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Armchair size={12}/> Seats</div>
                        <div className="text-sm font-black text-gray-900 bg-gray-100 px-2 py-1 rounded inline-block">
                          {booking.seats.join(', ')} <span className="text-xs text-gray-500 font-medium ml-1">({booking.seats.length})</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[0.65rem] text-gray-400 font-bold uppercase tracking-wider mb-1">Total Paid</div>
                        <div className="text-lg font-black text-red-600">₹{booking.amount}</div>
                      </div>
                    </div>
                  </div>

                  {/* Barcode / Purchase info side */}
                  <div className="w-full sm:w-20 bg-gray-50 border-t sm:border-t-0 sm:border-l border-dashed border-gray-200 flex flex-row sm:flex-col items-center sm:justify-center justify-between p-3 relative">
                     <div className="hidden sm:block absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-r border-gray-100" />
                     
                     <div className="text-[0.6rem] text-gray-400 font-medium leading-tight text-left sm:text-center">
                        Purchased<br/><strong className="text-gray-700">{purchaseDate}</strong><br/>{purchaseTime}
                     </div>
                     
                     <div className="text-[0.65rem] text-gray-300 font-bold uppercase tracking-widest sm:-rotate-90 whitespace-nowrap mt-0 sm:mt-16">
                        {booking.bookingCode || booking._id.slice(-6).toUpperCase()}
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyBookingsPage;