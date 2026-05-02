import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Film, AlertCircle, CheckCircle, Check, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const passwordRules = [
  { label: 'At least 6 characters', test: (p) => p.length >= 6 },
  { label: 'Contains a letter', test: (p) => /[a-zA-Z]/.test(p) },
  { label: 'Contains a number', test: (p) => /\d/.test(p) },
];

const RegisterPage = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const result = await register(form.name.trim(), form.email, form.password);
    if (result.success) {
      navigate('/movies');
    } else {
      setServerError(result.message);
    }
  };

  const inputClass = "w-full px-4 py-3 border-[1.5px] border-gray-200 rounded-lg text-[0.95rem] text-gray-900 bg-white outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all";
  const inputErrClass = "w-full px-4 py-3 border-[1.5px] border-red-500 rounded-lg text-[0.95rem] text-gray-900 bg-white outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all";

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#0f0f0f] to-[#1a0a0a]">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-center p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,_rgba(225,29,72,0.2)_0%,_transparent_60%)]" />
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 no-underline mb-16">
            <Film size={28} className="text-red-600" />
            <span className="text-2xl font-extrabold text-white">Cine<span className="text-red-400">Book</span></span>
          </Link>
          <h2 className="text-4xl font-extrabold text-white leading-[1.2] mb-4">
            Your movie<br /><span className="text-red-400">journey begins.</span>
          </h2>
          <p className="text-gray-400 text-base leading-[1.7] max-w-[360px]">
            Create a free account and unlock access to hundreds of movies, exclusive shows, and real-time seat selection.
          </p>
          <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-2xl">
            <div className="text-3xl font-extrabold text-white mb-1">Free Forever</div>
            <div className="text-gray-400 text-sm mb-4">No credit card required to sign up</div>
            {['Browse 200+ movies', 'Real-time seat maps', 'Instant booking confirmation', 'Full booking history'].map(item => (
              <div key={item} className="flex items-center gap-3 text-gray-300 text-sm mb-2.5">
                <div className="w-5 h-5 rounded-full bg-red-600/20 flex items-center justify-center">
                  <Check size={12} className="text-red-400" />
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white lg:rounded-l-[2rem] relative">
        <button
          onClick={() => navigate('/')}
          aria-label="Back to home"
          className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="w-full max-w-[440px]">
          {/* Brand + back link */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-gray-400 hover:text-gray-700 text-xs font-semibold py-1 transition-colors"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <div className="flex items-center gap-1.5 lg:hidden">
              <Film size={20} className="text-red-600" />
              <span className="text-lg font-extrabold text-gray-900">
                Cine<span className="text-red-600">Book</span>
              </span>
            </div>
            <div className="w-[50px] lg:hidden" />
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-500 text-[0.95rem] mb-8">Fill in your details to get started for free</p>

          {serverError && (
            <div className="flex items-center gap-2 p-3.5 mb-5 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
              <AlertCircle size={16} /> {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.875rem] font-semibold text-gray-700 flex items-center gap-1.5" htmlFor="reg-name">
                  <User size={13} /> Full Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={errors.name ? inputErrClass : inputClass}
                  autoComplete="name"
                />
                {errors.name && <span className="text-red-600 text-xs mt-0.5 font-medium">{errors.name}</span>}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.875rem] font-semibold text-gray-700 flex items-center gap-1.5" htmlFor="reg-email">
                  <Mail size={13} /> Email Address
                </label>
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={errors.email ? inputErrClass : inputClass}
                  autoComplete="email"
                />
                {errors.email && <span className="text-red-600 text-xs mt-0.5 font-medium">{errors.email}</span>}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.875rem] font-semibold text-gray-700 flex items-center gap-1.5" htmlFor="reg-password">
                  <Lock size={13} /> Password
                </label>
                <div className="relative flex items-center">
                  <input
                    id="reg-password"
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className={`${errors.password ? inputErrClass : inputClass} pr-12`}
                    autoComplete="new-password"
                  />
                  <button type="button" className="absolute right-3 p-1 text-gray-400 hover:text-gray-700 transition-colors" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.password && <span className="text-red-600 text-xs mt-0.5 font-medium">{errors.password}</span>}
                {form.password && (
                  <div className="flex flex-col gap-1 mt-1.5">
                    {passwordRules.map((r) => (
                      <div key={r.label} className={`flex items-center gap-1.5 text-xs font-semibold ${r.test(form.password) ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle size={12} /> {r.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.875rem] font-semibold text-gray-700 flex items-center gap-1.5" htmlFor="reg-confirm">
                  <Lock size={13} /> Confirm Password
                </label>
                <div className="relative flex items-center">
                  <input
                    id="reg-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className={`${errors.confirmPassword ? inputErrClass : inputClass} pr-12`}
                    autoComplete="new-password"
                  />
                  <button type="button" className="absolute right-3 p-1 text-gray-400 hover:text-gray-700 transition-colors" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="text-red-600 text-xs mt-0.5 font-medium">{errors.confirmPassword}</span>}
              </div>

              <button
                type="submit"
                id="register-submit-btn"
                disabled={loading}
                className="mt-2 w-full flex items-center justify-center gap-2 h-12 font-bold text-base rounded-lg bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30 hover:from-red-700 hover:to-red-800 transition-all hover:-translate-y-[1px] disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? <><div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Creating account...</> : 'Create Account →'}
              </button>
            </div>
          </form>

          <div className="flex items-center gap-4 my-5 text-gray-400 text-xs font-semibold before:h-[1px] before:flex-1 before:bg-gray-200 after:h-[1px] after:flex-1 after:bg-gray-200">
            OR
          </div>

          <p className="text-center text-[0.9rem] text-gray-600 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-red-600 font-bold hover:text-red-700">
              Sign in &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
