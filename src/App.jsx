import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { Search, Bell, User, Info, X, ChevronLeft, ChevronRight, ChevronDown, Plus, ThumbsUp, Home as HomeIcon, Star, Film, Tv, Radio, Gamepad2, Calendar, Clock, Download, Heart, Bookmark, Share2 } from 'lucide-react';
import { FaPlay as Play, FaPause as Pause, FaExpand as Maximize, FaVolumeHigh as Volume2, FaVolumeXmark as VolumeX, FaClosedCaptioning as Subtitles, FaGear as Settings, FaRotateRight as RotateCw, FaRotateLeft as RotateCcw, FaArrowLeft as ArrowLeft, FaHeadphones as Headphones, FaCheck as Check } from 'react-icons/fa6';
import { FastAverageColor } from 'fast-average-color';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useLocalStorage } from './hooks/useLocalStorage';
import Footer from './components/Footer';
import NetflixIntro from './components/NetflixIntro';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';
const IMAGE_BASE_URL_W500 = 'https://image.tmdb.org/t/p/w500';

const fac = new FastAverageColor();

// Endpoints
const requests = {
  fetchTrendingMovies: `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`,
  fetchActionMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28`,
  fetchSciFiMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=878`,
  fetchComedyMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=35`,
  
  fetchTrendingTV: `${BASE_URL}/trending/tv/week?api_key=${API_KEY}`,
  fetchActionTV: `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=10759`,
  fetchSciFiTV: `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=10765`,
  fetchComedyTV: `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=35`,
  
  fetchSearch: `${BASE_URL}/search/multi?api_key=${API_KEY}&query=`,
};

function getMediaType(item) {
  if (item?.media_type) return item.media_type;
  if (item?.title) return 'movie';
  if (item?.name) return 'tv';
  return 'movie';
}

function Navbar({ onSearch, activeTab, setActiveTab, toggleMobileSearch, mobileSearchOpen }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [accentColor, setAccentColor] = useLocalStorage('netphlix_accent', '#E50914');
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

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
    navigate('/');
  };

  const navItems = [
    { name: 'Movies', icon: Film },
    { name: 'TV', icon: Tv }
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <nav
        className={`fixed top-0 w-full z-50 flex items-center justify-between px-4 md:px-8 py-3 transition-all duration-500 ${
          isScrolled ? 'bg-shows-dark/90 backdrop-blur-md shadow-2xl' : 'bg-gradient-to-b from-shows-dark/80 to-transparent'
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
              <X className="w-4 h-4 cursor-pointer text-gray-400 hover:text-white transition-colors" onClick={() => {setSearchQuery(''); if(onSearch) onSearch('');}} />
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
                className={`flex items-center px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${activeTab === item.name || (activeTab === 'TV Shows' && item.name === 'TV') ? 'bg-white text-black border-white shadow-md' : 'border-white/20 text-gray-300 hover:text-white hover:bg-white/10'}`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.name}
              </button>
            ))}
          </div>

          <div className="w-10 h-10 rounded-full border border-gray-600 bg-[#2a2a2a] flex items-center justify-center cursor-pointer hover:border-white transition-colors" onClick={() => setShowSettings(true)}>
             <User className="w-5 h-5 text-gray-300" />
          </div>
        </div>

        {/* Mobile Search Input */}
        {mobileSearchOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#141414]/95 backdrop-blur-xl p-4 flex items-center shadow-2xl border-b border-white/10 animate-in slide-in-from-top-2 duration-300">
             <Search className="w-5 h-5 text-gray-400 mr-3" />
             <input
                type="text"
                autoFocus
                placeholder="Search Netphlix..."
                className="bg-transparent text-white w-full outline-none text-lg"
                onChange={(e) => { if (onSearch) onSearch(e.target.value); }}
             />
             <X className="w-6 h-6 text-gray-400 cursor-pointer hover:text-white" onClick={toggleMobileSearch} />
          </div>
        )}
      </nav>

      {/* Full Screen Dark Overlay removed for better UX */}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center animate-in fade-in duration-300 p-4">
          <div className="bg-[#141414] border border-gray-800 rounded-xl p-6 md:p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-300">
             <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
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
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${accentColor === color.hex ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        >
                          {accentColor === color.hex && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                        </button>
                     ))}
                  </div>
                </div>
             </div>
             
             <div className="mt-8 pt-6 border-t border-gray-800 flex justify-end">
                <button onClick={() => setShowSettings(false)} className="bg-netflix-red text-white px-6 py-2 rounded font-bold hover:bg-red-700 transition">Done</button>
             </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#141414]/80 backdrop-blur-xl border-t border-white/5 flex justify-around items-center py-3 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
         <div className="flex flex-col items-center cursor-pointer text-gray-400 hover:text-white transition" onClick={() => handleTabClick('Home')}>
            <HomeIcon className={`w-6 h-6 ${activeTab === 'Home' ? 'text-white' : ''}`} />
            <span className="text-[10px] mt-1">Home</span>
         </div>
         <div className="flex flex-col items-center cursor-pointer text-gray-400 hover:text-white transition" onClick={toggleMobileSearch}>
            <Search className={`w-6 h-6 ${mobileSearchOpen ? 'text-white' : ''}`} />
            <span className="text-[10px] mt-1">Search</span>
         </div>
         <div className="flex flex-col items-center cursor-pointer text-gray-400 hover:text-white transition" onClick={() => handleTabClick('My List')}>
            <Plus className="w-6 h-6" />
            <span className="text-[10px] mt-1">My List</span>
         </div>
      </div>
    </>
  );
}

function Hero({ movie }) {
  const [trailerKey, setTrailerKey] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [videoEnded, setVideoEnded] = useState(false);
  const [bgColor, setBgColor] = useState('rgba(20,20,20,1)');
  const navigate = useNavigate();

  useEffect(() => {
    if (!movie) return;
    setVideoEnded(false);
    
    // Extract dynamic color
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = `${IMAGE_BASE_URL_W500}${movie.backdrop_path}`;
    img.onload = () => {
      fac.getColorAsync(img)
        .then(color => {
          setBgColor(color.rgba);
        })
        .catch(e => console.log(e));
    };

    async function fetchTrailer() {
      const mediaType = getMediaType(movie);
      const url = `${BASE_URL}/${mediaType}/${movie.id}/videos?api_key=${API_KEY}`;
      try {
        const res = await fetch(url).then(r => r.json());
        const trailer = res.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        setTrailerKey(trailer ? trailer.key : null);
      } catch(e) {
        setTrailerKey(null);
      }
    }
    fetchTrailer();
  }, [movie]);

  if (!movie) return <div className="h-[60vh] md:h-[80vh] bg-[#141414]" />;

  const truncate = (str, n) => {
    return str?.length > n ? str.substr(0, n - 1) + '...' : str;
  };

  const isTV = getMediaType(movie) === 'tv';

  const onPlay = () => {
    navigate(`/watch/${isTV ? 'tv' : 'movie'}/${movie.id}`);
  };

  const onInfo = () => {
    navigate(`/title/${isTV ? 'tv' : 'movie'}/${movie.id}`, { state: { movie } });
  };

  return (
    <header className="h-[65vh] md:h-[85vh] relative text-white bg-[#141414] overflow-hidden">
      {/* Dynamic Color Gradient Overlay */}
      <div 
        className="absolute inset-0 w-full h-full z-0 transition-colors duration-1000 mix-blend-screen opacity-40" 
        style={{ background: `radial-gradient(circle at 70% 30%, ${bgColor} 0%, transparent 60%)` }}
      ></div>

      <div className="absolute inset-0 w-full h-full z-0">
        {trailerKey && !videoEnded ? (
          <div className="relative w-full h-[140%] -top-[20%] pointer-events-none hidden md:block">
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`}
              className="w-full h-full object-cover pointer-events-none"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              onLoad={() => {
                setTimeout(() => setVideoEnded(true), 120000); 
              }}
            ></iframe>
          </div>
        ) : (
          <div 
            className="w-full h-full bg-cover bg-center md:bg-top animate-in fade-in duration-1000"
            style={{ backgroundImage: `url("${IMAGE_BASE_URL}${movie?.backdrop_path || movie?.poster_path}")` }}
          />
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-10 hidden md:block"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent z-10 md:via-[#141414]/20"></div>
      
      <AnimatePresence mode="wait">
        <motion.div 
          key={movie?.id}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute bottom-[20%] md:top-[35%] px-4 md:ml-12 w-full md:max-w-2xl z-20 flex flex-col items-center md:items-start text-center md:text-left"
        >
          <div className="flex items-center justify-center md:justify-start space-x-2 mb-2 md:mb-4">
            <div className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 bg-[#E50914] text-white font-black text-[10px] md:text-xs rounded-sm shadow-lg">1S</div>
            <span className="text-gray-300 text-[10px] md:text-xs font-bold tracking-[0.2em]">{isTV ? 'SERIES' : 'FILM'}</span>
          </div>
        
        <h1 className="text-6xl md:text-[100px] font-medium font-display text-[#d8cba9] tracking-tight mb-4 md:mb-6 drop-shadow-2xl leading-[0.9] transition-all duration-700">
          {movie?.title || movie?.name || movie?.original_name}
        </h1>
        
        <div className="hidden md:flex items-center space-x-4 mb-6 font-semibold">
           <span className="text-green-500 font-bold drop-shadow-md">98% Match</span>
           <span className="drop-shadow-md">{movie?.release_date?.substring(0,4) || movie?.first_air_date?.substring(0,4)}</span>
           <span className="border border-white/50 bg-black/30 backdrop-blur-sm px-1.5 py-0.5 text-xs text-white rounded-sm drop-shadow-md">18+</span>
           <span className="border border-white/50 bg-black/30 backdrop-blur-sm px-1.5 py-0.5 text-xs text-white rounded-sm drop-shadow-md">HD</span>
        </div>

        <h1 className="hidden md:block text-base md:text-lg text-gray-200 font-medium drop-shadow-2xl mb-8 max-w-xl leading-snug">
          {truncate(movie?.overview, 200)}
        </h1>
        
        <div className="flex space-x-3 w-full md:w-auto justify-center md:justify-start">
          <button 
            onClick={onPlay}
            className="flex-1 md:flex-none flex items-center justify-center px-4 md:px-8 py-2 md:py-2.5 bg-white text-black font-bold rounded md:hover:bg-white/80 transition-all duration-200"
          >
            <Play className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 fill-current" /> Play
          </button>
          <button 
            onClick={onInfo}
            className="flex-1 md:flex-none flex items-center justify-center px-4 md:px-8 py-2 md:py-2.5 bg-[#6d6d6eb3] text-white font-bold rounded md:hover:bg-[#6d6d6e66] transition-all duration-300 backdrop-blur-sm hover:scale-105"
          >
            <Info className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" /> Info
          </button>
        </div>
        </motion.div>
      </AnimatePresence>

      {trailerKey && !videoEnded && (
        <div className="hidden md:flex absolute bottom-32 right-12 z-30 items-center space-x-4">
           <button 
             onClick={() => setIsMuted(!isMuted)}
             className="w-10 h-10 rounded-full border border-white/50 bg-black/20 backdrop-blur-md flex items-center justify-center hover:bg-white/10 transition-colors text-white"
           >
             {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
           </button>
           <div className="bg-black/40 backdrop-blur-md border-l-[3px] border-l-white text-white py-1 px-4 text-sm font-semibold tracking-widest shadow-lg">
             18+
           </div>
        </div>
      )}
    </header>
  );
}

function RowCard({ movie, isLargeRow, isTop10, onNavigate, onRemove }) {
  const [isHovered, setIsHovered] = useState(false);
  const [trailer, setTrailer] = useState(null);

  useEffect(() => {
    let timeout;
    if (isHovered) {
      timeout = setTimeout(async () => {
         try {
           const type = getMediaType(movie);
           const res = await fetch(`${BASE_URL}/${type}/${movie.id}/videos?api_key=${API_KEY}`).then(r => r.json());
           const t = res.results?.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
           if (t) setTrailer(t.key);
         } catch (e) {
           console.log('Error fetching trailer for row card', e);
         }
      }, 700); // 700ms delay to prevent spamming API on quick hover
    } else {
      setTrailer(null);
    }
    return () => clearTimeout(timeout);
  }, [isHovered, movie.id]);

  const ratingColor = movie.vote_average >= 8 ? 'ring-green-400' : movie.vote_average >= 6 ? 'ring-yellow-400' : 'ring-red-400';

  return (
    <motion.div 
      whileHover={{ scale: 1.05, zIndex: 50 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`group/card relative flex-none cursor-pointer rounded-md overflow-visible bg-transparent ${
        isLargeRow ? 'w-32 md:w-48' : 'w-44 md:w-60'
      } z-10 origin-center snap-center flex flex-col gap-2`}
      onClick={() => onNavigate(movie, 'info')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative w-full ${isLargeRow ? 'aspect-[2/3]' : 'aspect-video'} rounded-lg overflow-hidden shadow-lg group-hover/card:shadow-[0_10px_20px_rgba(43,130,246,0.3)] transition-all`}>
        {isHovered && trailer && !isLargeRow ? (
          <iframe
            src={`https://www.youtube.com/embed/${trailer}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${trailer}`}
            className="w-full h-full object-cover scale-[1.3] pointer-events-none"
            allow="autoplay; encrypted-media"
          />
        ) : (
          <img
            src={`${isLargeRow ? IMAGE_BASE_URL_W500 : IMAGE_BASE_URL}${isLargeRow ? movie.poster_path : (movie.backdrop_path || movie.poster_path)}`}
            alt={movie.title || movie.name}
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Rating Badge */}
        {movie.vote_average > 0 && !isTop10 && (
          <div className={`absolute top-2 left-2 w-8 h-8 rounded-full bg-[#111] flex items-center justify-center ring-2 ${ratingColor} shadow-black/50 shadow-md`}>
            <span className="text-white text-[10px] font-bold">{movie.vote_average.toFixed(1)}</span>
          </div>
        )}
      </div>

      {!isTop10 && (
        <div className="flex flex-col px-1">
          <h3 className="text-gray-200 font-semibold text-sm line-clamp-1 group-hover/card:text-netflix-red transition-colors">
            {movie.title || movie.name}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center text-xs text-gray-500 space-x-2">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-gray-300 font-bold">{movie.vote_average?.toFixed(1)}</span>
              <span>{movie.release_date?.substring(0,4) || movie.first_air_date?.substring(0,4)}</span>
            </div>
          </div>
          
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={isHovered ? { height: 'auto', opacity: 1, marginTop: 8 } : { height: 0, opacity: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <button className="w-full bg-white/10 hover:bg-netflix-red text-white text-xs font-bold py-1.5 rounded-full transition-colors flex items-center justify-center">
              Details <ChevronRight className="w-3 h-3 ml-1" />
            </button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

function Row({ title, fetchUrl, isLargeRow, isTop10, moviesArray, onRemove }) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const rowRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (moviesArray) {
      setMovies(moviesArray);
      setIsLoading(false);
      return;
    }
    async function fetchData() {
      if (!fetchUrl) return;
      try {
        const request = await fetch(fetchUrl).then(res => res.json());
        setMovies(request.results || []);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [fetchUrl, moviesArray]);

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth + 100 : scrollLeft + clientWidth - 100;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const onNavigate = (movie, action) => {
    const mediaType = getMediaType(movie);
    if (action === 'play') {
      navigate(`/watch/${mediaType}/${movie.id}`);
    } else {
      navigate(`/title/${mediaType}/${movie.id}`, { state: { movie } });
    }
  };

  if (isLoading) {
    return (
      <div className="pl-4 md:pl-12 my-6">
        <div className="w-48 h-6 rounded shimmer mb-3"></div>
        <div className="flex space-x-2">
           {[...Array(6)].map((_, i) => (
             <div key={i} className={`flex-none rounded shimmer ${isLargeRow ? 'w-28 md:w-44 aspect-[2/3]' : 'w-40 md:w-[280px] aspect-video'}`}></div>
           ))}
        </div>
      </div>
    );
  }

  if (!movies.length) return null;

  return (
    <motion.div 
      initial="hidden" 
      whileInView="show" 
      viewport={{ once: true, margin: "-50px" }} 
      variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
      className="pl-4 md:pl-12 my-4 md:my-6 group relative z-20"
    >
      {isTop10 ? (
        <div className="flex items-center mb-6 md:mb-10 cursor-pointer w-max pl-4 md:pl-8">
          <h2 className="text-6xl md:text-[100px] font-black text-transparent leading-none tracking-tighter" style={{ WebkitTextStroke: '2px #555' }}>
            TOP 10
          </h2>
          <div className="ml-4 flex flex-col text-sm md:text-xl tracking-[0.3em] text-gray-300 font-bold uppercase mt-2">
            <span>Movies</span>
            <span>Today</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center mb-2 md:mb-4 cursor-pointer group/title w-max">
          <h2 className="text-gray-100 text-xl md:text-3xl font-display font-bold tracking-tight">{title}</h2>
          {!moviesArray && (
            <span className="text-netflix-red font-bold text-xs ml-4 opacity-0 group-hover/title:opacity-100 transition-all hidden md:flex items-center hover:underline">
              View all
            </span>
          )}
        </div>
      )}

      <div className="relative">
        <div 
          className="hidden md:flex absolute left-0 top-0 bottom-0 w-12 bg-black/60 z-50 items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all hover:bg-black/80 hover:w-14 -ml-12"
          onClick={() => handleScroll('left')}
        >
          <ChevronLeft className="text-white w-8 h-8 hover:scale-125 transition-transform" />
        </div>

        <div 
          ref={rowRef}
          className="flex overflow-x-scroll md:overflow-x-hidden md:hover:overflow-x-scroll scrollbar-hide py-6 md:py-8 pr-4 md:pr-12 space-x-4 -ml-1 snap-x snap-mandatory"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {movies.slice(0, isTop10 ? 10 : movies.length).map((movie, index) => (
            ((isLargeRow && movie.poster_path) || (!isLargeRow && movie.backdrop_path)) && (
              <div key={movie.id} className={`relative flex items-center group/card-wrapper ${isTop10 ? 'pl-8 md:pl-20' : ''}`}>
                 {isTop10 && (
                   <span className="absolute left-0 bottom-[-10px] md:bottom-[-20px] text-[120px] md:text-[200px] font-black leading-none select-none tracking-tighter transition-all duration-500 group-hover/card-wrapper:scale-110 group-hover/card-wrapper:-translate-x-2 group-hover/card-wrapper:drop-shadow-[0_0_15px_rgba(229,9,20,0.5)] z-0" style={{ WebkitTextStroke: '2px #E50914', color: 'transparent' }}>
                     {index + 1}
                   </span>
                 )}
                 <div className="z-10 w-full h-full">
                   <RowCard 
                     movie={movie} 
                     isLargeRow={isLargeRow} 
                     isTop10={isTop10}
                     onNavigate={onNavigate} 
                     onRemove={onRemove} 
                   />
                 </div>
              </div>
            )
          ))}
        </div>

        <div 
          className="hidden md:flex absolute right-0 top-0 bottom-0 w-12 bg-black/60 z-50 items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all hover:bg-black/80 hover:w-14"
          onClick={() => handleScroll('right')}
        >
          <ChevronRight className="text-white w-8 h-8 hover:scale-125 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
}

function SearchResults({ query }) {
  const [movies, setMovies] = useState([]);
  const [filterYear, setFilterYear] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length < 2) return;
    async function searchMovies() {
      const url = `${requests.fetchSearch}${encodeURIComponent(query)}`;
      const req = await fetch(url).then(res => res.json());
      setMovies((req.results || []).filter(m => m.media_type !== 'person'));
    }
    const delayDebounceFn = setTimeout(() => {
      searchMovies();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const filteredMovies = movies.filter(m => {
    if (filterYear) {
      const year = m.release_date?.substring(0,4) || m.first_air_date?.substring(0,4);
      if (year !== filterYear) return false;
    }
    if (filterRating) {
      if ((m.vote_average || 0) < parseFloat(filterRating)) return false;
    }
    return m.poster_path || m.backdrop_path;
  });

  return (
    <div className="px-4 md:px-8 pt-24 md:pt-28 pb-24 min-h-screen bg-[#141414] flex flex-col md:flex-row gap-8">
      
      {/* Left Sidebar Filters */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full md:w-64 flex-none space-y-8"
      >
        <div>
          <h2 className="text-white text-2xl font-bold mb-6">Search</h2>
          <p className="text-gray-400 text-sm mb-4">Results for <span className="text-white font-semibold">"{query}"</span></p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Release Year</label>
            <select 
              className="w-full bg-[#2a2a2a] text-white border border-transparent focus:border-gray-500 rounded p-3 outline-none cursor-pointer transition-colors"
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
            >
              <option value="">Any Year</option>
              {Array.from({length: 40}, (_, i) => new Date().getFullYear() - i).map(y => (
                <option key={y} value={y.toString()}>{y}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-3">
            <label className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Minimum Rating</label>
            <select 
              className="w-full bg-[#2a2a2a] text-white border border-transparent focus:border-gray-500 rounded p-3 outline-none cursor-pointer transition-colors"
              value={filterRating}
              onChange={e => setFilterRating(e.target.value)}
            >
              <option value="">Any Rating</option>
              <option value="8">8.0+ Stars</option>
              <option value="7">7.0+ Stars</option>
              <option value="6">6.0+ Stars</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Results Grid */}
      <div className="flex-1">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4"
        >
          {filteredMovies.map((movie, i) => (
            <motion.div 
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative transition-all duration-300 md:hover:scale-110 md:hover:z-50 cursor-pointer rounded-lg overflow-hidden shadow-sm hover:shadow-[0_0_20px_rgba(0,0,0,0.8)] aspect-[2/3] group"
              onClick={() => navigate(`/title/${getMediaType(movie)}/${movie.id}`, { state: { movie } })}
            >
              <img
                src={`${IMAGE_BASE_URL_W500}${movie.poster_path || movie.backdrop_path}`}
                alt={movie.title || movie.name}
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="hidden md:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-center backdrop-blur-[2px]">
                <Play className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
              {movie.vote_average > 0 && (
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-green-400 font-bold text-xs px-2 py-1 rounded shadow-lg border border-white/10">
                  {movie.vote_average.toFixed(1)}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
        {movies.length === 0 && query.length >= 2 && (
          <div className="text-gray-400 text-lg mt-10">No matching titles found for "{query}".</div>
        )}
      </div>
    </div>
  );
}

function InlineBanner({ movie }) {
  if (!movie) return null;
  const navigate = useNavigate();
  return (
    <div className="mx-4 md:mx-12 my-12 md:my-16 relative rounded-2xl overflow-hidden bg-shows-dark shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row h-auto md:h-[400px]">
      <div className="w-full md:w-1/2 relative h-64 md:h-full overflow-hidden">
         <img src={`${IMAGE_BASE_URL}${movie.backdrop_path}`} className="w-full h-full object-cover" />
         <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-shows-dark via-shows-dark/80 to-transparent"></div>
      </div>
      <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative z-10 -mt-20 md:mt-0 bg-gradient-to-t md:bg-none from-shows-dark to-transparent">
         <h2 className="text-4xl md:text-6xl font-black text-white mb-4 leading-none font-display uppercase tracking-tight drop-shadow-md">{movie.title || movie.name}</h2>
         <div className="flex items-center space-x-3 text-xs md:text-sm text-gray-400 mb-4 font-semibold">
           <span className="px-2 py-0.5 bg-white/10 rounded-full text-netflix-red border border-netflix-red/30">{movie.vote_average?.toFixed(1)} Rating</span>
           <span>{movie.release_date?.substring(0,4) || movie.first_air_date?.substring(0,4)}</span>
         </div>
         <p className="text-gray-400 text-sm md:text-base line-clamp-3 mb-8 max-w-md">{movie.overview}</p>
         <button onClick={() => navigate(`/title/${movie.title ? 'movie' : 'tv'}/${movie.id}`, { state: { movie } })} className="bg-netflix-red text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition self-start shadow-lg shadow-red-500/30 flex items-center">
            <Play className="w-4 h-4 mr-2" /> Play Now
         </button>
      </div>
    </div>
  );
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState('Home');
  const [featured, setFeatured] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  
  const [myList, setMyList] = useLocalStorage('netphlix_myList', []);
  const [watchHistory, setWatchHistory] = useLocalStorage('netphlix_watchHistory', []);

  useEffect(() => {
    async function fetchGenres() {
      if (activeTab === 'Home' || activeTab === 'My List') return;
      const type = activeTab === 'TV Shows' ? 'tv' : 'movie';
      const res = await fetch(`${BASE_URL}/genre/${type}/list?api_key=${API_KEY}`).then(r => r.json());
      setGenres(res.genres || []);
      setSelectedGenre(''); // reset on tab switch
    }
    fetchGenres();
  }, [activeTab]);

  useEffect(() => {
    async function fetchFeatured() {
      const endpoint = activeTab === 'TV Shows' ? requests.fetchTrendingTV : requests.fetchTrendingMovies;
      const request = await fetch(endpoint).then(res => res.json());
      if (request.results?.length > 0) {
        setFeatured(request.results[Math.floor(Math.random() * request.results.length)]);
      }
    }
    if (activeTab !== 'My List') fetchFeatured();
  }, [activeTab]);

  const getGenreUrl = (baseId) => {
    const type = activeTab === 'TV Shows' ? 'tv' : 'movie';
    return `${BASE_URL}/discover/${type}?api_key=${API_KEY}&with_genres=${selectedGenre || baseId}`;
  };

  const removeFromList = (id) => {
    setMyList(prev => prev.filter(m => m.id !== id));
  };

  const removeFromHistory = (id) => {
    setWatchHistory(prev => prev.filter(m => m.id !== id));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#141414] pb-20 md:pb-0 flex flex-col"
    >
      <Navbar 
        onSearch={setSearchQuery} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        mobileSearchOpen={mobileSearchOpen}
        toggleMobileSearch={() => setMobileSearchOpen(!mobileSearchOpen)}
      />
      
      <div className="flex-1">
        {searchQuery.length > 0 || mobileSearchOpen ? (
          <SearchResults query={searchQuery} />
        ) : activeTab === 'My List' ? (
          <div className="pt-24 px-4 md:px-12 min-h-[60vh]">
            <h1 className="text-3xl md:text-4xl text-white font-bold mb-8">My List</h1>
            {myList.length > 0 ? (
               <div className="-ml-4 md:-ml-12"><Row title="" moviesArray={myList} onRemove={removeFromList} isLargeRow /></div>
            ) : (
               <p className="text-gray-400 text-lg">You haven't added anything to your list yet.</p>
            )}
          </div>
        ) : (
          <>
            <Hero movie={featured} />
            
            {/* Genre Filter */}
            {activeTab !== 'Home' && (
              <div className="absolute top-20 md:top-24 left-4 md:left-12 z-40 flex items-center space-x-4">
                <h1 className="text-white text-2xl md:text-4xl font-bold">{activeTab}</h1>
                <div className="relative group/genre">
                  <button className="bg-black/50 border border-white/50 text-white px-3 py-1 text-xs md:text-sm font-semibold flex items-center hover:bg-black/80 transition">
                    {selectedGenre ? genres.find(g => g.id.toString() === selectedGenre)?.name : 'Genres'}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </button>
                  <div className="absolute top-full left-0 mt-1 bg-black/90 border border-gray-700 rounded grid grid-cols-2 md:grid-cols-3 gap-2 p-4 min-w-[300px] md:min-w-[400px] opacity-0 invisible group-hover/genre:opacity-100 group-hover/genre:visible transition duration-200">
                    <div className="text-gray-300 hover:text-white cursor-pointer text-sm" onClick={() => setSelectedGenre('')}>All</div>
                    {genres.map(g => (
                      <div key={g.id} className="text-gray-300 hover:text-white cursor-pointer text-sm" onClick={() => setSelectedGenre(g.id.toString())}>
                        {g.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="pb-20 md:pb-32 -mt-4 md:-mt-8 relative z-20">
              {watchHistory && watchHistory.length > 0 && (
                <Row title="Continue Watching" moviesArray={watchHistory} onRemove={removeFromHistory} />
              )}
              {activeTab === 'Home' && myList.length > 0 && (
                <Row title="My List" moviesArray={myList} onRemove={removeFromList} />
              )}

              {activeTab === 'TV Shows' ? (
                <>
                  <Row title={selectedGenre ? `Popular ${genres.find(g=>g.id.toString()===selectedGenre)?.name} TV` : "Trending TV Shows"} fetchUrl={selectedGenre ? getGenreUrl() : requests.fetchTrendingTV} isLargeRow />
                  <Row title="Action & Adventure TV" fetchUrl={getGenreUrl(10759)} />
                  <Row title="Sci-Fi & Fantasy TV" fetchUrl={getGenreUrl(10765)} />
                  <Row title="Comedy TV" fetchUrl={getGenreUrl(35)} />
                </>
              ) : activeTab === 'Movies' ? (
                <>
                  <Row title={selectedGenre ? `Popular ${genres.find(g=>g.id.toString()===selectedGenre)?.name} Movies` : "Trending Movies"} fetchUrl={selectedGenre ? getGenreUrl() : requests.fetchTrendingMovies} isLargeRow />
                  <Row title="Action Movies" fetchUrl={getGenreUrl(28)} />
                  <Row title="Sci-Fi Movies" fetchUrl={getGenreUrl(878)} />
                  <Row title="Comedy Movies" fetchUrl={getGenreUrl(35)} />
                </>
              ) : (
                <>
                  <Row title="TOP 10 SHOWS TODAY" fetchUrl={requests.fetchTrendingTV} isLargeRow isTop10 />
                  <Row title="Trending Movies" fetchUrl={requests.fetchTrendingMovies} />
                  {featured && <InlineBanner movie={featured} />}
                  <Row title="Trending TV Shows" fetchUrl={requests.fetchTrendingTV} />
                  <Row title="Action Movies" fetchUrl={requests.fetchActionMovies} />
                  <Row title="Comedy TV" fetchUrl={requests.fetchComedyTV} />
                </>
              )}
            </div>
          </>
        )}
      </div>
      <Footer />
    </motion.div>
  );
}

function PersonModal({ personId, onClose }) {
  const [person, setPerson] = useState(null);
  const [credits, setCredits] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPerson() {
      const pRes = await fetch(`${BASE_URL}/person/${personId}?api_key=${API_KEY}`).then(r => r.json());
      const cRes = await fetch(`${BASE_URL}/person/${personId}/combined_credits?api_key=${API_KEY}`).then(r => r.json());
      setPerson(pRes);
      setCredits((cRes.cast || []).sort((a,b) => b.popularity - a.popularity).slice(0, 15));
    }
    fetchPerson();
  }, [personId]);

  if (!person) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[70] flex items-center justify-center p-4 md:p-12 animate-in fade-in">
       <div className="bg-[#141414] border border-gray-800 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
          <button onClick={onClose} className="absolute top-4 md:top-6 right-4 md:right-6 text-gray-400 hover:text-white z-10 bg-black/50 rounded-full p-2 transition hover:bg-black">
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex flex-col md:flex-row gap-8 p-6 md:p-10">
             {person.profile_path && <img src={`${IMAGE_BASE_URL_W500}${person.profile_path}`} className="w-48 md:w-64 rounded-lg object-cover shadow-lg mx-auto md:mx-0 flex-none" />}
             <div className="flex-1">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-4">{person.name}</h2>
                <p className="text-gray-400 text-sm md:text-base mb-8 whitespace-pre-wrap">{person.biography || 'No biography available.'}</p>
                
                <h3 className="text-xl text-white font-bold mb-4">Known For</h3>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                   {credits.filter(c => c.poster_path).map(c => (
                     <div key={c.id} className="cursor-pointer group" onClick={() => { onClose(); navigate(`/title/${c.media_type}/${c.id}`, { state: { movie: c } }); }}>
                        <img src={`${IMAGE_BASE_URL_W500}${c.poster_path}`} className="w-full aspect-[2/3] object-cover rounded group-hover:scale-105 transition" />
                        <p className="text-xs text-gray-400 mt-2 truncate group-hover:text-white transition">{c.title || c.name}</p>
                     </div>
                   ))}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

function StarRating({ rating, setRating }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex space-x-1 items-center mt-2">
      {[...Array(5)].map((_, i) => {
        const value = i + 1;
        return (
          <button
            key={i}
            className="focus:outline-none transition-transform hover:scale-110 p-1"
            onClick={() => setRating(value)}
            onMouseEnter={() => setHover(value)}
            onMouseLeave={() => setHover(0)}
            title={`Rate ${value} Stars`}
          >
            <Star 
              className={`w-6 h-6 md:w-8 md:h-8 transition-colors ${value <= (hover || rating) ? 'fill-[var(--accent-color)] text-[var(--accent-color)] drop-shadow-[0_0_8px_var(--accent-color)]' : 'text-gray-600 hover:text-gray-400'}`} 
            />
          </button>
        );
      })}
      {rating > 0 && <span className="text-gray-400 text-xs font-bold ml-2 hidden md:block">Your Rating: {rating}/5</span>}
    </div>
  );
}

function TitlePage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [details, setDetails] = useState(location.state?.movie || null);
  const [similar, setSimilar] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [bgColor, setBgColor] = useState('rgba(20,20,20,1)');
  const [selectedPerson, setSelectedPerson] = useState(null);
  
  const [myList, setMyList] = useLocalStorage('netphlix_myList', []);
  const [personalRatings, setPersonalRatings] = useLocalStorage('netphlix_ratings', {});
  const currentRating = personalRatings[id] || 0;
  const inList = myList.some(m => m.id === parseInt(id));

  const handleRating = (value) => {
    setPersonalRatings(prev => ({...prev, [id]: value}));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchDetails() {
      const url = `${BASE_URL}/${type}/${id}?api_key=${API_KEY}&append_to_response=credits,videos,images,reviews`;
      const res = await fetch(url).then(r => r.json());
      setDetails(res);
      
      const similarUrl = `${BASE_URL}/${type}/${id}/similar?api_key=${API_KEY}`;
      const simRes = await fetch(similarUrl).then(r => r.json());
      setSimilar(simRes.results?.slice(0, 12) || []);

      if (type === 'tv') {
        fetchSeasonEpisodes(1);
      }

      // Color extraction
      if (res.poster_path || res.backdrop_path) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = `${IMAGE_BASE_URL_W500}${res.poster_path || res.backdrop_path}`;
        img.onload = () => {
          fac.getColorAsync(img).then(color => setBgColor(color.rgba)).catch(e => console.log(e));
        };
      }
    }
    fetchDetails();
  }, [type, id]);

  const fetchSeasonEpisodes = async (seasonNum) => {
    setSelectedSeason(seasonNum);
    const url = `${BASE_URL}/tv/${id}/season/${seasonNum}?api_key=${API_KEY}`;
    try {
      const res = await fetch(url).then(r => r.json());
      setEpisodes(res.episodes || []);
    } catch(e) {
      setEpisodes([]);
    }
  };

  const toggleMyList = () => {
    if (inList) {
      setMyList(prev => prev.filter(m => m.id !== parseInt(id)));
    } else {
      setMyList(prev => [{
        id: parseInt(id),
        title: details.title || details.name,
        name: details.title || details.name,
        media_type: type,
        poster_path: details.poster_path,
        backdrop_path: details.backdrop_path
      }, ...prev]);
    }
  };

  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 1000], ['0%', '30%']);

  if (!details) return (
    <div className="min-h-screen bg-shows-dark text-white pt-32 px-4 md:px-12">
      <div className="container mx-auto flex flex-col lg:flex-row gap-12 animate-pulse">
        <div className="w-full md:w-[320px] aspect-[2/3] bg-white/5 rounded-2xl mx-auto lg:mx-0 flex-none border border-white/5 shadow-2xl"></div>
        <div className="flex-1 flex flex-col space-y-8 justify-center">
          <div className="h-16 bg-white/5 rounded-xl w-3/4"></div>
          <div className="flex gap-4 mb-4">
             <div className="h-12 w-32 bg-white/5 rounded-full"></div>
             <div className="h-12 w-32 bg-white/5 rounded-full"></div>
          </div>
          <div className="h-4 bg-white/5 rounded w-1/2"></div>
          <div className="h-4 bg-white/5 rounded w-1/3"></div>
          <div className="h-40 bg-white/5 rounded-xl w-full mt-8"></div>
        </div>
        <div className="w-full lg:w-[300px] flex-none border-l border-white/5 lg:pl-10">
          <div className="h-8 bg-white/5 rounded w-1/2 mb-8"></div>
          {[1,2,3,4].map(i => <div key={i} className="flex gap-4 items-center mb-6"><div className="w-14 h-14 rounded-full bg-white/5 flex-none"></div><div className="h-4 bg-white/5 rounded w-32"></div></div>)}
        </div>
      </div>
    </div>
  );

  const trailer = details.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const castList = details.credits?.cast?.slice(0, 5) || [];
  const genres = details.genres?.map(g => g.name).join(', ') || 'Unknown';
  const runtime = details.runtime ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m` : '';
  const releaseYear = details.release_date?.substring(0,4) || details.first_air_date?.substring(0,4) || 'Unknown';

  const director = details.credits?.crew?.find(c => c.job === 'Director');
  const companies = details.production_companies || [];
  const ratingColor = details.vote_average >= 8 ? 'ring-green-400' : details.vote_average >= 6 ? 'ring-yellow-400' : 'ring-red-400';
  const releaseDate = details.release_date || details.first_air_date;
  const formattedDate = releaseDate ? new Date(releaseDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown Date';
  const logo = details.images?.logos?.find(l => l.iso_639_1 === 'en')?.file_path || details.images?.logos?.[0]?.file_path;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-shows-dark text-white pb-20 md:pb-0 font-sans relative overflow-hidden"
    >
      <Navbar activeTab="" setActiveTab={() => navigate('/')} />
      
      {/* Background with Parallax */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.img style={{ y: backgroundY }} src={`${IMAGE_BASE_URL}${details.backdrop_path}`} className="w-full h-[130%] -top-[15%] relative object-cover opacity-20 blur-md" alt="bg" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/90 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent"></div>
      </div>

      <motion.div 
        initial={{ y: "100vh", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 container mx-auto px-4 md:px-12 pt-32 pb-20 flex flex-col lg:flex-row gap-12 lg:gap-20"
      >
        
        {/* Left Column: Poster */}
        <div className="w-full md:w-[320px] mx-auto lg:mx-0 flex-none">
          <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/5">
            <img src={`${IMAGE_BASE_URL_W500}${details.poster_path}`} className="w-full h-full object-cover" alt={details.title || details.name} />
            
            {details.vote_average > 0 && (
              <div className={`absolute top-4 left-4 w-12 h-12 bg-[#111] rounded-full flex items-center justify-center ring-4 ${ratingColor} shadow-xl shadow-black/60`}>
                <span className="font-bold text-sm text-white">{details.vote_average.toFixed(1)}</span>
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 bg-netflix-red text-white text-center py-3 font-bold text-xs tracking-wider uppercase">
              Most Viewed on NETPHLIX ★
            </div>
          </div>
        </div>

        {/* Center Column: Details */}
        <div className="flex-1 flex flex-col justify-center">
          {logo ? (
            <img src={`${IMAGE_BASE_URL_W500}${logo}`} alt={details.title || details.name} className="w-full max-w-[500px] object-contain mb-8 md:mb-12 drop-shadow-2xl filter contrast-125" />
          ) : (
            <h1 className="text-5xl md:text-8xl font-display font-bold text-white tracking-tight mb-8 md:mb-12 drop-shadow-2xl leading-none">
              {details.title || details.name}
            </h1>
          )}
          
          {/* Production Companies */}
          {companies.filter(c => c.logo_path).length > 0 && (
            <div className="flex flex-wrap items-center gap-8 mb-10">
              {companies.filter(c => c.logo_path).slice(0, 4).map(c => (
                <img key={c.id} src={`${IMAGE_BASE_URL_W500}${c.logo_path}`} className="h-8 md:h-12 object-contain filter brightness-0 invert opacity-70" alt={c.name} />
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-6 text-gray-300 font-medium mb-8">
            <div className="flex items-center text-sm md:text-base"><Calendar className="w-5 h-5 mr-3 text-gray-400"/> {formattedDate} (United States)</div>
            {runtime && <div className="flex items-center text-sm md:text-base"><Clock className="w-5 h-5 mr-3 text-gray-400"/> {runtime}</div>}
          </div>

          {details.genres && (
            <div className="flex flex-wrap gap-3 mb-10">
              {details.genres.map(g => (
                <span key={g.id} className="px-5 py-2 bg-[#222] rounded-full text-sm font-semibold text-gray-200 border border-white/5 hover:bg-[#333] transition-colors cursor-default">
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {director && (
            <div className="flex items-center mb-12">
              {director.profile_path ? (
                <img src={`${IMAGE_BASE_URL_W500}${director.profile_path}`} className="w-14 h-14 rounded-full mr-4 object-cover border-2 border-white/10" alt={director.name} />
              ) : (
                <div className="w-14 h-14 rounded-full mr-4 bg-[#222] flex items-center justify-center border-2 border-white/10"><User className="w-6 h-6 text-gray-500"/></div>
              )}
              <div>
                <p className="font-bold text-white text-lg">{director.name}</p>
                <p className="text-gray-400 text-sm">Director</p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 mb-10">
            <button 
              onClick={() => navigate(`/watch/${type}/${id}`)}
              className="bg-netflix-red hover:bg-red-700 text-white px-10 py-4 rounded-full font-bold flex items-center transition shadow-[0_10px_20px_rgba(229,9,20,0.3)] hover:scale-105"
            >
              <Play className="w-5 h-5 mr-3 fill-current" /> Watch
            </button>
            <button 
              className="bg-netflix-red hover:bg-red-700 text-white px-10 py-4 rounded-full font-bold flex items-center transition shadow-[0_10px_20px_rgba(229,9,20,0.3)] hover:scale-105"
            >
              <Download className="w-5 h-5 mr-3" /> Download
            </button>
          </div>

          <div className="flex items-center text-sm text-gray-400 mb-6 font-medium">
            Available on 
            <span className="font-bold text-netflix-red tracking-tight ml-2 border border-white/10 px-2 py-0.5 rounded bg-black/50">NETPHLIX</span>
          </div>

          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-2">What did you think of {details.title || details.name}?</p>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map(i => (
                <motion.div key={i} whileHover={{ scale: 1.3 }} whileTap={{ scale: 0.8 }}>
                  <Star className="w-6 h-6 text-gray-600 hover:text-yellow-500 cursor-pointer transition-colors" />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-6 text-gray-400 text-xs font-semibold mb-12 uppercase tracking-wider">
            <button className="flex flex-col items-center hover:text-white transition group">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:bg-white/10 transition">
                <Heart className="w-5 h-5" />
              </div>
              Favorite
            </button>
            <button className="flex flex-col items-center hover:text-white transition group">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:bg-white/10 transition">
                <Bookmark className="w-5 h-5" />
              </div>
              Watchlist
            </button>
            <button className="flex flex-col items-center hover:text-white transition group">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:bg-white/10 transition">
                <Share2 className="w-5 h-5" />
              </div>
              Share
            </button>
          </div>

          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-4 font-display">Overview</h3>
            <p className="text-gray-300 text-lg leading-relaxed">{details.overview}</p>
          </div>

          {trailer && (
            <div className="mb-12 relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10 group cursor-pointer" onClick={() => navigate(`/watch/${type}/${id}`)}>
              <img src={`${IMAGE_BASE_URL}${details.backdrop_path}`} className="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-20 h-20 bg-netflix-red rounded-full flex items-center justify-center shadow-lg shadow-red-500/50 group-hover:scale-110 transition-transform">
                   <Play className="w-10 h-10 text-white ml-2 fill-current" />
                 </div>
              </div>
              <div className="absolute bottom-6 left-0 right-0 text-center">
                 <h2 className="text-4xl font-black text-white font-display drop-shadow-lg tracking-tighter uppercase">{details.title || details.name}</h2>
                 <p className="text-gray-300 font-medium tracking-widest text-sm uppercase mt-1">Official Trailer</p>
              </div>
            </div>
          )}

          {details.reviews?.results?.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 font-display tracking-tight text-white">Reviews <span className="text-gray-500 text-sm">({details.reviews.results.length})</span></h3>
              <div className="flex flex-col space-y-4">
                {details.reviews.results.slice(0, 3).map(review => (
                  <div key={review.id} className="bg-[#111] p-6 rounded-2xl border border-white/5 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-netflix-red text-white flex items-center justify-center font-bold text-lg mr-3">
                          {review.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white leading-tight">{review.author}</p>
                          <p className="text-gray-500 text-xs">{new Date(review.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex text-yellow-500 space-x-1">
                        {[...Array(5)].map((_, i) => {
                           const rating = review.author_details?.rating ? review.author_details.rating / 2 : 5;
                           return <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-current' : 'text-gray-600'}`} />;
                        })}
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">{review.content}</p>
                    <button className="text-netflix-red hover:text-red-400 text-sm mt-3 font-semibold transition-colors">Read more</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {similar?.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 font-display tracking-tight text-white">Recommendation & Similar</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {similar.slice(0, 8).map(movie => (
                  <div 
                    key={movie.id} 
                    className="relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer group shadow-lg border border-white/5"
                    onClick={() => {
                      navigate(`/${movie.media_type || type}/${movie.id}`, { state: { movie } });
                      window.scrollTo(0,0);
                    }}
                  >
                    <img src={`${IMAGE_BASE_URL_W500}${movie.poster_path}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={movie.title || movie.name} />
                    {movie.vote_average > 0 && (
                      <div className="absolute top-2 left-2 w-8 h-8 bg-black/80 rounded-full flex items-center justify-center border border-white/20 shadow-lg">
                        <span className="font-bold text-[10px] text-white">{movie.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <h4 className="text-white font-bold text-sm leading-tight text-center">{movie.title || movie.name}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Cast */}
        <div className="w-full lg:w-[300px] flex-none border-l border-white/5 lg:pl-10">
          <h3 className="text-2xl font-bold mb-8 text-white font-display tracking-tight">Casts & Credits</h3>
          <div className="flex flex-col space-y-6">
            {castList.map(person => (
              <div key={person.id} className="flex items-center space-x-4 cursor-pointer group" onClick={() => setSelectedPerson(person.id)}>
                <div className="w-14 h-14 rounded-full overflow-hidden flex-none bg-[#222] border border-white/5 group-hover:border-white/30 transition-colors">
                  {person.profile_path ? (
                    <img src={`${IMAGE_BASE_URL_W500}${person.profile_path}`} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" alt={person.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><User className="w-6 h-6 text-gray-500" /></div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-gray-200 group-hover:text-white transition-colors">{person.name}</span>
                  <span className="text-xs text-gray-500">{person.character}</span>
                </div>
              </div>
            ))}
            <button className="text-netflix-red text-sm font-bold mt-2 flex items-center hover:text-white transition w-max">
              Show All <ChevronDown className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

      </motion.div>
      <Footer />
    </motion.div>
  );
}

import Hls from 'hls.js';

const CustomPlayer = ({ url, title, onBack, externalCaptions = [], hasNextEpisode, onNextEpisode }) => {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [showCenterIcon, setShowCenterIcon] = useState(null); // 'play' or 'pause'
  const [seekRipple, setSeekRipple] = useState(null); // 'left' or 'right'
  const [showControls, setShowControls] = useState(true);
  
  const [qualities, setQualities] = useState([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  const [hlsSubtitles, setHlsSubtitles] = useState([]);
  const [currentSubtitle, setCurrentSubtitle] = useState(-1);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [subtitleOffset, setSubtitleOffset] = useState(0);
  const prevOffsetRef = useRef(0);

  const [audioTracks, setAudioTracks] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(0);
  const [showAudioMenu, setShowAudioMenu] = useState(false);

  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);
  const centerIconTimeout = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const lastTapRef = useRef(0);
  const wakeLockRef = useRef(null);

  useEffect(() => {
    if (playing && 'wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then(lock => {
        wakeLockRef.current = lock;
      }).catch(err => console.log('WakeLock error:', err));
    } else if (!playing && wakeLockRef.current) {
      wakeLockRef.current.release().then(() => {
        wakeLockRef.current = null;
      });
    }
  }, [playing]);

  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => clearTimeout(controlsTimeoutRef.current);
  }, [playing]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          setPlaying(p => !p);
          setShowCenterIcon(!playing ? 'play' : 'pause');
          if (centerIconTimeout.current) clearTimeout(centerIconTimeout.current);
          centerIconTimeout.current = setTimeout(() => setShowCenterIcon(null), 800);
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          setVolume(v => v === 0 ? 1 : 0);
          break;
        case 'arrowleft':
          e.preventDefault();
          skip(-10);
          setSeekRipple('left');
          setTimeout(() => setSeekRipple(null), 500);
          break;
        case 'arrowright':
          e.preventDefault();
          skip(10);
          setSeekRipple('right');
          setTimeout(() => setSeekRipple(null), 500);
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume(v => Math.min(1, v + 0.1));
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume(v => Math.max(0, v - 0.1));
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playing]);

  // Next Episode Auto-Play logic
  useEffect(() => {
    if (duration > 0 && played * duration >= duration - 1) {
      if (hasNextEpisode && onNextEpisode) {
        onNextEpisode();
      }
    }
  }, [played, duration, hasNextEpisode, onNextEpisode]);

  useEffect(() => {
    const video = playerRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 30,
        enableWorker: true,
      });
      hlsRef.current = hls;
      
      hls.loadSource(url);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
         setIsBuffering(false);
         setQualities(hls.levels);
         if (hls.audioTracks) setAudioTracks(hls.audioTracks);
      });

      hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, () => {
         setHlsSubtitles(hls.subtitleTracks);
      });

      // Handle dynamic audio tracks if they update
      hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, () => {
         setAudioTracks(hls.audioTracks);
      });

      hls.on(Hls.Events.ERROR, (e, data) => {
         if (data.fatal) setIsBuffering(true);
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    }
  }, [url]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (playerRef.current) {
      if (playing) {
        playerRef.current.play().catch(e => console.log("Autoplay prevented:", e));
      } else {
        playerRef.current.pause();
      }
    }
  }, [playing]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.log(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (playerRef.current) {
      playerRef.current.currentTime = pos * playerRef.current.duration;
    }
  };

  const skip = (amount) => {
    if (playerRef.current) {
      playerRef.current.currentTime += amount;
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    return `${mm}:${ss}`;
  };

  const handleVideoClick = () => {
    if (showQualityMenu || showSubtitleMenu || showAudioMenu) {
      setShowQualityMenu(false);
      setShowSubtitleMenu(false);
      setShowAudioMenu(false);
      return;
    }
    const newPlaying = !playing;
    setPlaying(newPlaying);
    
    if ("vibrate" in navigator) navigator.vibrate(50);
    
    setShowCenterIcon(newPlaying ? 'play' : 'pause');
    if (centerIconTimeout.current) clearTimeout(centerIconTimeout.current);
    centerIconTimeout.current = setTimeout(() => setShowCenterIcon(null), 800);
  };

  const handleTouchEnd = (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapRef.current;
    
    if (tapLength < 300 && tapLength > 0) {
      if ("vibrate" in navigator) navigator.vibrate(50);
      const touchX = e.changedTouches[0].clientX;
      if (touchX < window.innerWidth / 2) {
        skip(-10);
        setSeekRipple('left');
      } else {
        skip(10);
        setSeekRipple('right');
      }
      setTimeout(() => setSeekRipple(null), 500);
      e.preventDefault(); // Prevent default click
    }
    lastTapRef.current = currentTime;
  };

  const handleQualityChange = (levelIndex) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
      setShowQualityMenu(false);
    }
  };

  const handleSubtitleChange = (trackId) => {
    setCurrentSubtitle(trackId);
    setShowSubtitleMenu(false);
    // If it's an HLS track (number), tell HLS
    if (typeof trackId === 'number' && hlsRef.current) {
      hlsRef.current.subtitleTrack = trackId;
    } else if (hlsRef.current) {
      hlsRef.current.subtitleTrack = -1; // disable HLS subtitle if external or off
    }
  };

  const handleSubtitleSync = (delta) => {
     const newOffset = subtitleOffset + delta;
     const actualDelta = newOffset - prevOffsetRef.current;
     
     const video = playerRef.current;
     if (video && video.textTracks) {
        for (let i = 0; i < video.textTracks.length; i++) {
           const track = video.textTracks[i];
           if (track.mode === 'showing' && track.cues) {
              for (let j = 0; j < track.cues.length; j++) {
                 track.cues[j].startTime += actualDelta;
                 track.cues[j].endTime += actualDelta;
              }
           }
        }
     }
     prevOffsetRef.current = newOffset;
     setSubtitleOffset(newOffset);
  };

  const handleAudioChange = (trackId) => {
    if (hlsRef.current) {
      hlsRef.current.audioTrack = trackId;
      setCurrentAudio(trackId);
      setShowAudioMenu(false);
    }
  };

  // Combine external captions and HLS subtitles
  const allSubtitles = [
     ...hlsSubtitles.map(t => ({ id: t.id, name: t.name || `Track ${t.id}` })),
     ...externalCaptions.map((cap, i) => ({ id: `ext-${i}`, name: cap.language || `Ext ${i}`, url: cap.url }))
  ];

  const activeExternalTrack = externalCaptions.find((_, i) => `ext-${i}` === currentSubtitle);

  // Force the native text track to display when an external track is selected
  useEffect(() => {
    const video = playerRef.current;
    if (video && video.textTracks) {
      // Small timeout to allow React to render the <track> element first
      setTimeout(() => {
        for (let i = 0; i < video.textTracks.length; i++) {
          if (video.textTracks[i].kind === 'subtitles' || video.textTracks[i].kind === 'captions') {
            video.textTracks[i].mode = activeExternalTrack ? 'showing' : 'hidden';
          }
        }
      }, 50);
    }
  }, [activeExternalTrack, currentSubtitle]);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full aspect-video bg-black rounded-none md:rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] border-0 md:border border-gray-800 font-sans select-none ${showControls ? '' : 'cursor-none'}`}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => playing && setShowControls(false)}
      onTouchStart={resetControlsTimeout}
    >
      <video
        ref={playerRef}
        playsInline
        className="w-full h-full object-contain cursor-pointer"
        onTimeUpdate={(e) => setPlayed(e.target.currentTime / e.target.duration || 0)}
        onDurationChange={(e) => setDuration(e.target.duration)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onClick={handleVideoClick}
        onTouchEnd={handleTouchEnd}
        crossOrigin="anonymous"
      >
        {activeExternalTrack && (
           <track 
              key={activeExternalTrack.url}
              kind="subtitles" 
              src={activeExternalTrack.url} 
              srcLang="en" 
              label={activeExternalTrack.language} 
              default 
              onLoad={(e) => {
                 const track = e.target.track;
                 if (track && track.cues && subtitleOffset !== 0) {
                    for (let i = 0; i < track.cues.length; i++) {
                       track.cues[i].startTime += subtitleOffset;
                       track.cues[i].endTime += subtitleOffset;
                    }
                 }
                 prevOffsetRef.current = subtitleOffset;
              }}
           />
        )}
      </video>
      
      {/* Buffering Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Center Action Icon Animation */}
      {showCenterIcon && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="w-20 h-20 md:w-28 md:h-28 bg-black/60 rounded-full flex items-center justify-center animate-ping-short">
            {showCenterIcon === 'play' ? (
              <Play className="w-10 h-10 md:w-12 md:h-12 text-white ml-2" />
            ) : showCenterIcon === 'pause' ? (
              <Pause className="w-10 h-10 md:w-12 md:h-12 text-white" />
            ) : showCenterIcon === 'rewind' ? (
              <RotateCcw className="w-10 h-10 md:w-12 md:h-12 text-white" />
            ) : (
              <RotateCw className="w-10 h-10 md:w-12 md:h-12 text-white" />
            )}
          </div>
        </div>
      )}

      {/* Visual Seek Ripples (Mobile) */}
      {seekRipple && (
        <div className={`absolute top-0 bottom-0 w-1/2 flex items-center justify-center pointer-events-none overflow-hidden z-20 ${seekRipple === 'left' ? 'left-0' : 'right-0'}`}>
          <div 
            className="w-full h-full bg-white/10 flex flex-col items-center justify-center animate-ping-short"
            style={{ 
               borderTopRightRadius: seekRipple === 'left' ? '100%' : '0',
               borderBottomRightRadius: seekRipple === 'left' ? '100%' : '0',
               borderTopLeftRadius: seekRipple === 'right' ? '100%' : '0',
               borderBottomLeftRadius: seekRipple === 'right' ? '100%' : '0'
            }}
          >
             {seekRipple === 'left' ? <RotateCcw className="w-8 h-8 text-white mb-2" /> : <RotateCw className="w-8 h-8 text-white mb-2" />}
             <span className="text-white font-bold">{seekRipple === 'left' ? '-10s' : '+10s'}</span>
          </div>
        </div>
      )}

      {/* Auto-Play Next Episode Overlay */}
      {hasNextEpisode && duration > 0 && played * duration >= duration - 15 && (
        <div className="absolute bottom-24 right-8 z-40 pointer-events-auto transition-opacity duration-500 opacity-100">
          <button onClick={onNextEpisode} className="flex items-center space-x-4 bg-black/80 hover:bg-black border border-gray-600 rounded-md px-6 py-4 shadow-2xl transition-transform hover:scale-105 group">
             <div className="flex flex-col text-left">
                <span className="text-white font-bold text-lg">Up Next</span>
                <span className="text-gray-300 text-sm">Starting in {Math.floor(duration - played*duration)}s</span>
             </div>
             <Play className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )}

      {/* Top Gradient Overlay */}
      <div className={`absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-black/90 via-black/40 to-transparent transition-opacity duration-500 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`}></div>

      {/* Top Left: Back Button & Title */}
      <div className={`absolute top-4 left-4 md:top-6 md:left-6 z-20 transition-opacity duration-500 pointer-events-auto flex items-center space-x-2 md:space-x-4 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {onBack && (
          <button onClick={onBack} className="text-white hover:text-white/80 transition-colors bg-black/40 hover:bg-black/60 rounded-full p-1.5 md:p-2 backdrop-blur-md">
            <ArrowLeft className="w-5 h-5 md:w-8 md:h-8" />
          </button>
        )}
        <h1 className="text-lg md:text-3xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] tracking-wide line-clamp-1">{title}</h1>
      </div>

      {/* Controls Overlay */}
      <div className={`absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/60 to-transparent px-2 md:px-8 py-3 md:py-8 transition-opacity duration-500 flex flex-col justify-end z-20 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
         
         {/* Progress Bar */}
         <div className="w-full h-8 cursor-pointer relative flex items-center group/scrub mb-2" onClick={handleSeek}>
            <div className="w-full h-1 bg-white/20 relative group-hover/scrub:h-1.5 transition-all duration-300">
               {/* Buffered Bar */}
               <div className="absolute top-0 left-0 h-full bg-white/30 pointer-events-none" style={{ width: `${(played + 0.05) * 100}%`, maxWidth: '100%' }}></div>
               {/* Netflix-style Red Progress Bar */}
               <div className="absolute top-0 left-0 h-full bg-[#E50914] pointer-events-none shadow-[0_0_10px_#E50914]" style={{ width: `${played * 100}%` }}></div>
            </div>
            {/* Thumb */}
            <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full scale-0 group-hover/scrub:scale-100 transition-transform shadow-md pointer-events-none z-10" style={{ left: `calc(${played * 100}% - 8px)` }}></div>
         </div>

         {/* Controls */}
         <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 md:space-x-6">
               <button onClick={() => setPlaying(!playing)} className="text-white hover:text-gray-300 transition-colors drop-shadow-md">
                  {playing ? <Pause className="w-8 h-8 md:w-10 md:h-10" /> : <Play className="w-8 h-8 md:w-10 md:h-10" />}
               </button>

               <button onClick={() => skip(-10)} className="text-white hover:text-gray-300 transition-colors hidden sm:block drop-shadow-md" title="Rewind 10s">
                  <RotateCcw className="w-7 h-7 md:w-8 md:h-8" />
               </button>

               <button onClick={() => skip(10)} className="text-white hover:text-gray-300 transition-colors hidden sm:block drop-shadow-md" title="Forward 10s">
                  <RotateCw className="w-7 h-7 md:w-8 md:h-8" />
               </button>
               
               {/* Volume */}
               <div className="hidden sm:flex items-center space-x-2 group/vol relative">
                  <button onClick={() => setVolume(volume === 0 ? 1 : 0)} className="text-white hover:text-gray-300 transition-colors drop-shadow-md">
                     {volume === 0 ? <VolumeX className="w-7 h-7 md:w-8 md:h-8" /> : <Volume2 className="w-7 h-7 md:w-8 md:h-8" />}
                  </button>
                  <div className="w-0 group-hover/vol:w-24 overflow-hidden opacity-0 group-hover/vol:opacity-100 transition-all duration-300 flex items-center">
                    <input 
                       type="range" min={0} max={1} step={0.05} value={volume} 
                       onChange={(e) => setVolume(parseFloat(e.target.value))}
                       className="w-full accent-[#E50914] cursor-pointer h-1 bg-white/30 rounded-full appearance-none"
                    />
                  </div>
               </div>

               {/* Time Display */}
               <div className="text-white text-xs md:text-sm font-medium tracking-wide drop-shadow-md tabular-nums pl-2">
                  {formatTime(played * duration)} <span className="text-white/60 mx-1">/</span> {formatTime(duration)}
               </div>
            </div>

            <div className="flex items-center space-x-4 md:space-x-6 relative">
               
               {/* Subtitles Menu */}
               {allSubtitles.length > 0 && (
                 <div className="relative group/subs">
                   <button onClick={() => {setShowSubtitleMenu(!showSubtitleMenu); setShowQualityMenu(false); setShowAudioMenu(false);}} className={`text-white hover:text-gray-300 transition-colors drop-shadow-md ${showSubtitleMenu ? 'text-[#E50914]' : ''}`} title="Subtitles">
                      <Subtitles className="w-7 h-7 md:w-8 md:h-8" />
                   </button>
                   {showSubtitleMenu && (
                     <div className="absolute bottom-full right-0 mb-4 w-48 bg-black/95 border border-gray-800 rounded-lg overflow-hidden backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] z-50 transition-all origin-bottom">
                       <div className="py-2 max-h-60 overflow-y-auto scrollbar-hide">
                         <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 bg-black/95">Subtitles</div>
                         <button 
                           onClick={() => handleSubtitleChange(-1)} 
                           className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${currentSubtitle === -1 ? 'text-white bg-white/10 font-bold' : 'text-gray-300 hover:bg-white/5'}`}
                         >
                           Off
                           {currentSubtitle === -1 && <Check className="w-4 h-4" />}
                         </button>
                         {allSubtitles.map(track => (
                           <button 
                             key={track.id} 
                             onClick={() => handleSubtitleChange(track.id)} 
                             className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${currentSubtitle === track.id ? 'text-white bg-white/10 font-bold' : 'text-gray-300 hover:bg-white/5'}`}
                           >
                             {track.name}
                             {currentSubtitle === track.id && <Check className="w-4 h-4" />}
                           </button>
                         ))}
                       </div>
                       
                       {/* Subtitle Sync Tool */}
                       {currentSubtitle !== -1 && (
                         <div className="border-t border-gray-800 p-3 bg-black/50">
                            <div className="text-xs text-gray-400 mb-2 flex justify-between">
                               <span>Sync Delay</span>
                               <span className="text-white font-mono">{subtitleOffset > 0 ? '+' : ''}{(subtitleOffset).toFixed(1)}s</span>
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                               <button onClick={() => handleSubtitleSync(-0.5)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-xs font-mono">-0.5s</button>
                               <button onClick={() => handleSubtitleSync(0.5)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-xs font-mono">+0.5s</button>
                            </div>
                         </div>
                       )}
                     </div>
                   )}
                 </div>
               )}

               {/* Audio Menu */}
               {audioTracks.length > 1 && (
                  <div className="relative group/audio">
                    <button onClick={() => {setShowAudioMenu(!showAudioMenu); setShowQualityMenu(false); setShowSubtitleMenu(false);}} className={`text-white hover:text-gray-300 transition-colors drop-shadow-md ${showAudioMenu ? 'text-[#E50914]' : ''}`} title="Audio Tracks">
                      <Headphones className="w-7 h-7 md:w-8 md:h-8" />
                    </button>
                    {showAudioMenu && (
                      <div className="absolute bottom-full right-0 mb-4 w-48 bg-black/95 border border-gray-800 rounded-lg overflow-hidden backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] z-50">
                        <div className="py-2 max-h-60 overflow-y-auto scrollbar-hide">
                          <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 bg-black/95">Audio</div>
                          {audioTracks.map((track, i) => (
                            <button 
                              key={i} 
                              onClick={() => handleAudioChange(i)} 
                              className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${currentAudio === i ? 'text-white bg-white/10 font-bold' : 'text-gray-300 hover:bg-white/5'}`}
                            >
                              {track.name || `Audio ${i + 1}`}
                              {currentAudio === i && <Check className="w-4 h-4" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
               )}

               {/* Quality Settings */}
               {qualities.length > 0 && (
                 <div className="relative group/quality">
                   <button onClick={() => {setShowQualityMenu(!showQualityMenu); setShowSubtitleMenu(false); setShowAudioMenu(false);}} className={`text-white hover:text-gray-300 transition-colors drop-shadow-md ${showQualityMenu ? 'text-[#E50914]' : ''}`} title="Quality">
                     <Settings className={`w-7 h-7 md:w-8 md:h-8 transition-transform ${showQualityMenu ? 'rotate-90' : ''}`} />
                   </button>
                   {showQualityMenu && (
                     <div className="absolute bottom-full right-0 mb-4 w-40 bg-black/95 border border-gray-800 rounded-lg overflow-hidden backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] z-50">
                       <div className="py-2 max-h-60 overflow-y-auto scrollbar-hide">
                         <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 bg-black/95">Quality</div>
                         <button 
                           onClick={() => handleQualityChange(-1)} 
                           className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${currentQuality === -1 ? 'text-white bg-white/10 font-bold' : 'text-gray-300 hover:bg-white/5'}`}
                         >
                           Auto
                           {currentQuality === -1 && <Check className="w-4 h-4" />}
                         </button>
                         {[...qualities].reverse().map((q, idx) => {
                           const originalIndex = qualities.length - 1 - idx;
                           return (
                             <button 
                               key={originalIndex} 
                               onClick={() => handleQualityChange(originalIndex)} 
                               className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${currentQuality === originalIndex ? 'text-white bg-white/10 font-bold' : 'text-gray-300 hover:bg-white/5'}`}
                             >
                               {q.height}p
                               {currentQuality === originalIndex && <Check className="w-4 h-4" />}
                             </button>
                           );
                         })}
                       </div>
                     </div>
                   )}
                 </div>
               )}

               <button onClick={toggleFullscreen} className="text-white hover:text-gray-300 transition-colors drop-shadow-md" title="Fullscreen">
                  <Maximize className="w-7 h-7 md:w-8 md:h-8" />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

function WatchPage() {
  const { type, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const season = queryParams.get('s') || 1;
  const episode = queryParams.get('e') || 1;

  const SERVERS = ['VidAPI', 'RGShows', 'SmashyStream', 'VidLink', 'VidSrcRU', 'VSrcSU', 'SuperEmbed', '2Embed'];
  const [server, setServer] = useLocalStorage('netphlix_server', SERVERS[0]);
  const [useAdfree, setUseAdfree] = useLocalStorage('netphlix_useAdfree', true);

  const [watchHistory, setWatchHistory] = useLocalStorage('netphlix_watchHistory', []);
  
  const [details, setDetails] = useState(null);
  const [episodesList, setEpisodesList] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [nativeStreamUrl, setNativeStreamUrl] = useState(null);
  const [nativeCaptions, setNativeCaptions] = useState([]);
  const [streamLoading, setStreamLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id, season, episode]);

  // Fetch Stream from Backend
  useEffect(() => {
    const fetchStream = async () => {
      try {
        setStreamLoading(true);
        // Ensure you push your backend updates to GitHub so this Vercel API has the captions fix!
        const res = await fetch(`https://movie-scraper-brown.vercel.app/api/stream?tmdbId=${id}&type=${type}${type === 'tv' ? `&season=${season}&episode=${episode}` : ''}`);
        const data = await res.json();
         if (data.streamUrl) {
            setNativeStreamUrl(data.streamUrl);
            setNativeCaptions(data.captions || []);
         } else {
            console.error("Local API returned no stream URL:", data);
         }
      } catch(err) {
         console.error("Error fetching stream:", err);
      } finally {
         setStreamLoading(false);
      }
    };
    
    if (useAdfree) {
       fetchStream();
    }
  }, [type, id, season, episode, useAdfree]);

  // Fetch Details & Save to watch history
  useEffect(() => {
    const fetchTitleAndSave = async () => {
      try {
        const tmdbUrl = type === 'tv' 
          ? `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&append_to_response=credits,similar`
          : `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&append_to_response=credits,similar`;
        
        const tmdbRes = await fetch(tmdbUrl);
        const tmdbData = await tmdbRes.json();
        setDetails(tmdbData);
        const title = tmdbData.name || tmdbData.title;

        if (title) {
          setWatchHistory(prev => {
            const filtered = prev.filter(m => m.id !== parseInt(id));
            return [{
              id: parseInt(id),
              title: title,
              name: title,
              media_type: type,
              poster_path: tmdbData.poster_path,
              backdrop_path: tmdbData.backdrop_path,
              last_watched: new Date().toISOString()
            }, ...filtered];
          });
        }
      } catch (err) {
        console.error("Failed to fetch details", err);
      }
    };

    fetchTitleAndSave();
  }, [id, type]);

  useEffect(() => {
    if (type === 'tv') {
      const fetchEpisodes = async () => {
        const epsRes = await fetch(`${BASE_URL}/tv/${id}/season/${season}?api_key=${API_KEY}`).then(r => r.json());
        setEpisodesList(epsRes.episodes || []);
      };
      fetchEpisodes();
    }
  }, [id, type, season]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      const key = e.key.toLowerCase();
      
      if (key === 'f') {
        const player = document.getElementById('video-player-container');
        if (player) {
          if (!document.fullscreenElement) player.requestFullscreen().catch(err => console.log(err));
          else document.exitFullscreen();
        }
      }
      
      if (key === 's') {
        setServer(prev => {
          const currentIndex = SERVERS.indexOf(prev);
          // Only cycle through known array, default to first if not found
          if (currentIndex === -1) return SERVERS[0];
          return SERVERS[(currentIndex + 1) % SERVERS.length];
        });
      }
      
      if (key === 'n' && type === 'tv') {
        const currentEpNum = parseInt(episode);
        const nextEp = episodesList.find(ep => ep.episode_number === currentEpNum + 1);
        if (nextEp) {
          navigate(`/watch/tv/${id}?s=${season}&e=${currentEpNum + 1}`);
        } else if (details?.seasons) {
           // Try next season
           const currentSeasonNum = parseInt(season);
           const nextSeason = details.seasons.find(s => s.season_number === currentSeasonNum + 1);
           if (nextSeason) {
             navigate(`/watch/tv/${id}?s=${currentSeasonNum + 1}&e=1`);
           }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [type, id, season, episode, episodesList, details, navigate]);

  const handleBack = () => {
    navigate('/');
  };

  const getIframeSrc = () => {
    if (type === 'tv') {
      switch(server) {
        case 'VidAPI': return `https://vaplayer.ru/embed/tv/${id}/${season}/${episode}?autoplay=1`;
        case 'VidLink': return `https://vidlink.pro/tv/${id}/${season}/${episode}`;
        case 'RGShows': return `https://rgshows.me/player/tv/api1/index.html?id=${id}&s=${season}&e=${episode}`;
        case 'SmashyStream': return `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${season}&ep=${episode}`;
        case 'VidSrcRU': return `https://vidsrcme.ru/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`;
        case 'VSrcSU': return `https://vsrc.su/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`;
        case 'SuperEmbed': return `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
        case '2Embed': return `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`;
        default: return `https://vaplayer.ru/embed/tv/${id}/${season}/${episode}?autoplay=1`;
      }
    } else {
      switch(server) {
        case 'VidAPI': return `https://vaplayer.ru/embed/movie/${id}?autoplay=1`;
        case 'VidLink': return `https://vidlink.pro/movie/${id}`;
        case 'RGShows': return `https://rgshows.me/player/movies/api1/index.html?id=${id}`;
        case 'SmashyStream': return `https://embed.smashystream.com/playere.php?tmdb=${id}`;
        case 'VidSrcRU': return `https://vidsrcme.ru/embed/movie?tmdb=${id}`;
        case 'VSrcSU': return `https://vsrc.su/embed/movie?tmdb=${id}`;
        case 'SuperEmbed': return `https://multiembed.mov/?video_id=${id}&tmdb=1`;
        case '2Embed': return `https://www.2embed.cc/embed/${id}`;
        default: return `https://vaplayer.ru/embed/movie/${id}?autoplay=1`;
      }
    }
  };

  if (!details) {
    return <div className="w-screen h-screen bg-[#141414] flex items-center justify-center"><div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const currentEpData = type === 'tv' ? episodesList.find(e => e.episode_number === parseInt(episode)) : null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#141414] text-white pb-20 md:pb-0"
    >
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Full-width Player Section */}
      <div className="pt-16 md:pt-24 w-full bg-black relative">
        <div className="max-w-[1800px] mx-auto relative group">
          <div id="video-player-container" className="relative w-full aspect-video bg-black md:rounded-xl overflow-hidden md:shadow-[0_0_60px_rgba(0,0,0,0.8)] md:border border-gray-800 transition-all duration-500">
          
            {useAdfree && streamLoading ? (
               <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a]">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--accent-color)] shadow-[0_0_20px_rgba(229,9,20,0.5)]"></div>
                  <p className="mt-4 text-gray-400 font-bold tracking-widest uppercase text-sm animate-pulse">Loading Stream...</p>
               </div>
            ) : useAdfree && nativeStreamUrl ? (
               <CustomPlayer 
                  url={nativeStreamUrl} 
                  title={`${details?.title || details?.name || 'Video'} ${type === 'tv' ? `(S${season} E${episode})` : ''}`}
                  onBack={() => navigate(-1)}
                  externalCaptions={nativeCaptions}
               />
            ) : useAdfree ? (
               <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a]">
                  <p className="text-gray-400 font-medium">Stream not available right now. Try switching servers.</p>
               </div>
            ) : (
              <iframe
                key={`${server}-${season}-${episode}`}
                src={getIframeSrc()}
                className="w-full h-full border-none"
                frameBorder="0"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
              ></iframe>
            )}
          </div>
        </div>
      </div>

      {/* Control Bar (Below Player) */}
      <div className="max-w-[1800px] mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5">
         <div className="flex-1">
            <h1 className="text-2xl md:text-4xl font-black text-white drop-shadow-md">
              {details.title || details.name}
            </h1>
            {type === 'tv' && currentEpData && (
              <p className="text-[var(--accent-color)] font-bold text-sm md:text-base mt-1">
                 Season {season} Episode {episode} <span className="text-gray-500 mx-2">•</span> <span className="text-gray-300">{currentEpData.name}</span>
              </p>
            )}
         </div>
         
         <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {type === 'tv' && episodesList.length > 0 && (
              <button 
                onClick={() => {
                   const currentEpNum = parseInt(episode);
                   const nextEp = episodesList.find(ep => ep.episode_number === currentEpNum + 1);
                   if (nextEp) {
                     navigate(`/watch/tv/${id}?s=${season}&e=${currentEpNum + 1}`);
                   } else if (details?.seasons) {
                      const currentSeasonNum = parseInt(season);
                      const nextSeason = details.seasons.find(s => s.season_number === currentSeasonNum + 1);
                      if (nextSeason) {
                        navigate(`/watch/tv/${id}?s=${currentSeasonNum + 1}&e=1`);
                      }
                   }
                }}
                className="bg-white text-black px-4 md:px-6 py-2 md:py-2.5 rounded-lg flex items-center space-x-2 transition-all hover:bg-gray-200 font-bold shadow-lg flex-1 md:flex-none justify-center"
              >
                <span>Next Episode</span>
                <Play className="w-4 h-4 fill-black" />
              </button>
            )}
            
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <button 
                onClick={() => setUseAdfree(!useAdfree)}
                className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 md:py-2.5 rounded-lg border transition-all shadow-lg text-sm font-bold ${
                  useAdfree 
                  ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]' 
                  : 'bg-black/70 border-gray-600 text-gray-300 hover:text-white hover:border-gray-400'
                }`}
              >
                <Star className={`w-4 h-4 ${useAdfree ? 'fill-white' : ''}`} />
                <span>{useAdfree ? 'Adfree ON' : 'Adfree Player'}</span>
              </button>

              {!useAdfree && (
                <div className="flex items-center bg-[#1a1a1a] px-3 py-2 md:py-2.5 rounded-lg border border-gray-700 hover:border-gray-500 transition shadow-lg w-full md:w-auto">
                  <span className="text-gray-400 text-xs font-semibold mr-2 hidden sm:block">SERVER:</span>
                  <select 
                    value={server} 
                    onChange={(e) => setServer(e.target.value)}
                    className="bg-transparent text-white font-bold outline-none text-sm cursor-pointer w-full"
                  >
                    {SERVERS.map(s => (
                      <option key={s} value={s} className="bg-gray-900 text-white">{s}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
         </div>
      </div>

      {/* Details Section */}
      <div className="relative">
         {/* Backdrop Image */}
         {details.backdrop_path && (
            <div className="absolute inset-0 opacity-10 pointer-events-none">
               <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-transparent z-10" />
               <img src={`${IMAGE_BASE_URL}${details.backdrop_path}`} className="w-full h-full object-cover" />
            </div>
         )}
         
         <div className="relative z-20 max-w-[1800px] mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8 lg:gap-12">
            <div className="flex-1">
               <div className="flex flex-wrap items-center gap-3 mb-6 font-semibold text-xs md:text-sm bg-white/5 inline-flex px-4 py-2 rounded-full border border-white/10">
                  <span className="text-green-500 font-black">98% Match</span>
                  <span className="text-gray-300">{details.release_date?.substring(0,4) || details.first_air_date?.substring(0,4)}</span>
                  <span className="border border-gray-500 px-1.5 py-0.5 text-[10px] md:text-xs text-gray-300 rounded">HD</span>
                  {type === 'tv' && <span className="text-gray-300">{details.number_of_seasons} Seasons</span>}
               </div>

               <p className="text-base md:text-lg text-gray-300 leading-relaxed mb-8 max-w-3xl">
                 {details.overview}
               </p>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400 bg-black/40 p-6 rounded-xl border border-white/5 backdrop-blur-sm max-w-3xl">
                  <div>
                     <p className="mb-2"><strong className="text-white block mb-1">Genres</strong> {details.genres?.map(g => g.name).join(', ')}</p>
                  </div>
                  <div>
                     <p><strong className="text-white block mb-1">Cast</strong> {details.credits?.cast?.slice(0, 6).map(c => c.name).join(', ')}</p>
                  </div>
               </div>
            </div>

            {/* Episodes Sidebar (if TV) */}
            {type === 'tv' && (
              <div className="lg:w-[450px] flex-none">
                 <div className="sticky top-2">
                 <div className="flex items-center justify-between mb-4 bg-black/60 p-4 rounded-xl backdrop-blur-md border border-white/5">
                    <h3 className="text-xl font-bold">Episodes</h3>
                    <select 
                       className="bg-[#242424] text-white border border-gray-700 rounded px-3 py-1.5 font-semibold outline-none text-sm hover:border-gray-500 transition cursor-pointer"
                       value={season}
                       onChange={(e) => navigate(`/watch/tv/${id}?s=${e.target.value}&e=1`)}
                    >
                       {details.seasons?.filter(s => s.season_number > 0).map(s => (
                          <option key={s.id} value={s.season_number}>Season {s.season_number}</option>
                       ))}
                    </select>
                 </div>

                 <div className="bg-[#111] rounded-xl border border-gray-800 overflow-hidden max-h-[70vh] overflow-y-auto scrollbar-hide shadow-2xl">
                    {episodesList.map(ep => (
                       <div 
                         key={ep.id}
                         onClick={() => navigate(`/watch/tv/${id}?s=${season}&e=${ep.episode_number}`)}
                         className={`flex items-start gap-4 p-4 cursor-pointer transition border-b border-gray-800/50 last:border-0 group ${parseInt(episode) === ep.episode_number ? 'bg-white/10' : 'hover:bg-white/5'}`}
                       >
                          <div className="w-28 md:w-36 aspect-video bg-gray-900 rounded-md overflow-hidden flex-none relative shadow-lg">
                             <img src={`${IMAGE_BASE_URL_W500}${ep.still_path}`} className={`w-full h-full object-cover transition duration-500 ${parseInt(episode) !== ep.episode_number && 'group-hover:scale-105 opacity-80 group-hover:opacity-100'}`} />
                             <div className="absolute inset-0 flex items-center justify-center">
                                {parseInt(episode) === ep.episode_number ? (
                                  <div className="w-8 h-8 rounded-full bg-[var(--accent-color)] flex items-center justify-center shadow-[0_0_15px_rgba(229,9,20,0.8)]">
                                     <div className="w-3 h-3 bg-white mx-0.5 rounded-sm animate-pulse"></div>
                                  </div>
                                ) : (
                                  <Play className="w-8 h-8 text-white fill-white shadow-lg drop-shadow-xl opacity-0 group-hover:opacity-100 transition duration-300 scale-75 group-hover:scale-100" />
                                )}
                             </div>
                             <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                E{ep.episode_number}
                             </div>
                          </div>
                          <div className="flex-1 pr-2">
                             <h4 className={`font-bold text-sm mb-1 line-clamp-2 ${parseInt(episode) === ep.episode_number ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>{ep.name}</h4>
                             <p className="text-[11px] text-gray-500 line-clamp-2 leading-snug">{ep.overview}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
         )}
      </div>
      </div>
      <Footer />
    </motion.div>
  );
}

export default function App() {
  const [showLoader, setShowLoader] = useState(true);
  const [fadeLoader, setFadeLoader] = useState(false);
  const [introStarted, setIntroStarted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!introStarted) return;
    
    // Play audio when user clicks the start button
    const audio = new Audio('/netflix-tudum.mp3');
    audio.play().catch(err => console.log('Audio autoplay prevented:', err));

    // The animation takes about 4.5 seconds to complete based on CSS.
    const fadeTimer = setTimeout(() => setFadeLoader(true), 3800);
    const removeTimer = setTimeout(() => setShowLoader(false), 4500);
    
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, [introStarted]);

  return (
    <>
      {showLoader && !introStarted && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center">
          <button 
             onClick={() => setIntroStarted(true)}
             className="px-8 py-3 md:px-12 md:py-4 bg-[#E50914] text-white font-bold text-lg md:text-2xl rounded hover:bg-red-700 transition transform hover:scale-110 shadow-[0_0_25px_rgba(229,9,20,0.5)] animate-pulse"
          >
             Enter Netphlix
          </button>
          <p className="text-gray-500 mt-4 text-xs md:text-sm">Click to start cinematic experience</p>
        </div>
      )}
      
      {showLoader && introStarted && (
        <div className={`fixed inset-0 z-[9999] bg-black transition-opacity duration-700 ${fadeLoader ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <NetflixIntro />
        </div>
      )}
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/title/:type/:id" element={<TitlePage />} />
          <Route path="/watch/:type/:id" element={<WatchPage />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}
