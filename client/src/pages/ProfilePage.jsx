import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Shield, LogOut, Ticket, Settings, Activity, Loader2, Key } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, logout, updateProfile } = useAuth();
  
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isEditingSecurity, setIsEditingSecurity] = useState(false);
  
  const [name, setName] = useState(user?.name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user) return null;

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    
    if (name.trim() === user.name) {
      setLoading(false);
      setIsEditingDetails(false);
      return;
    }

    const { success: successRes, message } = await updateProfile({ name });
    if (successRes) {
      setSuccess('Profile updated successfully.');
      setIsEditingDetails(false);
    } else {
      setError(message);
    }
    setLoading(false);
  };

  const handleUpdateSecurity = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');

    if (!oldPassword || !newPassword) {
      setError('Please fill in both password fields.');
      setLoading(false);
      return;
    }

    const { success: successRes, message } = await updateProfile({ oldPassword, newPassword });
    if (successRes) {
      setSuccess('Password updated successfully.');
      setOldPassword('');
      setNewPassword('');
      setIsEditingSecurity(false);
    } else {
      setError(message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-20 px-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Profile</h1>
        
        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-bold border border-red-200">{error}</div>}
        {success && <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-200">{success}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Profile Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none" />
              
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-4xl sm:text-5xl font-black shadow-xl shrink-0 z-10 border-4 border-white">
                 {user.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 text-center sm:text-left z-10">
                <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold tracking-wide uppercase mb-3">
                  {user.role === 'admin' ? 'Administrator' : 'Movie Buff'}
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">{user.name}</h2>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-6 text-gray-500 font-medium">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" /> {user.email}
                  </div>
                  {user.role === 'admin' && (
                    <div className="flex items-center gap-2 text-red-600">
                      <Shield size={16} /> Admin Access
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
               <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Activity size={20} className="text-red-500" /> Account Settings
               </h3>
               
               <div className="space-y-4">
                  {/* Personal Details Section */}
                  {!isEditingDetails ? (
                    <div onClick={() => { setIsEditingDetails(true); setIsEditingSecurity(false); setError(''); setSuccess(''); }} className="p-4 rounded-2xl border border-gray-100 hover:border-red-200 hover:bg-red-50/30 transition-colors cursor-pointer group flex items-center justify-between">
                       <div>
                         <div className="font-bold text-gray-900 group-hover:text-red-700">Personal Details</div>
                         <div className="text-sm text-gray-500">Update your name</div>
                       </div>
                       <Settings size={18} className="text-gray-400 group-hover:text-red-500" />
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl border-2 border-red-100 bg-red-50/10">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><User size={16} className="text-red-500" /> Edit Personal Details</h4>
                      <form onSubmit={handleUpdateDetails} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20" required />
                        </div>
                        <div className="flex gap-3">
                          <button type="submit" disabled={loading} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-2">
                             {loading ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
                          </button>
                          <button type="button" onClick={() => { setIsEditingDetails(false); setName(user.name); }} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl">
                             Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Security Section */}
                  {!isEditingSecurity ? (
                    <div onClick={() => { setIsEditingSecurity(true); setIsEditingDetails(false); setError(''); setSuccess(''); }} className="p-4 rounded-2xl border border-gray-100 hover:border-red-200 hover:bg-red-50/30 transition-colors cursor-pointer group flex items-center justify-between">
                       <div>
                         <div className="font-bold text-gray-900 group-hover:text-red-700">Security</div>
                         <div className="text-sm text-gray-500">Change your password</div>
                       </div>
                       <Settings size={18} className="text-gray-400 group-hover:text-red-500" />
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl border-2 border-red-100 bg-red-50/10">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Key size={16} className="text-red-500" /> Change Password</h4>
                      <form onSubmit={handleUpdateSecurity} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Current Password</label>
                          <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20" required />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">New Password <span className="text-xs text-gray-400 font-normal">(min 6 chars)</span></label>
                          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20" required minLength="6" />
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button type="submit" disabled={loading} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-2">
                             {loading ? <Loader2 size={16} className="animate-spin" /> : 'Update Password'}
                          </button>
                          <button type="button" onClick={() => { setIsEditingSecurity(false); setOldPassword(''); setNewPassword(''); }} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl">
                             Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
               </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 rounded-full blur-3xl -mr-10 -mt-10 opacity-30 pointer-events-none" />
               <div className="relative z-10">
                 <div className="w-12 h-12 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center mb-4">
                   <Ticket size={24} />
                 </div>
                 <h3 className="text-xl font-bold mb-2">Your Bookings</h3>
                 <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                   View all your upcoming and past movie tickets in one place.
                 </p>
                 <Link to="/my-bookings" className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors">
                   View Bookings
                 </Link>
               </div>
            </div>

            <button 
              onClick={() => { logout(); window.location.href = '/'; }}
              className="w-full bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-700 text-gray-700 font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 group shadow-sm"
            >
              <LogOut size={18} className="text-gray-400 group-hover:text-red-500" /> Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
