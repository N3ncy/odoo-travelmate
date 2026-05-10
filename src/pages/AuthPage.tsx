import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  MapPin,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Smartphone,
  CheckCircle
} from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'phone-otp' | 'verify-otp';

export function AuthPage() {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithPhone, verifyPhoneOTP } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }
        const result = await signUp(email, password, phone);
        if (result.success) {
          navigate('/onboarding');
        }
      } else {
        const result = await signIn(email, password);
        if (result.success) {
          navigate('/');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) return;
    setLoading(true);

    try {
      const result = await signInWithPhone(`+91${phone}`);
      if (result.success) {
        setOtpSent(true);
        setMode('verify-otp');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return;
    setLoading(true);

    try {
      const result = await verifyPhoneOTP(`+91${phone}`, otpCode);
      if (result.success) {
        navigate('/onboarding');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-teal-600/20" />
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative z-10 flex flex-col justify-center p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">Traveloop</span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-6">
            Find Your Perfect<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              Travel Buddy
            </span>
          </h1>

          <p className="text-gray-400 text-lg mb-8">
            Connect with verified travelers, plan safe trips, and create unforgettable memories together.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <span>KYC Verified Travelers</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <span>Smart AI Matching</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-emerald-400" />
              </div>
              <span>Real-Time Safety Features</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Traveloop</span>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8">
            {/* OTP Verification Mode */}
            {mode === 'verify-otp' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Verify OTP</h2>
                  <p className="text-gray-400">
                    Enter the 6-digit code sent to<br />
                    <span className="text-white">+91 {phone}</span>
                  </p>
                </div>

                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  ))}
                </div>

                <button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-center text-gray-400">
                  Didn't receive code?{' '}
                  <button onClick={handleSendOTP} className="text-emerald-400 hover:text-emerald-300">
                    Resend OTP
                  </button>
                </p>

                <button
                  onClick={() => setMode('phone-otp')}
                  className="w-full text-center text-gray-400 hover:text-white"
                >
                  Change Phone Number
                </button>
              </div>
            )}

            {/* Phone OTP Mode */}
            {mode === 'phone-otp' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Login with Phone</h2>
                  <p className="text-gray-400">We'll send you a verification code</p>
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400">
                    <Phone className="w-5 h-5" />
                    <span className="text-white">+91</span>
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full pl-24 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>

                <button
                  onClick={handleSendOTP}
                  disabled={loading || phone.length !== 10}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gray-800/50 text-gray-400">or continue with email</span>
                  </div>
                </div>

                <button
                  onClick={() => setMode('login')}
                  className="w-full py-3 bg-gray-700/50 border border-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Use Email Instead
                </button>
              </div>
            )}

            {/* Email Login/Signup Mode */}
            {(mode === 'login' || mode === 'signup') && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                  </h2>
                  <p className="text-gray-400">
                    {mode === 'login'
                      ? 'Sign in to continue your journey'
                      : 'Join the travel community'}
                  </p>
                </div>

                {/* Quick Phone Login Button */}
                <button
                  onClick={() => setMode('phone-otp')}
                  className="w-full py-3 bg-gray-700/50 border border-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Continue with Phone (OTP)
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gray-800/50 text-gray-400">or use email</span>
                  </div>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>

                  {mode === 'signup' && (
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        placeholder="Phone number (for verification)"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                      />
                    </div>
                  )}

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full pl-12 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {mode === 'signup' && (
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                        className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </form>

                <p className="text-center text-gray-400">
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    {mode === 'login' ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </div>
            )}
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            By continuing, you agree to our{' '}
            <a href="#" className="text-emerald-400 hover:text-emerald-300">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-emerald-400 hover:text-emerald-300">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
