import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, Ticket, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ fixed = true }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path 
    ? 'px-4 py-2 text-red-400 font-medium text-sm rounded-md transition-colors' 
    : 'px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 font-medium text-sm rounded-md transition-colors';

  return (
    <nav className={`${fixed ? 'fixed top-0 left-0 right-0' : 'static'} z-50 flex items-center justify-between px-8 h-[68px] bg-gray-900/95 backdrop-blur-md border-b border-white/10 transition-all`}>
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2 text-[1.4rem] font-extrabold text-white no-underline">
        <Film size={22} className="text-red-500" />
        Cine<span className="text-red-500">Book</span>
      </Link>

      {/* Desktop Links */}
      <div className="flex items-center gap-1">
        <Link to="/" className={isActive('/')}>Home</Link>
        <Link to="/movies" className={isActive('/movies')}>Movies</Link>
        {user ? (
          <>
            <Link to="/my-bookings" className={isActive('/my-bookings')}>My Bookings</Link>
            {user.role === 'admin' && (
              <Link to="/admin" className={isActive('/admin')}>Admin</Link>
            )}
            <div className="w-[1px] h-6 bg-white/10 mx-2" />
            <div className="flex items-center gap-2">
              <Link to="/profile" className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors">
                <User size={16} />
                {user.name.split(' ')[0]}
              </Link>
              <button 
                onClick={handleLogout} 
                className="flex items-center justify-center gap-2 px-4 py-1.5 font-medium text-sm rounded-md bg-red-600/15 text-red-400 border border-red-600/25 hover:bg-red-600/25 transition-colors"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className={isActive('/login')}>Login</Link>
            <Link to="/register" className="ml-2 inline-flex items-center justify-center gap-2 px-4 py-1.5 font-medium text-[0.8rem] rounded-md bg-gradient-to-br from-red-600 to-red-700 text-white shadow-md shadow-red-600/30 hover:from-red-700 hover:to-red-800 transition-all hover:-translate-y-[1px]">
              <Ticket size={14} /> Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
