import { useState } from 'react';
import { X, Lock, FileText, Heart, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth(); 

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters');
      return;
    }
    
    setIsLoading(true);
    setErrorMsg('');

    try {
      if (mode === 'signup') {
        const result = await signUp(email, password);
        if (result.success) {
          navigate('/onboarding');
          onClose();
        } else {
          setErrorMsg(result.error || 'Failed to sign up');
        }
      } else {
        const result = await signIn(email, password);
        if (result.success) {
          navigate('/dashboard'); // or wherever they should go post-login
          onClose();
        } else {
          setErrorMsg(result.error || 'Failed to sign in');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Yellow Top Accent */}
        <div className="h-1.5 w-full bg-[#fbbf24]" />
        
        <div className="p-6 sm:p-8">
          {/* Header row */}
          <div className="flex justify-between items-start mb-6">
            <div className="inline-flex items-center gap-1.5 bg-[#fff7ed] text-[#ea580c] px-3 py-1 rounded-full text-xs font-bold tracking-wide">
              <span>🎉</span> TRAVELMATE AI
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Typography */}
          <h2 className="text-2xl sm:text-[28px] font-extrabold text-gray-900 leading-tight mb-2">
            {mode === 'login' ? 'Welcome Back!' : 'Join TravelMate'}
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            {mode === 'login' ? 'Sign in to access your smart itineraries.' : 'Create an account to start planning.'}
          </p>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">
                Email Address
              </label>
              <div className="relative flex border border-gray-300 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all bg-white">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 pl-10 pr-4 py-3.5 outline-none text-gray-900 placeholder:text-gray-300 text-[15px] font-medium w-full"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">
                Password
              </label>
              <div className="relative flex border border-gray-300 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all bg-white">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={8}
                  className="flex-1 pl-10 pr-10 py-3.5 outline-none text-gray-900 placeholder:text-gray-300 text-[15px] font-medium w-full"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <p className="text-red-500 text-xs font-semibold">{errorMsg}</p>
            )}

            {/* Main CTA */}
            <button
              type="submit"
              disabled={isLoading || !email || password.length < 8}
              className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            
            {/* Toggle Mode */}
            <div className="text-center pt-2">
              <span className="text-gray-500 text-xs">
                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button 
                type="button" 
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setErrorMsg('');
                }}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-gray-500 font-medium whitespace-nowrap">
              <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-amber-500" /> Secure</span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1"><FileText className="w-3 h-3 text-purple-400" /> Encrypted</span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-rose-400" /> 50K+ Travelers</span>
            </div>
            <p className="text-[10px] text-gray-400 text-center">
              By continuing you agree to our <a href="#" className="underline hover:text-gray-600">Terms</a> and <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
