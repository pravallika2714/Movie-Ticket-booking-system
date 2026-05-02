import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../lib/api';
import { Film, MapPin, Plus, Trash2, Save, Building2, Clapperboard, Ticket, Edit2, X } from 'lucide-react';
import VisualTheaterEditor from '../components/VisualTheaterEditor';

const emptyMovie = { title: '', description: '', duration: '', genre: '', language: 'English', rating: '0', poster: '', trailer: '', releaseDate: '', director: '', status: 'now_showing', isActive: true };
const emptyTheater = { name: '', location: '', layoutConfig: [], standardPrice: '150', premiumPrice: '250', reclinerPrice: '400', isActive: true };
const emptyShow = { movie: '', theater: '', showDate: '', showTime: '' };

const AdminDashboard = () => {
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [shows, setShows] = useState([]);
  const [movieForm, setMovieForm] = useState(emptyMovie);
  const [theaterForm, setTheaterForm] = useState(emptyTheater);
  const [showForm, setShowForm] = useState(emptyShow);
  const [loading, setLoading] = useState(true);
  const [savingMovie, setSavingMovie] = useState(false);
  const [savingTheater, setSavingTheater] = useState(false);
  const [savingShow, setSavingShow] = useState(false);
  const [message, setMessage] = useState('');
  const [isVisualEditorOpen, setIsVisualEditorOpen] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [editingTheaterId, setEditingTheaterId] = useState(null);
  const [editingShowId, setEditingShowId] = useState(null);

  const formatTime = (time24) => {
    if (!time24) return '';
    const [h, m] = time24.split(':');
    const d = new Date(); d.setHours(h, m);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const showToast = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [moviesRes, theatersRes, showsRes] = await Promise.all([
        api.get('/admin/movies'),
        api.get('/admin/theaters'),
        api.get('/admin/shows'),
      ]);
      setMovies(moviesRes.data.movies || []);
      setTheaters(theatersRes.data.theaters || []);
      setShows(showsRes.data.shows || []);
    } finally {
      setLoading(false);
    }
  };

  const handlePosterUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPoster(true);
    const formData = new FormData();
    formData.append('poster', file);

    try {
      const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMovieForm(p => ({ ...p, poster: res.data.url }));
      showToast('Poster uploaded to Cloudinary');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload poster.');
    } finally {
      setUploadingPoster(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleMovieChange = (e) => setMovieForm(p => ({ ...p, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const handleTheaterChange = (e) => setTheaterForm(p => ({ ...p, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const handleShowChange = (e) => setShowForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const saveMovie = async (e) => {
    e.preventDefault(); setSavingMovie(true); setMessage('');
    try { await api.post('/admin/movies', movieForm); setMovieForm(emptyMovie); await loadData(); showToast('Movie added successfully.'); }
    catch (err) { showToast(err.response?.data?.message || 'Failed to save movie.'); }
    finally { setSavingMovie(false); }
  };

  const saveTheater = async (e) => {
    e.preventDefault(); setSavingTheater(true); setMessage('');
    try {
      if (editingTheaterId) {
        await api.put(`/admin/theaters/${editingTheaterId}`, theaterForm);
        showToast('Theater updated successfully.');
        setEditingTheaterId(null);
      } else {
        await api.post('/admin/theaters', theaterForm);
        showToast('Theater added successfully.');
      }
      setTheaterForm(emptyTheater);
      await loadData();
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save theater.'); }
    finally { setSavingTheater(false); }
  };

  const saveShow = async (e) => {
    e.preventDefault(); setSavingShow(true); setMessage('');
    try {
      if (editingShowId) {
        await api.put(`/admin/shows/${editingShowId}`, showForm);
        showToast('Show updated successfully.');
        setEditingShowId(null);
      } else {
        await api.post('/admin/shows', showForm);
        showToast('Show added successfully.');
      }
      setShowForm(emptyShow);
      await loadData();
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save show.'); }
    finally { setSavingShow(false); }
  };

  const startEditTheater = (t) => {
    setEditingTheaterId(t._id);
    setTheaterForm(t);
  };
  const startEditShow = (s) => {
    setEditingShowId(s._id);
    setShowForm({
      movie: s.movie?._id || '',
      theater: s.theater?._id || '',
      showDate: s.showDate ? new Date(s.showDate).toISOString().split('T')[0] : '',
      showTime: s.showTime || ''
    });
  };

  const deleteMovie = async (id) => { await api.delete(`/admin/movies/${id}`); await loadData(); };
  const deleteTheater = async (id) => { await api.delete(`/admin/theaters/${id}`); await loadData(); };
  const deleteShow = async (id) => { await api.delete(`/admin/shows/${id}`); await loadData(); };

  const totalSeats = theaters.reduce((sum, t) => {
    if (!t.layoutConfig) return sum;
    const tSeats = t.layoutConfig.reduce((rSum, r) => rSum + (r.leftSeats || 0) + (r.rightSeats || 0), 0);
    return sum + tSeats;
  }, 0);

  const inputClass = "w-full px-4 py-3 border-[1.5px] border-gray-200 rounded-lg text-[0.95rem] text-gray-900 bg-white outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all";
  const btnPrimary = "inline-flex items-center justify-center gap-2 px-6 py-2.5 font-bold text-sm rounded-lg bg-gradient-to-br from-red-600 to-red-700 text-white shadow-md shadow-red-600/30 hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-70 disabled:hover:translate-y-0 cursor-pointer";
  const iconBtn = "w-10 h-10 shrink-0 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white transition-colors cursor-pointer group";

  return (
    <div className="bg-gradient-to-b from-white to-red-50/40 min-h-screen">
      <Navbar />
      <main className="pt-[68px] pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">

          {message && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3.5 shadow-2xl rounded-2xl flex items-center md:min-w-[300px] justify-center text-sm font-bold text-white transition-all transform scale-100"
              style={{ backgroundColor: message.toLowerCase().includes('success') ? '#16a34a' : '#dc2626' }}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">

            {/* Movies Panel */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-red-600 text-xs font-extrabold tracking-widest uppercase mb-1">Catalog</div>
                  <h2 className="text-2xl font-bold text-gray-900">Movies</h2>
                </div>
                <Clapperboard size={24} className="text-red-500" />
              </div>

              <form className="grid gap-4 pb-6 border-b border-gray-100 mb-6" onSubmit={saveMovie}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1.5"><span className="text-[0.875rem] font-semibold text-gray-700">Title</span>
                    <input className={inputClass} name="title" value={movieForm.title} onChange={handleMovieChange} required />
                  </label>
                  <label className="flex flex-col gap-1.5"><span className="text-[0.875rem] font-semibold text-gray-700">Language</span>
                    <input className={inputClass} name="language" value={movieForm.language} onChange={handleMovieChange} />
                  </label>
                </div>
                <label className="flex flex-col gap-1.5"><span className="text-[0.875rem] font-semibold text-gray-700">Description</span>
                  <textarea className={`${inputClass} min-h-[100px] resize-y`} name="description" value={movieForm.description} onChange={handleMovieChange} required />
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="flex flex-col gap-1.5"><span className="text-[0.875rem] font-semibold text-gray-700">Duration (min)</span>
                    <input className={inputClass} type="number" name="duration" value={movieForm.duration} onChange={handleMovieChange} required />
                  </label>
                  <label className="flex flex-col gap-1.5"><span className="text-[0.875rem] font-semibold text-gray-700">Genre</span>
                    <input className={inputClass} name="genre" value={movieForm.genre} onChange={handleMovieChange} placeholder="Action, Drama" />
                  </label>
                  <label className="flex flex-col gap-1.5"><span className="text-[0.875rem] font-semibold text-gray-700">Rating</span>
                    <input className={inputClass} type="number" step="0.1" name="rating" value={movieForm.rating} onChange={handleMovieChange} />
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1.5"><span className="text-[0.875rem] font-semibold text-gray-700">Status</span>
                    <select className={inputClass} name="status" value={movieForm.status} onChange={handleMovieChange}>
                      <option value="now_showing">Now Showing</option>
                      <option value="coming_soon">Coming Soon</option>
                      <option value="ended">Ended</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5"><span className="text-[0.875rem] font-semibold text-gray-700">Poster Image (Cloudinary)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePosterUpload}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 mt-1 cursor-pointer"
                    />
                    {uploadingPoster && <span className="text-xs text-amber-600 font-medium">Uploading to cloud...</span>}
                    {movieForm.poster && !uploadingPoster && <span className="text-xs text-green-600 font-medium">Ready: {movieForm.poster.split('/').pop()}</span>}
                  </label>
                </div>
                <div className="mt-2 text-right">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-gray-700 text-sm font-semibold">
                    <input type="checkbox" name="isActive" checked={movieForm.isActive} onChange={handleMovieChange} className="w-4 h-4 accent-red-600 rounded" /> Active movie
                  </label>
                </div>
                <button className={btnPrimary} type="submit" disabled={savingMovie || uploadingPoster}><Plus size={16} /> {(savingMovie || uploadingPoster) ? 'Processing...' : 'Add Movie'}</button>
              </form>

              <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {loading ? <div className="p-4 border border-dashed border-gray-200 rounded-xl text-gray-500 text-center text-sm">Loading movies...</div> : movies.length === 0 ? <div className="p-4 border border-dashed border-gray-200 rounded-xl text-gray-500 text-center text-sm">No movies yet.</div> : movies.map(movie => (
                  <div key={movie._id} className="flex justify-between items-center gap-4 py-3.5 px-4 bg-gray-50 border border-gray-100 rounded-xl">
                    <div>
                      <strong className="text-gray-900 text-sm block">{movie.title}</strong>
                      <span className="text-gray-500 text-xs mt-0.5 block">{movie.genre?.join(', ')} • {movie.duration} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className={`${iconBtn} text-red-600 hover:bg-red-50 hover:border-red-200`} onClick={() => deleteMovie(movie._id)}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid gap-6 items-start">
              {/* Theater Panel */}
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow relative">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="text-red-600 text-xs font-extrabold tracking-widest uppercase mb-1">{editingTheaterId ? 'Editing Venue' : 'Venue'}</div>
                    <h2 className="text-2xl font-bold text-gray-900 line-clamp-1">{editingTheaterId ? `Edit ${theaterForm.name}` : 'Theaters'}</h2>
                  </div>
                  {editingTheaterId ? (
                    <button
                      onClick={() => { setEditingTheaterId(null); setTheaterForm(emptyTheater); }}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer">
                      <X size={14} /> Cancel Edit
                    </button>
                  ) : (
                    <MapPin size={24} className="text-red-500" />
                  )}
                </div>

                <form className="grid gap-4 pb-6 border-b border-gray-100 mb-6" onSubmit={saveTheater}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex flex-col gap-1.5"><span className="text-[0.875rem] font-semibold text-gray-700">Name</span>
                      <input className={inputClass} name="name" value={theaterForm.name} onChange={handleTheaterChange} required />
                    </label>
                    <label className="flex flex-col gap-1.5"><span className="text-[0.875rem] font-semibold text-gray-700">Location</span>
                      <input className={inputClass} name="location" value={theaterForm.location} onChange={handleTheaterChange} required />
                    </label>
                  </div>

                  <div className="py-2 mb-4">
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div>
                        <div className="text-[0.875rem] font-bold text-gray-900 mb-1">Interactive Layout Editor</div>
                        <div className="text-xs text-gray-500">Configure exact seats and tiers row-by-row.</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsVisualEditorOpen(true)}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-lg shadow-sm hover:border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        {theaterForm.layoutConfig?.length > 0 ? 'Edit Layout' : 'Create Layout'}
                      </button>
                    </div>
                  </div>

                  {isVisualEditorOpen && (
                    <VisualTheaterEditor
                      layoutConfig={theaterForm.layoutConfig}
                      setLayoutConfig={(newLayout) => setTheaterForm(p => ({ ...p, layoutConfig: newLayout }))}
                      onClose={() => setIsVisualEditorOpen(false)}
                      onSave={(newLayout) => setTheaterForm(p => ({ ...p, layoutConfig: newLayout }))}
                    />
                  )}

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <label className="flex flex-col gap-1.5"><span className="text-[0.875rem] font-semibold text-gray-700 text-red-600">Recliner ₹</span>
                      <input className={inputClass} type="number" name="reclinerPrice" value={theaterForm.reclinerPrice} onChange={handleTheaterChange} required min="0" />
                    </label>
                    <label className="flex flex-col gap-1.5"><span className="text-[0.875rem] font-semibold text-gray-700 text-purple-600">Premium ₹</span>
                      <input className={inputClass} type="number" name="premiumPrice" value={theaterForm.premiumPrice} onChange={handleTheaterChange} required min="0" />
                    </label>
                    <label className="flex flex-col gap-1.5"><span className="text-[0.875rem] font-semibold text-gray-700 text-blue-600">Standard ₹</span>
                      <input className={inputClass} type="number" name="standardPrice" value={theaterForm.standardPrice} onChange={handleTheaterChange} required min="0" />
                    </label>
                  </div>

                  <button className={btnPrimary} type="submit" disabled={savingTheater}><Save size={16} /> {savingTheater ? 'Saving...' : editingTheaterId ? 'Update Theater' : 'Add Theater'}</button>
                </form>

                <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {loading ? <div className="p-4 border border-dashed border-gray-200 rounded-xl text-gray-500 text-center text-sm">Loading theaters...</div> : theaters.length === 0 ? <div className="p-4 border border-dashed border-gray-200 rounded-xl text-gray-500 text-center text-sm">No theaters yet.</div> : theaters.map(t => (
                    <div key={t._id} className={`flex justify-between items-center gap-4 py-3.5 px-4 bg-gray-50 border ${editingTheaterId === t._id ? 'border-amber-300 bg-amber-50/50' : 'border-gray-100'} rounded-xl`}>
                      <div>
                        <strong className="text-gray-900 text-sm block">{t.name}</strong>
                        <span className="text-gray-500 text-xs mt-0.5 block">{t.location} • {t.layoutConfig?.length || 0} rows</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className={`${iconBtn} text-amber-600 hover:bg-amber-50 hover:border-amber-200`} onClick={() => startEditTheater(t)}><Edit2 size={16} /></button>
                        <button className={`${iconBtn} text-red-600 hover:bg-red-50 hover:border-red-200`} onClick={() => deleteTheater(t._id)}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Shows Panel */}
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow relative">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="text-red-600 text-xs font-extrabold tracking-widest uppercase mb-1">{editingShowId ? 'Editing Schedule' : 'Schedule'}</div>
                    <h2 className="text-2xl font-bold text-gray-900">{editingShowId ? 'Edit Show' : 'Shows'}</h2>
                  </div>
                  {editingShowId ? (
                    <button
                      onClick={() => { setEditingShowId(null); setShowForm(emptyShow); }}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer">
                      <X size={14} /> Cancel Edit
                    </button>
                  ) : (
                    <Ticket size={24} className="text-red-500" />
                  )}
                </div>

                <form className="grid gap-4 pb-6 border-b border-gray-100 mb-6" onSubmit={saveShow}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex flex-col gap-1.5"><span className="text-[0.875rem] font-semibold text-gray-700">Movie</span>
                      <select className={inputClass} name="movie" value={showForm.movie} onChange={handleShowChange} required>
                        <option value="">-- Choose Movie --</option>
                        {movies.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1.5"><span className="text-[0.875rem] font-semibold text-gray-700">Theater</span>
                      <select className={inputClass} name="theater" value={showForm.theater} onChange={handleShowChange} required>
                        <option value="">-- Choose Theater --</option>
                        {theaters.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                      </select>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex flex-col gap-1.5"><span className="text-[0.875rem] font-semibold text-gray-700">Date</span>
                      <input className={inputClass} type="date" name="showDate" value={showForm.showDate} onChange={handleShowChange} required />
                    </label>
                    <label className="flex flex-col gap-1.5"><span className="text-[0.875rem] font-semibold text-gray-700">Time</span>
                      <input className={inputClass} type="time" name="showTime" value={showForm.showTime} onChange={handleShowChange} required />
                    </label>
                  </div>
                  <button className={btnPrimary} type="submit" disabled={savingShow}><Save size={16} /> {savingShow ? 'Saving...' : editingShowId ? 'Update Show' : 'Add Show'}</button>
                </form>

                <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {loading ? <div className="p-4 border border-dashed border-gray-200 rounded-xl text-gray-500 text-center text-sm">Loading shows...</div> : shows.length === 0 ? <div className="p-4 border border-dashed border-gray-200 rounded-xl text-gray-500 text-center text-sm">No shows yet.</div> : shows.map(s => {
                    const d = new Date(s.showDate);
                    return (
                      <div key={s._id} className={`flex justify-between items-center gap-4 py-3.5 px-4 bg-gray-50 border ${editingShowId === s._id ? 'border-amber-300 bg-amber-50/50' : 'border-gray-100'} rounded-xl`}>
                        <div>
                          <strong className="text-gray-900 text-sm block">{s.movie?.title || 'Unknown'}</strong>
                          <span className="text-gray-500 text-xs mt-0.5 block">{s.theater?.name || 'Unknown'} • {d.toLocaleDateString()} at {formatTime(s.showTime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className={`${iconBtn} text-amber-600 hover:bg-amber-50 hover:border-amber-200`} onClick={() => startEditShow(s)}><Edit2 size={16} /></button>
                          <button className={`${iconBtn} text-red-600 hover:bg-red-50 hover:border-red-200`} onClick={() => deleteShow(s._id)}><Trash2 size={16} /></button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
