'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, MapPin, Briefcase, Edit2, Camera, Heart, Film, LogOut, Home as HomeIcon, Zap, MessageCircle, Users, Sparkles, UserPlus, Smile, HeartHandshake, Globe, Coffee, Sun, Moon, PawPrint, Wine, Cigarette } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [likedYouCount, setLikedYouCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [editForm, setEditForm] = useState({
    name: '',
    age: 18,
    bio: '',
    location: '',
    gender: '',
    zodiac: '',
    education: '',
    pets: '',
    drinkingHabits: '',
    smokingHabits: '',
    interests: [] as string[],
    topFilms: [] as string[],
    relationshipGoals: [] as string[],
    preferredGender: [] as string[],
    preferredAgeMin: 18,
    preferredAgeMax: 50,
    preferredDistance: 50,
  });
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [showZodiacModal, setShowZodiacModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showPetsModal, setShowPetsModal] = useState(false);
  const [showDrinkingModal, setShowDrinkingModal] = useState(false);
  const [showSmokingModal, setShowSmokingModal] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [selectedProfilePic, setSelectedProfilePic] = useState<File | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [filmSearch, setFilmSearch] = useState('');
  const [filmResults, setFilmResults] = useState<any[]>([]);
  const [searchingFilms, setSearchingFilms] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchProfile();
    fetchLikedYouCount();
    fetchUnreadCount();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:5001/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched profile data:', data);
        console.log('Top films from API:', data.topFilms);
        console.log('Profile photos:', data.photos);
        setProfile(data);
        setEditForm({
          name: data.name || '',
          age: data.age || 0,
          bio: data.bio || '',
          location: data.location || '',
          gender: data.gender || '',
          zodiac: data.zodiac || '',
          education: data.education || '',
          pets: data.pets || '',
          drinkingHabits: data.drinkingHabits || '',
          smokingHabits: data.smokingHabits || '',
          interests: data.interests || [],
          topFilms: data.topFilms || [],
          relationshipGoals: data.relationshipGoals || [],
          preferredGender: data.preferredGender || [],
          preferredAgeMin: data.preferredAgeMin || 18,
          preferredAgeMax: data.preferredAgeMax || 50,
          preferredDistance: data.preferredDistance || 50,
        });
        // Set profile picture preview from photos array
        if (data.photos && data.photos.length > 0) {
          setProfilePicPreview(data.photos[0]);
        }
      } else {
        console.error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedYouCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5001/api/likes/received', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLikedYouCount(data.length || 0);
      }
    } catch (error) {
      console.error('Error fetching liked you count:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5001/api/messages/unread/count', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const toggleRelationshipGoal = (goal: string) => {
    setEditForm(prev => ({
      ...prev,
      relationshipGoals: prev.relationshipGoals.includes(goal)
        ? prev.relationshipGoals.filter(g => g !== goal)
        : [...prev.relationshipGoals, goal]
    }));
  };

  const searchFilms = async (query: string) => {
    if (!query.trim()) {
      setFilmResults([]);
      return;
    }

    setSearchingFilms(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=cdae6080cab925d15b7afd3c8e4894a5&query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setFilmResults(data.results.slice(0, 10)); // Show top 10 results
    } catch (error) {
      console.error('Error searching films:', error);
    } finally {
      setSearchingFilms(false);
    }
  };

  const addFilm = (film: any) => {
    if (editForm.topFilms.length >= 4) {
      alert('You can only select up to 4 films');
      return;
    }

    const posterUrl = `https://image.tmdb.org/t/p/w500${film.poster_path}`;
    if (!editForm.topFilms.includes(posterUrl)) {
      setEditForm({ ...editForm, topFilms: [...editForm.topFilms, posterUrl] });
    }
    setFilmSearch('');
    setFilmResults([]);
  };

  const removeFilm = (index: number) => {
    const newFilms = editForm.topFilms.filter((_, i) => i !== index);
    setEditForm({ ...editForm, topFilms: newFilms });
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedProfilePic(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use reverse geocoding to get city name
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          const city = data.address.city || data.address.town || data.address.village || '';
          const country = data.address.country || '';
          const location = city && country ? `${city}, ${country}` : data.display_name;
          
          setEditForm({ ...editForm, location });
        } catch (error) {
          console.error('Error getting location name:', error);
          setEditForm({ ...editForm, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please enter it manually.');
        setGettingLocation(false);
      }
    );
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Update profile data
      const response = await fetch('http://localhost:5001/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        // Upload profile picture if a new one was selected
        if (selectedProfilePic) {
          const photoFormData = new FormData();
          photoFormData.append('photo', selectedProfilePic);

          const photoResponse = await fetch('http://localhost:5001/api/profile/photo', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: photoFormData,
          });

          if (photoResponse.ok) {
            console.log('Profile picture updated successfully');
          }
        }

        await fetchProfile();
        setIsEditing(false);
        setSelectedProfilePic(null);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-xl mb-4">Profile not found</p>
          <button 
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-[#800020] text-white rounded-lg hover:bg-[#660019]"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-center relative">
        {/* Dark Mode Toggle */}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="absolute left-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300"
        >
          {isDarkMode ? (
            <Sun className="w-6 h-6 text-yellow-400" />
          ) : (
            <Moon className="w-6 h-6 text-gray-700" />
          )}
        </button>

        <div className="flex items-center gap-3">
          <img 
            src="/images/mflogo.png" 
            alt="MatchFlix Logo" 
            className="w-10 h-10 object-contain"
          />
          <h1 
            className="text-3xl font-bold" 
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

        <button
          onClick={handleLogout}
          className="absolute right-6 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-[#800020] transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Profile Header Card */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6">
            {/* Profile Info */}
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                {/* Circular Profile Picture */}
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-[#800020] to-[#660019] border-4 border-white shadow-lg">
                    {profile.photos && profile.photos[0] ? (
                      <img 
                        src={`http://localhost:5001${profile.photos[0]}`} 
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-12 h-12 text-white/50" />
                      </div>
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#800020] hover:bg-[#660019] rounded-full flex items-center justify-center transition-colors shadow-md">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Name and Info */}
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-800">{profile.name}, {profile.age}</h2>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-gray-600 text-sm">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile.gender && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span className="capitalize">{profile.gender}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-[#800020] text-white rounded-lg hover:bg-[#660019] transition-colors flex items-center gap-2 h-fit"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    About Me
                  </h3>
                  <p className="text-gray-600">{profile.bio}</p>
                </div>
              )}

              {/* Basics Section */}
              {(profile.zodiac || profile.education || profile.pets || profile.drinkingHabits || profile.smokingHabits) && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Basics</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.zodiac && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        <span className="text-gray-800 font-medium">{profile.zodiac}</span>
                      </div>
                    )}
                    {profile.education && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                        </svg>
                        <span className="text-gray-800 font-medium">{profile.education}</span>
                      </div>
                    )}
                    {profile.pets && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                        <PawPrint className="w-5 h-5 text-gray-700" />
                        <span className="text-gray-800 font-medium">{profile.pets}</span>
                      </div>
                    )}
                    {profile.drinkingHabits && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                        <Wine className="w-5 h-5 text-gray-700" />
                        <span className="text-gray-800 font-medium">{profile.drinkingHabits}</span>
                      </div>
                    )}
                    {profile.smokingHabits && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                        <Cigarette className="w-5 h-5 text-gray-700" />
                        <span className="text-gray-800 font-medium">{profile.smokingHabits}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Interests Section */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#800020]" />
                My Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest: string, index: number) => (
                  <span 
                    key={index}
                    className="px-4 py-2 bg-[#800020]/10 text-[#800020] rounded-full text-sm font-medium border border-[#800020]/20"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Relationship Goals Section */}
          {profile.relationshipGoals && profile.relationshipGoals.length > 0 && (
            <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-[#800020]" />
                Relationship Goals
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.relationshipGoals.map((goal: string, index: number) => (
                  <span 
                    key={index}
                    className="px-4 py-2 bg-[#800020]/10 text-[#800020] rounded-full text-sm font-medium border border-[#800020]/20"
                  >
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Top Films Section */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Film className="w-5 h-5 text-[#800020]" />
              My Top Films
            </h3>
            {profile.topFilms && profile.topFilms.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {profile.topFilms.map((filmUrl: string, index: number) => (
                  <div key={index} className="aspect-[2/3] rounded-lg overflow-hidden shadow-md">
                    <img 
                      src={filmUrl} 
                      alt={`Top film ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Film className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No films selected yet</p>
                <p className="text-sm mt-1">Click Edit to add your favorite films</p>
              </div>
            )}
          </div>

          {/* Preferences Section */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#800020]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              My Preferences
            </h3>
            <div className="space-y-4">
              {profile.preferredGender && profile.preferredGender.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Looking for</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.preferredGender.map((gender: string, index: number) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                      >
                        {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {(profile.preferredAgeMin || profile.preferredAgeMax) && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Age Range</p>
                  <p className="text-base font-medium text-gray-800">
                    {profile.preferredAgeMin || 18} - {profile.preferredAgeMax || 50} years old
                  </p>
                </div>
              )}
              {profile.preferredDistance && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Distance</p>
                  <p className="text-base font-medium text-gray-800">
                    Within {profile.preferredDistance} km
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Picture */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-[#800020] to-[#660019] border-4 border-gray-200">
                      {profilePicPreview || (profile.photos && profile.photos[0]) ? (
                        <img 
                          src={profilePicPreview || `http://localhost:5001${profile.photos[0]}`} 
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-12 h-12 text-white/50" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      id="profilePicInput"
                      accept="image/*"
                      onChange={handleProfilePicChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="profilePicInput"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#800020] text-white rounded-lg hover:bg-[#660019] transition-colors cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Change Photo</span>
                    </label>
                    <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF. Max size 5MB</p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800020] focus:border-transparent"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  value={editForm.age}
                  onChange={(e) => setEditForm({ ...editForm, age: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800020] focus:border-transparent"
                />
              </div>

              {/* Gender Identity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">How do you identify?</label>
                <select
                  value={editForm.gender}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800020] focus:border-transparent bg-white"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-Binary</option>
                  <option value="transgender">Transgender</option>
                  <option value="genderfluid">Genderfluid</option>
                  <option value="agender">Agender</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800020] focus:border-transparent"
                    placeholder="City, Country"
                  />
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={gettingLocation}
                    className="px-4 py-3 bg-[#800020] text-white rounded-lg hover:bg-[#660019] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {gettingLocation ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="hidden sm:inline">Use My Location</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Basics Section */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Basics</h3>
                <div className="space-y-0 border border-gray-200 rounded-2xl overflow-hidden">
                  {/* Zodiac */}
                  <button
                    type="button"
                    onClick={() => setShowZodiacModal(true)}
                    className="relative border-b border-gray-200 last:border-b-0 w-full"
                  >
                    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        <span className="text-lg font-medium text-gray-800">Zodiac</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-base ${editForm.zodiac ? 'text-gray-800' : 'text-gray-400'}`}>
                          {editForm.zodiac || 'Select'}
                        </span>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* Education */}
                  <button
                    type="button"
                    onClick={() => setShowEducationModal(true)}
                    className="relative border-b border-gray-200 last:border-b-0 w-full"
                  >
                    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                        </svg>
                        <span className="text-lg font-medium text-gray-800">Education</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-base ${editForm.education ? 'text-gray-800' : 'text-gray-400'}`}>
                          {editForm.education || 'Select'}
                        </span>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* Pets */}
                  <button
                    type="button"
                    onClick={() => setShowPetsModal(true)}
                    className="relative border-b border-gray-200 last:border-b-0 w-full"
                  >
                    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <PawPrint className="w-6 h-6 text-gray-700" />
                        <span className="text-lg font-medium text-gray-800">Pets</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-base ${editForm.pets ? 'text-gray-800' : 'text-gray-400'}`}>
                          {editForm.pets || 'Select'}
                        </span>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* Drinking Habits */}
                  <button
                    type="button"
                    onClick={() => setShowDrinkingModal(true)}
                    className="relative border-b border-gray-200 last:border-b-0 w-full"
                  >
                    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Wine className="w-6 h-6 text-gray-700" />
                        <span className="text-lg font-medium text-gray-800">Drinking Habits</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-base ${editForm.drinkingHabits ? 'text-gray-800' : 'text-gray-400'}`}>
                          {editForm.drinkingHabits || 'Select'}
                        </span>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* Smoking Habits */}
                  <button
                    type="button"
                    onClick={() => setShowSmokingModal(true)}
                    className="relative border-b border-gray-200 last:border-b-0 w-full"
                  >
                    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Cigarette className="w-6 h-6 text-gray-700" />
                        <span className="text-lg font-medium text-gray-800">Smoking Habits</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-base ${editForm.smokingHabits ? 'text-gray-800' : 'text-gray-400'}`}>
                          {editForm.smokingHabits || 'Select'}
                        </span>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800020] focus:border-transparent resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Top 4 Films */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Film className="w-4 h-4" />
                  My Top 4 Films
                </label>
                {editForm.topFilms.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {editForm.topFilms.map((filmUrl: string, index: number) => (
                      <div key={index} className="aspect-[2/3] rounded-lg overflow-hidden shadow-md border-2 border-gray-200 relative group">
                        <img 
                          src={filmUrl} 
                          alt={`Top film ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newFilms = editForm.topFilms.filter((_, i) => i !== index);
                            setEditForm({ ...editForm, topFilms: newFilms });
                          }}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
                    <Film className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No films selected yet</p>
                    <p className="text-xs mt-1">Films are set during registration</p>
                  </div>
                )}
              </div>

              {/* Distance Range */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-base font-semibold text-gray-800">Distance Range</label>
                  <span className="text-base font-semibold text-[#800020]">{editForm.preferredDistance} km</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="200"
                  value={editForm.preferredDistance}
                  onChange={(e) => setEditForm({ ...editForm, preferredDistance: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#800020]"
                  style={{
                    background: `linear-gradient(to right, #800020 0%, #800020 ${(editForm.preferredDistance / 200) * 100}%, #e5e7eb ${(editForm.preferredDistance / 200) * 100}%, #e5e7eb 100%)`
                  }}
                />
              </div>

              {/* Age Range */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-base font-semibold text-gray-800">Age Range</label>
                  <span className="text-base font-semibold text-[#800020]">{editForm.preferredAgeMin} - {editForm.preferredAgeMax}</span>
                </div>
                <div className="relative h-8 flex items-center">
                  {/* Track background */}
                  <div className="absolute w-full h-2 bg-gray-200 rounded-lg pointer-events-none"></div>
                  {/* Active track */}
                  <div 
                    className="absolute h-2 bg-[#800020] rounded-lg pointer-events-none"
                    style={{
                      left: `${((editForm.preferredAgeMin - 18) / 32) * 100}%`,
                      right: `${100 - ((editForm.preferredAgeMax - 18) / 32) * 100}%`
                    }}
                  ></div>
                  {/* Min slider */}
                  <input
                    type="range"
                    min="18"
                    max="50"
                    value={editForm.preferredAgeMin}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val < editForm.preferredAgeMax) {
                        setEditForm({ ...editForm, preferredAgeMin: val });
                      }
                    }}
                    className="absolute w-full appearance-none bg-transparent cursor-pointer range-slider-min"
                    style={{ zIndex: 3 }}
                  />
                  {/* Max slider */}
                  <input
                    type="range"
                    min="18"
                    max="50"
                    value={editForm.preferredAgeMax}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val > editForm.preferredAgeMin) {
                        setEditForm({ ...editForm, preferredAgeMax: val });
                      }
                    }}
                    className="absolute w-full appearance-none bg-transparent cursor-pointer range-slider-max"
                    style={{ zIndex: 4 }}
                  />
                </div>
                <style jsx>{`
                  input[type="range"] {
                    pointer-events: none;
                  }
                  input[type="range"]::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #800020;
                    cursor: pointer;
                    border: 3px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    pointer-events: auto;
                    position: relative;
                  }
                  input[type="range"]::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #800020;
                    cursor: pointer;
                    border: 3px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    pointer-events: auto;
                  }
                  input[type="range"]::-webkit-slider-runnable-track {
                    height: 0;
                  }
                  input[type="range"]::-moz-range-track {
                    height: 0;
                  }
                `}</style>
              </div>

              {/* Relationship Goals */}
              <div>
                <label className="block text-xl font-bold text-gray-800 mb-3">Relationship Goals</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => toggleRelationshipGoal('Dating')}
                    className={`py-2.5 px-4 rounded-full font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                      editForm.relationshipGoals.includes('Dating')
                        ? 'bg-[#800020] text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-[#800020]'
                    }`}
                  >
                    <Heart className="w-4 h-4" />
                    Dating
                  </button>
                  <button
                    onClick={() => toggleRelationshipGoal('Friendship')}
                    className={`py-2.5 px-4 rounded-full font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                      editForm.relationshipGoals.includes('Friendship')
                        ? 'bg-[#800020] text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-[#800020]'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    Friendship
                  </button>
                  <button
                    onClick={() => toggleRelationshipGoal('Casual')}
                    className={`py-2.5 px-4 rounded-full font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                      editForm.relationshipGoals.includes('Casual')
                        ? 'bg-[#800020] text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-[#800020]'
                    }`}
                  >
                    <Smile className="w-4 h-4" />
                    Casual
                  </button>
                  <button
                    onClick={() => toggleRelationshipGoal('Serious Relationship')}
                    className={`py-2.5 px-4 rounded-full font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                      editForm.relationshipGoals.includes('Serious Relationship')
                        ? 'bg-[#800020] text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-[#800020]'
                    }`}
                  >
                    <HeartHandshake className="w-4 h-4" />
                    Serious
                  </button>
                </div>
              </div>

              {/* Top Films */}
              <div>
                <label className="block text-xl font-bold text-gray-800 mb-3">Top 4 Films</label>
                
                {/* Selected Films */}
                {editForm.topFilms.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {editForm.topFilms.map((filmUrl: string, index: number) => (
                      <div key={index} className="aspect-[2/3] rounded-lg overflow-hidden shadow-md border-2 border-gray-200 relative group">
                        <img 
                          src={filmUrl} 
                          alt={`Top film ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeFilm(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Film Search */}
                {editForm.topFilms.length < 4 && (
                  <div className="relative">
                    <input
                      type="text"
                      value={filmSearch}
                      onChange={(e) => {
                        setFilmSearch(e.target.value);
                        searchFilms(e.target.value);
                      }}
                      placeholder="Search for films to add..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800020] focus:border-transparent"
                    />
                    
                    {/* Search Results */}
                    {filmResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                        {filmResults.map((film) => (
                          <button
                            key={film.id}
                            type="button"
                            onClick={() => addFilm(film)}
                            className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                          >
                            {film.poster_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w92${film.poster_path}`}
                                alt={film.title}
                                className="w-12 h-18 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-18 bg-gray-200 rounded flex items-center justify-center">
                                <Film className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{film.title}</p>
                              <p className="text-sm text-gray-500">{film.release_date?.split('-')[0]}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {searchingFilms && (
                      <div className="absolute right-3 top-3">
                        <svg className="animate-spin h-5 w-5 text-[#800020]" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      </div>
                    )}
                  </div>
                )}
                
                <p className="text-sm text-gray-500 mt-2">
                  {editForm.topFilms.length}/4 films selected
                </p>
              </div>

              {/* Save Button */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 py-3 px-6 bg-[#800020] text-white rounded-lg hover:bg-[#660019] transition-colors font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zodiac Selection Modal */}
      {showZodiacModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Select Zodiac Sign</h3>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'].map((sign) => (
                <button
                  key={sign}
                  onClick={() => {
                    setEditForm({ ...editForm, zodiac: sign });
                    setShowZodiacModal(false);
                  }}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    editForm.zodiac === sign ? 'bg-[#800020]/10 text-[#800020] font-semibold' : 'text-gray-800'
                  }`}
                >
                  {sign}
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowZodiacModal(false)}
                className="w-full py-3 px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Education Selection Modal */}
      {showEducationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Select Education Level</h3>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {['High School', 'Some College', 'Associate Degree', "Bachelor's Degree", "Master's Degree", 'Doctorate', 'Trade School', 'Other'].map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    setEditForm({ ...editForm, education: level });
                    setShowEducationModal(false);
                  }}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    editForm.education === level ? 'bg-[#800020]/10 text-[#800020] font-semibold' : 'text-gray-800'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowEducationModal(false)}
                className="w-full py-3 px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pets Selection Modal */}
      {showPetsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Select Pets</h3>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {['Dog', 'Cat', 'Both', 'Other Pets', 'No Pets', 'Want Pets', 'Allergic to Pets'].map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setEditForm({ ...editForm, pets: option });
                    setShowPetsModal(false);
                  }}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    editForm.pets === option ? 'bg-[#800020]/10 text-[#800020] font-semibold' : 'text-gray-800'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowPetsModal(false)}
                className="w-full py-3 px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drinking Habits Selection Modal */}
      {showDrinkingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Select Drinking Habits</h3>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {['Never', 'Rarely', 'Socially', 'Regularly', 'Prefer not to say'].map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setEditForm({ ...editForm, drinkingHabits: option });
                    setShowDrinkingModal(false);
                  }}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    editForm.drinkingHabits === option ? 'bg-[#800020]/10 text-[#800020] font-semibold' : 'text-gray-800'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowDrinkingModal(false)}
                className="w-full py-3 px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smoking Habits Selection Modal */}
      {showSmokingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Select Smoking Habits</h3>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {['Never', 'Trying to Quit', 'Socially', 'Regularly', 'Prefer not to say'].map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setEditForm({ ...editForm, smokingHabits: option });
                    setShowSmokingModal(false);
                  }}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    editForm.smokingHabits === option ? 'bg-[#800020]/10 text-[#800020] font-semibold' : 'text-gray-800'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowSmokingModal(false)}
                className="w-full py-3 px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-[#800020]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Logout</h2>
              <p className="text-gray-600">Are you sure you want to logout?</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 hover:scale-105 active:scale-95 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-3 px-6 bg-[#800020] text-white rounded-lg hover:bg-[#660019] hover:scale-105 active:scale-95 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button 
            onClick={() => router.push('/home')}
            className="flex flex-col items-center gap-1 text-[#800020] transition-all duration-300 hover:scale-110 active:scale-95 relative"
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#800020] rounded-full transition-all duration-300"></div>
            <HomeIcon className="w-6 h-6 transition-transform duration-300" />
            <span className="text-xs font-medium">Home</span>
          </button>
          
          <button 
            onClick={() => router.push('/liked-you')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#800020] transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <div className="relative">
              <Heart className="w-6 h-6 transition-transform duration-300" />
              {likedYouCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {likedYouCount > 9 ? '9+' : likedYouCount}
                </div>
              )}
            </div>
            <span className="text-xs font-medium">Liked You</span>
          </button>
          
          <button 
            onClick={() => router.push('/discover')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#800020] transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <svg className="w-6 h-6 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="6" width="20" height="3" rx="1.5"/>
              <rect x="2" y="11" width="20" height="3" rx="1.5"/>
              <rect x="2" y="16" width="20" height="3" rx="1.5"/>
            </svg>
            <span className="text-xs font-medium">Discover</span>
          </button>
          
          <button 
            onClick={() => router.push('/messages')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#800020] transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <div className="relative">
              <MessageCircle className="w-6 h-6 transition-transform duration-300" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </div>
            <span className="text-xs font-medium">Messages</span>
          </button>
          
          <button 
            onClick={() => router.push('/matches')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#800020] transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <Users className="w-6 h-6 transition-transform duration-300" />
            <span className="text-xs font-medium">Matches</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
