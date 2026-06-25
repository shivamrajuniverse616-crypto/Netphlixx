import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, User, Info, X, Plus, Home as HomeIcon, Film, Tv, Radio, Download, Check, Settings } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import MagneticButton from './MagneticButton';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onSearch, activeTab, setActiveTab, toggleMobileSearch, mobileSearchOpen }) {
  const { currentUser } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [accentColor, setAccentColor] = useLocalStorage('netphlix_accent', '#E50914');
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor);
  }, [accentColor]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
      if (onSearch) onSearch('');
    }
  };

  const handleTabClick = (item) => {
    setActiveTab(item);
    setSearchQuery('');
    if (onSearch) onSearch('');
    if (mobileSearchOpen) toggleMobileSearch();
    if (item === 'Live TV') {
      navigate('/live');
    } else if (item === 'My List') {
      navigate('/watchlist');
    } else {
      navigate('/', { state: { activeTab: item } });
    }
  };

  const navItems = [
    { name: 'Movies', icon: Film },
    { name: 'TV', icon: Tv },
    { name: 'Live TV', icon: Radio },
    { name: 'My List', icon: Plus }
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <nav
        className={`fixed top-0 w-full z-50 flex items-center justify-between px-4 md:px-8 py-3 transition-all duration-500 ${
          isScrolled ? 'bg-[#0a0a0c]/90 backdrop-blur-md shadow-2xl border-b border-white/5' : 'bg-gradient-to-b from-[#0a0a0c]/90 to-transparent'
        }`}
      >
        <div className="flex items-center">
          <h1 
            className="font-black text-2xl md:text-3xl tracking-tight cursor-pointer hover:scale-105 transition-transform flex items-center font-display"
            onClick={() => handleTabClick('Home')}
          >
            <span className="text-netflix-red">NETPHLIX</span>
          </h1>
        </div>

        {/* Center Search Bar */}
        <div className="hidden md:flex flex-1 justify-center max-w-2xl px-8">
          <div className="flex items-center w-full bg-[#2a2a2a] rounded-full px-4 py-2 border border-transparent focus-within:border-gray-500 focus-within:bg-[#1f1f1f] transition-all duration-300">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Type / to search"
              className="bg-transparent text-white w-full outline-none placeholder-gray-500"
              value={searchQuery}
              onChange={handleSearchChange}
              onClick={() => { if(onSearch && !searchQuery) onSearch(''); }}
            />
            {searchQuery && (
              <button className="min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer text-gray-400 hover:text-white transition-colors" onClick={() => {setSearchQuery(''); if(onSearch) onSearch('');}}>
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center space-x-2 text-white">
          <div className="flex space-x-2 mr-4">
            {navItems.map(item => (
              <button 
                key={item.name}
                onClick={() => handleTabClick(item.name === 'TV' ? 'TV Shows' : item.name)}
                className={`flex items-center px-5 py-2 min-h-[44px] rounded-full text-sm font-semibold transition-all duration-300 border ${activeTab === item.name || (activeTab === 'TV Shows' && item.name === 'TV') ? 'bg-white text-black border-white shadow-md' : 'border-white/10 text-gray-300 hover:text-white hover:bg-white/10'}`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.name}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 ml-2">
            <MagneticButton 
               className={`rounded-full border border-white/10 flex items-center justify-center cursor-pointer transition-colors ${currentUser ? 'w-11 h-11 bg-[#2a2a2a] hover:border-white/30' : 'px-4 py-2 bg-[var(--accent-color)] hover:bg-red-700'}`} 
               onClick={() => navigate(currentUser ? '/profile' : '/login')}
            >
               {currentUser ? <User className="w-5 h-5 text-gray-300 pointer-events-none" /> : <span className="text-sm font-bold text-white pointer-events-none">Sign In</span>}
            </MagneticButton>
            {currentUser && (
               <MagneticButton className="w-11 h-11 rounded-full border border-transparent flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setShowSettings(true)}>
                  <Settings className="w-5 h-5 text-gray-300 pointer-events-none" />
               </MagneticButton>
            )}
          </div>
        </div>

        {/* Mobile Search Input */}
        {mobileSearchOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#0a0a0c]/95 backdrop-blur-xl p-4 flex items-center shadow-2xl border-b border-white/10 animate-in slide-in-from-top-2 duration-300">
             <Search className="w-5 h-5 text-gray-400 mr-3" />
             <input
                type="text"
                autoFocus
                placeholder="Search Netphlix..."
                className="bg-transparent text-white w-full outline-none text-lg"
                onChange={(e) => { if (onSearch) onSearch(e.target.value); }}
             />
             <button className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-white" onClick={toggleMobileSearch}>
                <X className="w-6 h-6" />
             </button>
          </div>
        )}
      </nav>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center animate-in fade-in duration-300 p-4">
          <div className="bg-[#0a0a0c] border border-gray-800 rounded-xl p-6 md:p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-300">
             <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition min-w-[44px] min-h-[44px] flex items-center justify-center">
               <X className="w-6 h-6" />
             </button>
             <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
             
             <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 font-medium mb-2 block">Theme Accent Color</label>
                  <div className="flex flex-wrap gap-3">
                     {[
                       {name: 'Netflix Red', hex: '#E50914'},
                       {name: 'Neon Blue', hex: '#00D8FF'},
                       {name: 'Cyberpunk Purple', hex: '#B829EA'},
                       {name: 'Matrix Green', hex: '#00FF41'},
                       {name: 'Gold', hex: '#FFD700'}
                     ].map(color => (
                        <button 
                          key={color.name}
                          onClick={() => setAccentColor(color.hex)}
                          className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${accentColor === color.hex ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        >
                          {accentColor === color.hex && <Check className="w-6 h-6 text-white drop-shadow-md" />}
                        </button>
                     ))}
                  </div>
                </div>
             </div>

             <div className="mt-8 p-6 bg-gradient-to-r from-netflix-red/20 to-purple-900/20 border border-netflix-red/30 rounded-xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-r from-netflix-red/0 via-white/5 to-netflix-red/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
               {deferredPrompt ? (
                 <div className="relative flex flex-col items-center">
                   <div className="w-12 h-12 bg-netflix-red rounded-full flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(229,9,20,0.5)]">
                     <Download className="w-6 h-6 text-white" />
                   </div>
                   <h3 className="text-white font-bold text-lg mb-1">Get the Netphlix App</h3>
                   <p className="text-gray-400 text-sm text-center mb-4">Install our PWA for the best experience, offline access, and faster loading!</p>
                   <button onClick={handleInstall} className="w-full bg-white text-black font-bold py-3 rounded-full hover:scale-105 transition-transform shadow-lg min-h-[44px]">
                     Install Now
                   </button>
                 </div>
               ) : (
                 <div className="relative flex flex-col items-center">
                   <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4 border border-green-500/50">
                     <Check className="w-6 h-6 text-green-500" />
                   </div>
                   <h3 className="text-white font-bold text-lg mb-1">App Installed</h3>
                   <p className="text-gray-400 text-sm text-center">You are currently running the optimized web app experience.</p>
                 </div>
               )}
             </div>
             
             <div className="mt-8 pt-6 border-t border-gray-800 flex justify-end">
                <button onClick={() => setShowSettings(false)} className="bg-netflix-red text-white px-6 py-2 rounded font-bold hover:bg-red-700 transition min-h-[44px]">Done</button>
             </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#0a0a0c]/90 backdrop-blur-xl border-t border-white/10 flex justify-around items-center py-2 pb-safe z-[90] shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
         <div className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer text-gray-400 hover:text-white transition" onClick={() => handleTabClick('Home')}>
            <HomeIcon className={`w-6 h-6 ${activeTab === 'Home' ? 'text-white' : ''}`} />
            <span className="text-[10px] mt-1">Home</span>
         </div>
         <div className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer text-gray-400 hover:text-white transition" onClick={toggleMobileSearch}>
            <Search className={`w-6 h-6 ${mobileSearchOpen ? 'text-white' : ''}`} />
            <span className="text-[10px] mt-1">Search</span>
         </div>
         <div className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer text-gray-400 hover:text-white transition" onClick={() => navigate('/live')}>
            <Radio className={`w-6 h-6 ${location.pathname === '/live' ? 'text-white' : ''}`} />
            <span className="text-[10px] mt-1">Live TV</span>
         </div>
         <div className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer text-gray-400 hover:text-white transition" onClick={() => navigate('/watchlist')}>
            <Plus className={`w-6 h-6 ${location.pathname === '/watchlist' ? 'text-white' : ''}`} />
            <span className="text-[10px] mt-1">My List</span>
         </div>
         <div className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer text-gray-400 hover:text-white transition" onClick={() => navigate(currentUser ? '/profile' : '/login')}>
            <User className={`w-6 h-6 ${location.pathname === '/profile' ? 'text-white' : ''}`} />
            <span className="text-[10px] mt-1">{currentUser ? 'Profile' : 'Sign In'}</span>
         </div>
      </div>
    </>
  );
}
