import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { JanSevaLogo } from '../../components/brand/JanSevaLogo';
import {
  User,
  Briefcase,
  ShieldCheck,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Phone,
  MapPin,
  Star,
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

// ── Tab config ──────────────────────────────────
const ROLE_TABS = [
  {
    role: 'CUSTOMER',
    label: 'Customer',
    icon: User,
    color: 'bg-coop-600',
    desc: 'Book cooperative home services',
    badge: 'Free account',
  },
  {
    role: 'WORKER',
    label: 'Artisan / Worker',
    icon: Briefcase,
    color: 'bg-emerald-600',
    desc: 'Join the cooperative, get fair work',
    badge: '85% earnings yours',
  },
  {
    role: 'ADMIN',
    label: 'Cooperative Admin',
    icon: ShieldCheck,
    color: 'bg-indigo-700',
    desc: 'Manage your cooperative',
    badge: 'Code required',
  },
];

const SERVICE_CATEGORIES = [
  'Plumbing', 'Electrical', 'Carpentry', 'Painting',
  'Cleaning', 'Gardening', 'Driver', 'Caregiving', 'Appliance Repair'
];

const DEMO_CREDENTIALS = {
  CUSTOMER: { email: 'demo.customer@coopseva.local', password: 'Demo@123' },
  WORKER: { email: 'demo.worker@coopseva.local', password: 'Demo@123' },
  ADMIN: { email: 'demo.admin@coopseva.local', password: 'Demo@123' },
};

const INPUT_CLASS =
  'w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-coop-500 transition-shadow placeholder:text-slate-400';

const FormInput = ({ icon: Icon, label, error, ...props }) => (
  <div className="space-y-1">
    {label && <label className="text-xs font-bold text-slate-600">{label}</label>}
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />}
      <input
        className={`${INPUT_CLASS} ${Icon ? 'pl-10' : ''} ${error ? 'border-red-400 focus:ring-red-400' : ''}`}
        {...props}
      />
    </div>
    {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
  </div>
);

// ── Login Form ───────────────────────────────────
const LoginForm = ({ roleTab, onSuccess }) => {
  const { login, loading, authError, clearError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const tabConfig = ROLE_TABS.find(t => t.role === roleTab);

  const validate = () => {
    const errs = {};
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Enter a valid email';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    try {
      const data = await login(form.email, form.password);
      const role = data.user?.role;
      if (role === 'WORKER') navigate('/worker/dashboard');
      else if (role === 'ADMIN' || role === 'FEDERATION_ADMIN') navigate('/admin');
      else navigate('/customer/dashboard');
    } catch (_) { /* error shown via authError */ }
  };

  const handleDemoLogin = async () => {
    const credentials = DEMO_CREDENTIALS[roleTab];
    clearError();
    setFieldErrors({});
    try {
      const data = await login(credentials.email, credentials.password);
      const role = data.user?.role;
      if (role === 'WORKER') navigate('/worker/dashboard');
      else if (role === 'ADMIN' || role === 'FEDERATION_ADMIN') navigate('/admin');
      else navigate('/customer/dashboard');
    } catch (_) { /* error shown via authError */ }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput
        icon={Mail}
        label="Email Address"
        type="email"
        placeholder={`your@email.com`}
        value={form.email}
        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        error={fieldErrors.email}
        autoComplete="email"
      />

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-600">Password</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            className={`${INPUT_CLASS} pl-10 pr-10 ${fieldErrors.password ? 'border-red-400' : ''}`}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
          </button>
        </div>
        {fieldErrors.password && <p className="text-[11px] text-red-600 font-medium">{fieldErrors.password}</p>}
      </div>

      {authError && (
        <div className="flex items-start gap-2 text-xs bg-red-50 border border-red-200 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <span className="text-red-800">{authError}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 ${tabConfig?.color || 'bg-coop-600'} hover:opacity-90 text-white font-bold py-3 rounded-xl shadow-sm transition-all disabled:opacity-60`}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {loading ? 'Signing in...' : `Sign In as ${tabConfig?.label || 'User'}`}
      </button>

      <button
        type="button"
        onClick={handleDemoLogin}
        disabled={loading}
        className="w-full border border-dashed border-slate-300 text-slate-600 hover:border-coop-400 hover:text-coop-700 font-semibold py-2.5 rounded-xl text-xs transition-colors disabled:opacity-60"
      >
        Use {tabConfig?.label || 'role'} demo account
      </button>
      <p className="text-[10px] text-center text-slate-400">
        Demo access is available in non-production environments.
      </p>
    </form>
  );
};

// ── Customer Register Form ───────────────────────
const CustomerRegisterForm = ({ onSuccess }) => {
  const { register, loading, authError, clearError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', language: 'en' });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.length < 2) e.name = 'Full name required (min 2 chars)';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required';
    if (!form.phone.match(/^[\d\s+()-]{8,15}$/)) e.phone = 'Valid phone number required';
    if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password, role: 'CUSTOMER', language: form.language });
      navigate('/customer/dashboard');
    } catch (_) {}
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput icon={User} label="Full Name" type="text" placeholder="e.g. Priya Sharma" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} error={errors.name} autoComplete="name" />
      <FormInput icon={Mail} label="Email Address" type="email" placeholder="priya@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} error={errors.email} autoComplete="email" />
      <FormInput icon={Phone} label="Phone Number" type="tel" placeholder="+91 98110 00000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} error={errors.phone} autoComplete="tel" />

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-600">Preferred Language</label>
        <select value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))} className={INPUT_CLASS}>
          <option value="en">English</option>
          <option value="hi">हिन्दी (Hindi)</option>
          <option value="mr">मराठी (Marathi)</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-600">Password</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className={`${INPUT_CLASS} pl-10 pr-10 ${errors.password ? 'border-red-400' : ''}`} autoComplete="new-password" />
          <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-2.5 text-slate-400">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
        </div>
        {errors.password && <p className="text-[11px] text-red-600">{errors.password}</p>}
      </div>

      <FormInput icon={Lock} label="Confirm Password" type="password" placeholder="Re-enter password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} error={errors.confirm} autoComplete="new-password" />

      {authError && (
        <div className="flex items-start gap-2 text-xs bg-red-50 border border-red-200 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <span className="text-red-800">{authError}</span>
        </div>
      )}

      <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-coop-600 hover:bg-coop-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60 shadow-sm">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
        {loading ? 'Creating Account...' : 'Create Customer Account'}
      </button>

      <p className="text-[10px] text-center text-slate-400">
        By registering, you agree to Jan Seva's Terms of Service and Privacy Policy.
      </p>
    </form>
  );
};

// ── Worker Register Form ─────────────────────────
const WorkerRegisterForm = () => {
  const { register, loading, authError, clearError } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirm: '',
    workerCategory: 'Plumbing', experience: '', hourlyRate: '', language: 'en'
  });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim() || form.name.length < 2) e.name = 'Full name required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required';
    if (!form.phone.match(/^[\d\s+()-]{8,15}$/)) e.phone = 'Valid phone required';
    if (form.password.length < 6) e.password = 'Min. 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.workerCategory) e.workerCategory = 'Select a skill';
    if (!form.experience || isNaN(form.experience) || form.experience < 0) e.experience = 'Enter years of experience';
    if (!form.hourlyRate || isNaN(form.hourlyRate) || form.hourlyRate < 100) e.hourlyRate = 'Minimum ₹100/hr';
    return e;
  };

  const handleNext = (e) => {
    e.preventDefault();
    const errs = validateStep1();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const errs = validateStep2();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    try {
      await register({
        name: form.name, email: form.email, phone: form.phone, password: form.password,
        role: 'WORKER', language: form.language,
        workerCategory: form.workerCategory,
        experience: parseInt(form.experience),
        hourlyRate: parseInt(form.hourlyRate)
      });
      navigate('/worker/dashboard');
    } catch (_) {}
  };

  return (
    <div className="space-y-4">
      {/* Step Indicator */}
      <div className="flex items-center gap-2 text-xs font-bold">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
        <div className={`flex-1 h-0.5 ${step >= 2 ? 'bg-emerald-600' : 'bg-slate-200'}`} />
        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
        <span className="text-slate-500 ml-1">{step === 1 ? 'Personal Details' : 'Skills & Rates'}</span>
      </div>

      {step === 1 && (
        <form onSubmit={handleNext} className="space-y-4">
          <FormInput icon={User} label="Full Name" type="text" placeholder="e.g. Ramesh Kumar" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} error={errors.name} />
          <FormInput icon={Mail} label="Email Address" type="email" placeholder="ramesh@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} error={errors.email} />
          <FormInput icon={Phone} label="Mobile Number" type="tel" placeholder="+91 98110 22334" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} error={errors.phone} />

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Preferred Language</label>
            <select value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))} className={INPUT_CLASS}>
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="mr">मराठी (Marathi)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <input type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className={`${INPUT_CLASS} pl-10 pr-10 ${errors.password ? 'border-red-400' : ''}`} />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-2.5 text-slate-400">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
            {errors.password && <p className="text-[11px] text-red-600">{errors.password}</p>}
          </div>

          <FormInput icon={Lock} label="Confirm Password" type="password" placeholder="Re-enter password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} error={errors.confirm} />

          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
            Next: Skills & Rate <ChevronRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            Personal details saved. Now tell us about your skills.
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Primary Skill / Service Category *</label>
            <select value={form.workerCategory} onChange={e => setForm(f => ({ ...f, workerCategory: e.target.value }))} className={`${INPUT_CLASS} ${errors.workerCategory ? 'border-red-400' : ''}`}>
              {SERVICE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            {errors.workerCategory && <p className="text-[11px] text-red-600">{errors.workerCategory}</p>}
          </div>

          <FormInput
            label="Years of Experience *"
            type="number"
            min="0" max="50"
            placeholder="e.g. 5"
            value={form.experience}
            onChange={e => setForm(f => ({ ...f, experience: e.target.value }))}
            error={errors.experience}
          />

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Hourly Rate (₹) *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-500">₹</span>
              <input
                type="number" min="100" max="2000"
                placeholder="e.g. 299"
                value={form.hourlyRate}
                onChange={e => setForm(f => ({ ...f, hourlyRate: e.target.value }))}
                className={`${INPUT_CLASS} pl-8 ${errors.hourlyRate ? 'border-red-400' : ''}`}
              />
            </div>
            {errors.hourlyRate && <p className="text-[11px] text-red-600">{errors.hourlyRate}</p>}
            <p className="text-[10px] text-slate-400">You keep 85% of this. Suggested: ₹250–₹500/hr</p>
          </div>

          {/* Worker Benefits Banner */}
          <div className="bg-slate-800 rounded-xl p-3.5 space-y-1.5">
            <p className="text-xs font-bold text-white">Why join Jan Seva?</p>
            {['85% earnings directly to you', 'Fair workload distribution by AI', 'Cooperative welfare fund support', 'Verified & trusted platform'].map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-slate-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                {b}
              </div>
            ))}
          </div>

          {authError && (
            <div className="flex items-start gap-2 text-xs bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <span className="text-red-800">{authError}</span>
            </div>
          )}

          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(1)} className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {loading ? 'Creating Profile...' : 'Join as Cooperative Worker'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

// ── Admin Register Form ──────────────────────────
const AdminRegisterForm = () => {
  const { register, loading, authError, clearError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', adminCode: '', cooperativeName: '' });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required';
    if (!form.phone.match(/^[\d\s+()-]{8,15}$/)) e.phone = 'Valid phone required';
    if (form.password.length < 6) e.password = 'Min. 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    if (!form.adminCode.trim()) e.adminCode = 'Admin registration code is required';
    if (!form.cooperativeName.trim()) e.cooperativeName = 'Cooperative name required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password, role: 'ADMIN', adminCode: form.adminCode, cooperativeName: form.cooperativeName });
      navigate('/admin');
    } catch (_) {}
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-800 font-medium flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
        Admin registration requires a federation-issued code. Contact your cooperative federation if you don't have one.
      </div>

      <FormInput icon={User} label="Full Name" type="text" placeholder="e.g. Vikas Mehra" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} error={errors.name} />
      <FormInput icon={Mail} label="Official Email" type="email" placeholder="admin@cooperative.org" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} error={errors.email} />
      <FormInput icon={Phone} label="Contact Phone" type="tel" placeholder="+91 98110 00099" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} error={errors.phone} />
      <FormInput label="Cooperative Name" type="text" placeholder="e.g. Mumbai Central Artisan Co-op" value={form.cooperativeName} onChange={e => setForm(f => ({ ...f, cooperativeName: e.target.value }))} error={errors.cooperativeName} />

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-600">Password</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className={`${INPUT_CLASS} pl-10 pr-10 ${errors.password ? 'border-red-400' : ''}`} />
          <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-2.5 text-slate-400">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
        </div>
        {errors.password && <p className="text-[11px] text-red-600">{errors.password}</p>}
      </div>

      <FormInput icon={Lock} label="Confirm Password" type="password" placeholder="Re-enter password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} error={errors.confirm} />

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Admin Registration Code
        </label>
        <div className="relative">
          <input
            type={showCode ? 'text' : 'password'}
            placeholder="Enter federation-issued code"
            value={form.adminCode}
            onChange={e => setForm(f => ({ ...f, adminCode: e.target.value }))}
            className={`${INPUT_CLASS} pr-10 ${errors.adminCode ? 'border-red-400' : ''}`}
          />
          <button type="button" onClick={() => setShowCode(v => !v)} className="absolute right-3.5 top-2.5 text-slate-400">{showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
        </div>
        {errors.adminCode && <p className="text-[11px] text-red-600">{errors.adminCode}</p>}
        <p className="text-[10px] text-slate-400">Demo code: <code className="bg-slate-100 px-1 rounded">COOPSEVA_ADMIN_2026</code></p>
      </div>

      {authError && (
        <div className="flex items-start gap-2 text-xs bg-red-50 border border-red-200 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <span className="text-red-800">{authError}</span>
        </div>
      )}

      <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60 shadow-sm">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
        {loading ? 'Creating Admin Account...' : 'Register as Cooperative Admin'}
      </button>
    </form>
  );
};

// ── Main Auth Page Component ─────────────────────
export const AuthPage = () => {
  const [activeRole, setActiveRole] = useState('CUSTOMER');
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  const activeTab = ROLE_TABS.find(t => t.role === activeRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex">
            <JanSevaLogo showTagline />
          </div>
          <p className="text-xs text-slate-500">AI-Powered Cooperative Service Marketplace</p>
        </div>

        {/* Role Selection Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 flex gap-1">
          {ROLE_TABS.map(tab => (
            <button
              key={tab.role}
              onClick={() => { setActiveRole(tab.role); setActiveRole(tab.role); }}
              className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 ${
                activeRole === tab.role
                  ? `${tab.color} text-white shadow-sm`
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:block">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
          {/* Card header */}
          <div className={`px-6 pt-6 pb-4 ${activeTab?.color} bg-opacity-10`} style={{background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)'}}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {activeTab && <activeTab.icon className="w-5 h-5 text-slate-700" />}
                  <h1 className="text-lg font-extrabold text-slate-900">
                    {mode === 'login' ? `Sign In` : `Register`} as {activeTab?.label}
                  </h1>
                </div>
                <p className="text-xs text-slate-500">{activeTab?.desc}</p>
              </div>
              <span className="text-[10px] font-bold bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-600 shrink-0">
                {activeTab?.badge}
              </span>
            </div>

            {/* Login / Register Toggle */}
            <div className="flex gap-1 mt-4 bg-white/60 rounded-xl p-1 w-fit border border-slate-200">
              <button onClick={() => setMode('login')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'login' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}>
                Sign In
              </button>
              <button onClick={() => setMode('register')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'register' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}>
                Register
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 py-5">
            {mode === 'login' && <LoginForm roleTab={activeRole} />}
            {mode === 'register' && activeRole === 'CUSTOMER' && <CustomerRegisterForm />}
            {mode === 'register' && activeRole === 'WORKER' && <WorkerRegisterForm />}
            {mode === 'register' && activeRole === 'ADMIN' && <AdminRegisterForm />}
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center">
          <Link to="/" className="text-xs text-slate-400 hover:text-coop-600 flex items-center justify-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};
