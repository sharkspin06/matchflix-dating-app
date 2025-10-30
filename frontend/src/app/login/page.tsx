'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';
import ModernInput from '@/components/ModernInput';

export default function LoginPage() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await api.login(formData.email, formData.password);
      localStorage.setItem('token', response.token);
      
      setIsTransitioning(true);
      setTimeout(() => {
        router.push('/discover');
      }, 300);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={`min-h-screen bg-white flex items-center justify-center px-4 relative transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Content */}
      <div className="w-full max-w-md relative z-10">
        {/* Back to Home Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#800020] transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Home</span>
        </Link>

        <div className="rounded-3xl shadow-2xl p-8 space-y-6 bg-white">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <img src="/images/mflogo.png" alt="MatchFlix Logo" className="w-16 h-16 object-contain" style={{ backgroundColor: 'transparent' }} />
              <h1 
                className="text-4xl font-bold" 
                style={{ 
                  fontFamily: '"Kavoon", serif', 
                  fontWeight: 400, 
                  fontStyle: 'normal',
                  background: 'linear-gradient(135deg, #800020 0%, #ff6b6b 50%, #800020 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Matchflix
              </h1>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-600 text-sm">Sign in to continue your journey</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <ModernInput
              type="email"
              name="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />

            <div className="relative">
              <ModernInput
                type={showPassword ? "text" : "password"}
                name="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600 transition-colors z-10"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-[#800020] focus:ring-[#800020] accent-[#800020]"
                />
                <span className="text-gray-600">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-[#800020] hover:text-[#660019] font-medium hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-5 bg-[#800020] hover:bg-[#660019] text-white font-medium rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">OR</span>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-[#800020] hover:text-[#660019] font-semibold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
