'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';
import ModernInput from '@/components/ModernInput';

// TMDB Genre IDs
const GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
  { id: 10761, name: 'Coming of Age' },
  { id: 10762, name: 'Slice of Life' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isStepTransitioning, setIsStepTransitioning] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    age: '',
    bio: '',
    profilePicture: null as File | null,
    interestedIn: '',
    showGenderPreference: true,
    shownAs: '',
    topFilms: [] as any[],
    favoriteGenres: [] as number[],
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [checkingEmail, setCheckingEmail] = useState(false);

  const checkEmailAvailability = async (email: string) => {
    if (!email || !email.includes('@')) {
      setEmailError('');
      return;
    }

    setCheckingEmail(true);
    try {
      const response = await fetch(`http://localhost:5001/api/auth/check-email?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      
      if (data.exists) {
        setEmailError('This email is already registered');
      } else {
        setEmailError('');
      }
    } catch (error) {
      console.error('Error checking email:', error);
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Check email availability when email field changes
    if (name === 'email') {
      setEmailError('');
      // Debounce email check
      const timeoutId = setTimeout(() => {
        checkEmailAvailability(value);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, profilePicture: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenderSelect = (gender: string) => {
    setFormData({ ...formData, interestedIn: gender });
  };

  const searchFilms = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=cdae6080cab925d15b7afd3c8e4894a5&query=${encodeURIComponent(query)}&language=en-US&page=1`
      );
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error('Error searching films:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchFilms(query);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  const addFilm = (film: any) => {
    if (formData.topFilms.length < 4 && !formData.topFilms.find(f => f.id === film.id)) {
      setFormData({ ...formData, topFilms: [...formData.topFilms, film] });
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const removeFilm = (filmId: number) => {
    setFormData({ ...formData, topFilms: formData.topFilms.filter(f => f.id !== filmId) });
  };

  const toggleGenre = (genreId: number) => {
    if (formData.favoriteGenres.includes(genreId)) {
      setFormData({ ...formData, favoriteGenres: formData.favoriteGenres.filter(id => id !== genreId) });
    } else {
      if (formData.favoriteGenres.length < 5) {
        setFormData({ ...formData, favoriteGenres: [...formData.favoriteGenres, genreId] });
      }
    }
  };

  const handleNext = () => {
    if (step === 1 && (!formData.email || !formData.password)) {
      setError('Please fill in all fields');
      return;
    }
    if (step === 2 && (!formData.name || !formData.age || !formData.bio)) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setIsStepTransitioning(true);
    setTimeout(() => {
      setStep(step + 1);
      setIsStepTransitioning(false);
    }, 300);
  };

  const handleBack = () => {
    setError('');
    setIsStepTransitioning(true);
    setTimeout(() => {
      setStep(step - 1);
      setIsStepTransitioning(false);
    }, 300);
  };

  const handlePreferencesNext = () => {
    if (!formData.interestedIn) {
      setError('Please select who you are interested in');
      return;
    }
    setError('');
    setIsStepTransitioning(true);
    setTimeout(() => {
      setStep(4);
      setIsStepTransitioning(false);
    }, 300);
  };

  const handleFilmsNext = () => {
    if (formData.topFilms.length < 4) {
      setError('Please select 4 films');
      return;
    }
    if (formData.favoriteGenres.length === 0) {
      setError('Please select at least one genre');
      return;
    }
    setError('');
    setIsStepTransitioning(true);
    setTimeout(() => {
      setStep(5);
      setIsStepTransitioning(false);
    }, 300);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // First register the user
      const response = await api.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        age: parseInt(formData.age),
        gender: formData.shownAs,
      });
      localStorage.setItem('token', response.token);
      
      // Then update the profile with additional data
      const profileData = {
        bio: formData.bio || '',
        interests: formData.favoriteGenres.map(id => {
          const genre = GENRES.find(g => g.id === id);
          return genre ? genre.name : '';
        }).filter(Boolean),
        topFilms: formData.topFilms.map((film: any) => 
          film.poster_path ? `https://image.tmdb.org/t/p/w500${film.poster_path}` : ''
        ).filter(Boolean),
        preferredGender: [formData.interestedIn],
        relationshipGoals: [],
      };
      
      console.log('=== REGISTRATION: Sending profile data ===');
      console.log('topFilms array:', profileData.topFilms);
      console.log('topFilms length:', profileData.topFilms.length);
      console.log('Full profile data:', profileData);
      
      try {
        const profileResponse = await fetch('http://localhost:5001/api/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${response.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profileData),
        });
        
        console.log('Profile response status:', profileResponse.status);
        
        if (profileResponse.ok) {
          const profileResult = await profileResponse.json();
          console.log('✅ Profile updated successfully!');
          console.log('Saved profile:', profileResult);
          console.log('Saved topFilms:', profileResult.topFilms);
        } else {
          const errorText = await profileResponse.text();
          console.error('❌ Profile update failed!');
          console.error('Status:', profileResponse.status);
          console.error('Error:', errorText);
          alert('Failed to save profile data. Please try again.');
          return; // Don't redirect if profile update failed
        }
      } catch (updateError) {
        console.error('❌ Error updating profile:', updateError);
        alert('Failed to save profile data. Please try again.');
        return; // Don't redirect if profile update failed
      }

      // Upload profile picture if one was selected
      if (formData.profilePicture) {
        try {
          console.log('📸 Uploading profile picture...');
          console.log('File:', formData.profilePicture.name, formData.profilePicture.type);
          const photoFormData = new FormData();
          photoFormData.append('photo', formData.profilePicture);

          const photoResponse = await fetch('http://localhost:5001/api/profile/photo', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${response.token}`,
            },
            body: photoFormData,
          });

          if (photoResponse.ok) {
            const photoResult = await photoResponse.json();
            console.log('✅ Profile picture uploaded successfully!');
            console.log('Photo URL:', photoResult);
          } else {
            const errorText = await photoResponse.text();
            console.error('❌ Profile picture upload failed');
            console.error('Status:', photoResponse.status);
            console.error('Error:', errorText);
          }
        } catch (photoError) {
          console.error('❌ Error uploading profile picture:', photoError);
          // Don't block registration if photo upload fails
        }
      } else {
        console.log('⚠️ No profile picture selected');
      }
      
      setIsTransitioning(true);
      setTimeout(() => {
        router.push('/discover');
      }, 300);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={`min-h-screen bg-white flex items-center justify-center px-4 relative transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Content */}
      <div className={`w-full max-w-md transition-all duration-300 relative z-10 ${isStepTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        {/* Back to Home Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#800020] transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Home</span>
        </Link>

        {/* Step 1: Sign in using email */}
        {step === 1 && (
          <div className="rounded-3xl shadow-2xl p-8 space-y-6 bg-white">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-4">
                <img src="/images/mflogo.png" alt="MatchFlix Logo" className="w-16 h-16 object-contain" style={{ backgroundColor: 'transparent', filter: 'drop-shadow(0 0 1px white) drop-shadow(0 0 1px white)' }} />
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
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Create Your Account</h2>
              <p className="text-gray-600 text-sm">Start your journey to find your perfect match</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <ModernInput
                  type="email"
                  name="email"
                  label="Email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                />
                {checkingEmail && (
                  <p className="text-sm text-gray-500 mt-1">Checking email...</p>
                )}
                {emailError && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <span>⚠️</span> {emailError}
                  </p>
                )}
                {formData.email && !emailError && !checkingEmail && formData.email.includes('@') && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <span>✓</span> Email is available
                  </p>
                )}
              </div>

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
                  className="absolute right-3 bottom-3 text-gray-500 hover:text-gray-700 transition-colors z-10"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3 px-5 bg-[#800020] hover:bg-[#660019] text-white font-medium rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95"
            >
              Continue
            </button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-[#800020] hover:text-[#660019] font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        )}

        {/* Step 2: Personal Information */}
        {step === 2 && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-[#800020] transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Tell us about yourself</h2>
              <p className="text-gray-600 text-sm">Help others get to know you</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <ModernInput
                type="text"
                name="name"
                label="Name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />

              <ModernInput
                type="number"
                name="age"
                label="Age"
                value={formData.age}
                onChange={handleChange}
                placeholder="25"
                min="18"
                max="100"
                required
              />

              <ModernInput
                type="textarea"
                name="bio"
                label="Short Bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us a bit about yourself and your favorite films..."
                rows={4}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                <div className="flex items-center gap-4">
                  {previewUrl && (
                    <img src={previewUrl} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-gray-300" />
                  )}
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#800020] transition-colors">
                      <Upload className="w-5 h-5 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {formData.profilePicture ? formData.profilePicture.name : 'Upload photo'}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3 px-5 bg-[#800020] hover:bg-[#660019] text-white font-medium rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 3: Preferences */}
        {step === 3 && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-[#800020] transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Let's get started</h2>
              <p className="text-gray-600 text-sm">Tell us your preferences</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Who are you interested in?</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleGenderSelect('man')}
                    className={`py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200 ${
                      formData.interestedIn === 'man'
                        ? 'bg-[#800020] text-white border-[#800020]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#800020]'
                    }`}
                  >
                    Man
                  </button>
                  <button
                    onClick={() => handleGenderSelect('woman')}
                    className={`py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200 ${
                      formData.interestedIn === 'woman'
                        ? 'bg-[#800020] text-white border-[#800020]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#800020]'
                    }`}
                  >
                    Woman
                  </button>
                  <button
                    onClick={() => handleGenderSelect('everyone')}
                    className={`py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200 ${
                      formData.interestedIn === 'everyone'
                        ? 'bg-[#800020] text-white border-[#800020]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#800020]'
                    }`}
                  >
                    Everyone
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Show your preferred gender on your profile</label>
                  <button
                    onClick={() => setFormData({ ...formData, showGenderPreference: !formData.showGenderPreference })}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      formData.showGenderPreference ? 'bg-[#800020]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                        formData.showGenderPreference ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {formData.showGenderPreference && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">How do you identify?</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setFormData({ ...formData, shownAs: 'man' })}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200 ${
                        formData.shownAs === 'man'
                          ? 'bg-[#800020] text-white border-[#800020]'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-[#800020]'
                      }`}
                    >
                      Man
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, shownAs: 'woman' })}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200 ${
                        formData.shownAs === 'woman'
                          ? 'bg-[#800020] text-white border-[#800020]'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-[#800020]'
                      }`}
                    >
                      Woman
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, shownAs: 'non-binary' })}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200 ${
                        formData.shownAs === 'non-binary'
                          ? 'bg-[#800020] text-white border-[#800020]'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-[#800020]'
                      }`}
                    >
                      Non-binary
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, shownAs: 'transgender' })}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200 ${
                        formData.shownAs === 'transgender'
                          ? 'bg-[#800020] text-white border-[#800020]'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-[#800020]'
                      }`}
                    >
                      Transgender
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, shownAs: 'genderqueer' })}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200 ${
                        formData.shownAs === 'genderqueer'
                          ? 'bg-[#800020] text-white border-[#800020]'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-[#800020]'
                      }`}
                    >
                      Genderqueer
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, shownAs: 'genderfluid' })}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200 ${
                        formData.shownAs === 'genderfluid'
                          ? 'bg-[#800020] text-white border-[#800020]'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-[#800020]'
                      }`}
                    >
                      Genderfluid
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, shownAs: 'agender' })}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200 ${
                        formData.shownAs === 'agender'
                          ? 'bg-[#800020] text-white border-[#800020]'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-[#800020]'
                      }`}
                    >
                      Agender
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, shownAs: 'other' })}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200 ${
                        formData.shownAs === 'other'
                          ? 'bg-[#800020] text-white border-[#800020]'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-[#800020]'
                      }`}
                    >
                      Other
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handlePreferencesNext}
              className="w-full py-3 px-5 bg-[#800020] hover:bg-[#660019] text-white font-medium rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 4: Top 4 Films */}
        {step === 4 && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-[#800020] transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Choose Your Top 4 Films & Genres</h2>
              <p className="text-gray-600 text-sm">Share your favorite movies and genres to find better matches</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Selected Films Grid */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="aspect-[2/3] bg-gray-100 rounded-lg overflow-hidden relative border-2 border-dashed border-gray-300">
                  {formData.topFilms[index] ? (
                    <>
                      <img
                        src={`https://image.tmdb.org/t/p/w200${formData.topFilms[index].poster_path}`}
                        alt={formData.topFilms[index].title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeFilm(formData.topFilms[index].id)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                      >
                        ×
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                        <p className="text-white text-[10px] font-medium truncate">{formData.topFilms[index].title}</p>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      {index + 1}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search for films..."
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:bg-white focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/20 outline-none transition-all text-sm"
              />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-[#800020] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg">
                {searchResults.slice(0, 5).map((film) => (
                  <button
                    key={film.id}
                    onClick={() => addFilm(film)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    disabled={formData.topFilms.length >= 4}
                  >
                    {film.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${film.poster_path}`}
                        alt={film.title}
                        className="w-12 h-18 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-18 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                        No Image
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-800 text-sm">{film.title}</p>
                      <p className="text-xs text-gray-500">{film.release_date?.split('-')[0] || 'N/A'}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Favorite Genres */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">Favorite Genres</h3>
                <span className="text-xs text-gray-500">{formData.favoriteGenres.length}/5 selected</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => toggleGenre(genre.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      formData.favoriteGenres.includes(genre.id)
                        ? 'bg-[#800020] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    disabled={!formData.favoriteGenres.includes(genre.id) && formData.favoriteGenres.length >= 5}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleFilmsNext}
              disabled={formData.topFilms.length < 4}
              className="w-full py-3 px-5 bg-[#800020] hover:bg-[#660019] text-white font-medium rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 5: Before you swipe */}
        {step === 5 && (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <img src="/images/mflogo.png" alt="MatchFlix Logo" className="w-32 h-32 object-contain" style={{ backgroundColor: 'transparent', filter: 'drop-shadow(0 0 1px white) drop-shadow(0 0 1px white)' }} />
              </div>

              <h2 className="text-3xl font-bold text-gray-800">Before you swipe</h2>

              <div className="text-left space-y-4 max-w-lg mx-auto">
                <p className="text-gray-700">
                  Welcome! We're excited to be part of your dating journey.
                </p>

                <p className="text-gray-700">
                  Here we treat everyone with kindness and respect, no matter their race, religion, nationality, ethnicity, skin color, ability, size, sex, gender identity, or sexual orientation.
                </p>

                <p className="text-gray-700">
                  In our mission to actively keep MatchFlix safe and inclusive, we ask you to join us by adhering to our{' '}
                  <Link href="/guidelines" className="text-[#800020] hover:text-[#660019] font-semibold underline">
                    guidelines
                  </Link>
                  .
                </p>

                <p className="text-gray-700">
                  And remember: We've always got your back!
                </p>

                <p className="text-[#800020] font-semibold text-lg">
                  With love, The MatchFlix Team
                </p>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 px-5 bg-[#800020] hover:bg-[#660019] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? 'Creating account...' : 'I agree'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
