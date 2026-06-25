import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Routes, Route, useNavigate, useParams, Link, useLocation, Navigate } from 'react-router-dom';
import { Search, Bell, User, Info, X, ChevronLeft, ChevronRight, ChevronDown, Plus, ThumbsUp, Home as HomeIcon, Star, Film, Tv, Radio, Gamepad2, Calendar, Clock, Download, Heart, Bookmark, Share2, Lock } from 'lucide-react';
import { FaPlay as Play, FaPause as Pause, FaExpand as Maximize, FaVolumeHigh as Volume2, FaVolumeXmark as VolumeX, FaClosedCaptioning as Subtitles, FaGear as Settings, FaRotateRight as RotateCw, FaRotateLeft as RotateCcw, FaArrowLeft as ArrowLeft, FaHeadphones as Headphones, FaCheck as Check } from 'react-icons/fa6';
import { FastAverageColor } from 'fast-average-color';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useLocalStorage } from './hooks/useLocalStorage';
import Footer from './components/Footer';
import NetflixIntro from './components/NetflixIntro';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { auth } from './firebase';

import { API_KEY, BASE_URL, IMAGE_BASE_URL, IMAGE_BASE_URL_W500, requests } from './utils/constants';
import OfflineToast from './components/OfflineToast';
import { getMediaType } from './utils/media';
import HoverPortal from './components/HoverPortal';
import MagneticButton from './components/MagneticButton';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Row from './components/Row';
import { RowCard } from './components/RowCard';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import WatchlistPage from './pages/WatchlistPage';

function SearchResults({ query }) {
  const [movies, setMovies] = useState([]);
  const [filterYear, setFilterYear] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length < 2) return;
    
    setMovies([]);
    setPage(1);
    setHasMore(true);

    async function searchMovies() {
      setIsLoading(true);
      const url = `${requests.fetchSearch}${encodeURIComponent(query)}&page=1`;
      const req = await fetch(url).then(res => res.json());
      setMovies((req.results || []).filter(m => m.media_type !== 'person'));
      if (req.page >= req.total_pages || !req.results || req.results.length === 0) setHasMore(false);
      setIsLoading(false);
    }
    const delayDebounceFn = setTimeout(() => {
      searchMovies();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  useEffect(() => {
    if (query.length < 2 || page === 1 || !hasMore) return;
    
    async function fetchMore() {
      setIsLoading(true);
      const url = `${requests.fetchSearch}${encodeURIComponent(query)}&page=${page}`;
      const req = await fetch(url).then(res => res.json());
      setMovies(prev => {
        const newMovies = (req.results || []).filter(m => m.media_type !== 'person');
        const map = new Map(prev.map(m => [m.id, m]));
        newMovies.forEach(m => map.set(m.id, m));
        return Array.from(map.values());
      });
      if (req.page >= req.total_pages || !req.results || req.results.length === 0) setHasMore(false);
      setIsLoading(false);
    }
    fetchMore();
  }, [page, query]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000 && hasMore && !isLoading) {
        setPage(prev => prev + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading]);

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
    <div className="px-4 md:px-8 pt-24 md:pt-28 pb-24 min-h-screen bg-[#0a0a0c] flex flex-col md:flex-row gap-8">
      
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
              whileHover={{ scale: 1.1, zIndex: 50, transition: { type: "spring", stiffness: 300, damping: 20 } }}
              className="relative cursor-pointer rounded-lg overflow-hidden shadow-sm aspect-[2/3] group"
              onClick={() => navigate(`/title/${getMediaType(movie)}/${movie.id}`, { state: { movie } })}
            >
              <img
                src={`${IMAGE_BASE_URL_W500}${movie.poster_path || movie.backdrop_path}`}
                alt={movie.title || movie.name}
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <Play className="w-10 h-10 text-white drop-shadow-lg self-center mb-auto mt-auto transform scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300" />
                <h3 className="text-white font-bold text-sm line-clamp-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{movie.title || movie.name}</h3>
                <div className="flex items-center text-xs text-gray-300 space-x-2 mt-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                  <span className="text-green-400 font-bold">{movie.vote_average?.toFixed(1)} Stars</span>
                  <span>{movie.release_date?.substring(0,4) || movie.first_air_date?.substring(0,4)}</span>
                </div>
              </div>
              {movie.vote_average > 0 && (
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-green-400 font-bold text-xs px-2 py-1 rounded shadow-lg border border-white/10 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
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
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'Home');
  const [featured, setFeatured] = useState(null);
  const [trending, setTrending] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  
  const { watchlist, toggleWatchlist } = useAuth();
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
      try {
        let endpoint = activeTab === 'TV Shows' ? requests.fetchTrendingTV : requests.fetchTrendingMovies;
        endpoint += `&_t=${Date.now()}`;
        const request = await fetch(endpoint).then(res => res.json());
        if (request.results?.length > 0) {
          setTrending(request.results);
          setFeatured(request.results[Math.floor(Math.random() * request.results.length)]);
        } else {
          throw new Error("No results found");
        }
      } catch (error) {
        console.error("Failed to fetch featured movie:", error);
      }
    }
    if (activeTab !== 'My List') fetchFeatured();
  }, [activeTab]);

  const getGenreUrl = (baseId) => {
    const type = activeTab === 'TV Shows' ? 'tv' : 'movie';
    return `${BASE_URL}/discover/${type}?api_key=${API_KEY}&with_genres=${selectedGenre || baseId}`;
  };

  const removeFromHistory = (id) => {
    setWatchHistory(prev => prev.filter(m => m.id !== id));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.02, y: -15 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-screen bg-[#0a0a0c] pb-20 md:pb-0 flex flex-col"
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
            {watchlist.length > 0 ? (
               <div className="-ml-4 md:-ml-12"><Row title="" moviesArray={watchlist} onRemove={toggleWatchlist} isLargeRow /></div>
            ) : (
               <p className="text-gray-400 text-lg">You haven't added anything to your list yet.</p>
            )}
          </div>
        ) : (
          <>
            <Hero movie={featured} trending={trending} onSelect={setFeatured} />
            
            {/* Genre Filter */}
            {activeTab !== 'Home' && (
              <div className="absolute top-20 md:top-24 left-4 md:left-12 z-40 flex items-center space-x-4">
                <h1 className="text-white text-2xl md:text-4xl font-bold">{activeTab}</h1>
                <div className="relative">
                  <select
                    className="appearance-none bg-black/50 border border-white/50 text-white px-4 py-1.5 pr-10 text-xs md:text-sm font-semibold rounded hover:bg-black/80 transition outline-none focus:border-white cursor-pointer shadow-lg"
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                  >
                    <option value="" className="bg-gray-900 text-white">All Genres</option>
                    {genres.map(g => (
                      <option key={g.id} value={g.id.toString()} className="bg-gray-900 text-white">
                        {g.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/80" />
                </div>
              </div>
            )}

            <div className="pb-20 md:pb-32 -mt-4 md:-mt-8 relative z-20">
              {watchHistory && watchHistory.length > 0 && (
                <Row title="Continue Watching" moviesArray={watchHistory} onRemove={removeFromHistory} />
              )}
              {activeTab === 'Home' && watchlist.length > 0 && (
                <Row title="My List" moviesArray={watchlist} onRemove={toggleWatchlist} />
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
                  <Row title="Now Playing" icon={Radio} fetchUrl={requests.fetchNowPlayingMovies} isLargeRow filterReleased />
                  <Row title="Upcoming" icon={Calendar} fetchUrl={requests.fetchUpcomingMovies} isLargeRow filterUpcoming />
                  <Row title="TOP 10 SHOWS TODAY" fetchUrl={requests.fetchTrendingTV} isLargeRow isTop10 />
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
       <div className="bg-[#0a0a0c] border border-gray-800 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
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

function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      let timeLeft = {};

      if (difference > 0) {
        timeLeft = {
          month: Math.floor(difference / (1000 * 60 * 60 * 24 * 30.44)),
          days: Math.floor((difference / (1000 * 60 * 60 * 24)) % 30.44),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          min: Math.floor((difference / 1000 / 60) % 60),
          sec: Math.floor((difference / 1000) % 60),
        };
      }
      return timeLeft;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const pad = (num) => String(num).padStart(2, '0');

  if (Object.keys(timeLeft).length === 0) return null;

  return (
    <div className="flex space-x-2 md:space-x-4 mb-8">
      {['month', 'days', 'hours', 'min', 'sec'].map(interval => (
        <div key={interval} className="flex flex-col items-center bg-[#222]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-[0_10px_20px_rgba(0,0,0,0.5)] min-w-[70px] md:min-w-[90px]">
          <span className="text-4xl md:text-5xl font-display font-light tracking-wider text-white">
            {pad(timeLeft[interval] || 0)}
          </span>
          <span className="text-[10px] md:text-xs uppercase tracking-widest text-gray-400 mt-2 font-bold">{interval}</span>
        </div>
      ))}
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
  const [collectionMovies, setCollectionMovies] = useState([]);
  
  const { currentUser, watchlist, toggleWatchlist } = useAuth();
  const [likedMovies, setLikedMovies] = useLocalStorage('netphlix_liked', []);
  const [personalRatings, setPersonalRatings] = useLocalStorage('netphlix_ratings', {});
  const currentRating = personalRatings[id] || 0;
  const inList = watchlist.some(m => m.id === parseInt(id));
  const isLiked = likedMovies.some(m => m.id === parseInt(id));

  const toggleLike = () => {
    if (isLiked) {
      setLikedMovies(prev => prev.filter(m => m.id !== parseInt(id)));
    } else {
      setLikedMovies(prev => [{
        id: parseInt(id),
        title: details.title || details.name,
        name: details.title || details.name,
        media_type: type,
        poster_path: details.poster_path,
        backdrop_path: details.backdrop_path
      }, ...prev]);
    }
  };

  const handleRating = (value) => {
    setPersonalRatings(prev => ({...prev, [id]: value}));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchDetails() {
      const appendStr = type === 'movie' 
        ? 'credits,videos,images,reviews,keywords,release_dates,watch/providers' 
        : 'credits,videos,images,reviews,keywords,content_ratings,watch/providers';
      const url = `${BASE_URL}/${type}/${id}?api_key=${API_KEY}&append_to_response=${appendStr}`;
      const res = await fetch(url).then(r => r.json());
      setDetails(res);
      
      const similarUrl = `${BASE_URL}/${type}/${id}/similar?api_key=${API_KEY}`;
      const simRes = await fetch(similarUrl).then(r => r.json());
      setSimilar(simRes.results?.slice(0, 12) || []);

      if (type === 'tv') {
        fetchSeasonEpisodes(1);
      }

      if (res.belongs_to_collection) {
        try {
          const colUrl = `${BASE_URL}/collection/${res.belongs_to_collection.id}?api_key=${API_KEY}`;
          const colRes = await fetch(colUrl).then(r => r.json());
          if (colRes.parts) {
            setCollectionMovies(colRes.parts.sort((a, b) => new Date(a.release_date || '2099-01-01') - new Date(b.release_date || '2099-01-01')));
          }
        } catch(e) {}
      }

      // Color extraction
      if (res.poster_path || res.backdrop_path) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = `${IMAGE_BASE_URL_W500}${res.poster_path || res.backdrop_path}`;
        img.onload = () => {
          const fac = new FastAverageColor();
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
    if (!currentUser) {
      navigate('/login');
      return;
    }
    toggleWatchlist({ ...details, type });
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
  const runtime = details.runtime ? `${details.runtime} minutes (${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m)` : 'TBA';
  const releaseYear = details.release_date?.substring(0,4) || details.first_air_date?.substring(0,4) || 'Unknown';

  const director = details.credits?.crew?.find(c => c.job === 'Director');
  const companies = details.production_companies || [];
  const ratingColor = details.vote_average >= 8 ? 'ring-green-400' : details.vote_average >= 6 ? 'ring-yellow-400' : 'ring-red-400';
  const releaseDate = details.release_date || details.first_air_date;
  const formattedDate = releaseDate ? new Date(releaseDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown Date';
  const logo = details.images?.logos?.find(l => l.iso_639_1 === 'en')?.file_path || details.images?.logos?.[0]?.file_path;

  const KNOWN_AWARD_WINNERS = [
    872585, // Oppenheimer
    496243, // Parasite
    545609, // Everything Everywhere All at Once
    155,    // The Dark Knight
    13,     // Forrest Gump
    122,    // The Lord of the Rings: The Return of the King
    680,    // Pulp Fiction
    278,    // The Shawshank Redemption
    238,    // The Godfather
    424,    // Schindler's List
    157336, // Interstellar (VFX)
    118340, // Guardians of the Galaxy (Nominated/VFX)
    603,    // The Matrix
    70160,  // The Hunger Games (not Oscar but huge awards)
  ];
  const kwds = details.keywords?.results || details.keywords?.keywords || [];
  const hasAwardKeyword = kwds.some(k => k.name.toLowerCase().includes('oscar') || k.name.toLowerCase().includes('emmy') || k.name.toLowerCase().includes('award'));
  const isAwardWinner = hasAwardKeyword || KNOWN_AWARD_WINNERS.includes(parseInt(id));

  let ageRating = null;
  if (type === 'movie' && details.release_dates) {
     const usRelease = details.release_dates.results?.find(r => r.iso_3166_1 === 'US');
     if (usRelease && usRelease.release_dates.length > 0) {
        ageRating = usRelease.release_dates[0].certification;
     }
  } else if (type === 'tv' && details.content_ratings) {
     const usRating = details.content_ratings.results?.find(r => r.iso_3166_1 === 'US');
     if (usRating) {
        ageRating = usRating.rating;
     }
  }

  const usProviders = details['watch/providers']?.results?.US;
  const watchProviders = usProviders?.flatrate || usProviders?.rent || usProviders?.buy || [];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.02, y: -15 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-screen bg-shows-dark text-white pb-20 md:pb-0 font-sans relative overflow-hidden"
    >
      <Navbar activeTab="" setActiveTab={() => navigate('/')} />
      
      {/* Background with Parallax */}
      <div className="absolute top-0 left-0 w-full h-[100vh] z-0 pointer-events-none overflow-hidden bg-[#0a0a0a]">
        <motion.img style={{ y: backgroundY }} src={`${IMAGE_BASE_URL}${details.backdrop_path}`} className="w-full h-[120%] -top-[10%] relative object-cover opacity-50 transition-opacity duration-500" alt="bg" />
        <div className="absolute inset-0 bg-black/20 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-shows-dark via-shows-dark/60 via-20% to-transparent to-80%"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-shows-dark/80 via-shows-dark/20 to-transparent"></div>
      </div>

      <motion.div 
        initial={{ y: "100vh", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 container mx-auto px-4 md:px-12 pt-32 pb-20 flex flex-col lg:flex-row gap-12 lg:gap-20"
      >
        
        {/* Left Column: Poster */}
        <div className="w-full md:w-[300px] mx-auto lg:mx-0 flex-none z-20 pt-4">
          <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl shadow-black/80">
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

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Info Area */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Center Column: Details */}
            <div className="flex-1 flex flex-col justify-start">
          {isAwardWinner && (
             <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600/20 to-yellow-400/10 border border-yellow-500/30 text-yellow-500 px-4 py-1.5 rounded-full w-max mb-4 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                <Star className="w-4 h-4 fill-yellow-500" />
                <span className="text-xs font-bold uppercase tracking-widest">Award Winner</span>
             </div>
          )}

          {logo ? (
            <img src={`${IMAGE_BASE_URL_W500}${logo}`} alt={details.title || details.name} className="w-full max-w-[400px] object-contain mb-6 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] filter contrast-125" />
          ) : (
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight mb-6 drop-shadow-2xl leading-none">
              {details.title || details.name}
            </h1>
          )}
          
          {/* Production Companies */}
          {companies.filter(c => c.logo_path).length > 0 && (
            <div className="flex flex-wrap items-center gap-8 mb-10">
              {companies.filter(c => c.logo_path).slice(0, 4).map(c => (
                <motion.div 
                  key={c.id} 
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="relative group/logo cursor-pointer flex items-center justify-center"
                  onClick={() => navigate(`/company/${c.id}`)}
                >
                  <img src={`${IMAGE_BASE_URL_W500}${c.logo_path}`} className="h-6 md:h-8 object-contain filter brightness-0 invert opacity-90 group-hover/logo:brightness-100 group-hover/logo:invert-0 group-hover/logo:opacity-100 transition-all duration-300 drop-shadow-md" alt={c.name} />
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 border border-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover/logo:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl z-50 backdrop-blur-sm">
                    {c.name}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="flex flex-col space-y-2 text-gray-300 font-medium mb-6">
            <div className="flex items-center text-[13px]"><Calendar className="w-4 h-4 mr-2 text-gray-400"/> {formattedDate} (United States)</div>
            <div className="flex items-center text-[13px]">
               <Clock className="w-4 h-4 mr-2 text-gray-400"/> {runtime}
               {ageRating && (
                 <span className="ml-3 border border-white/40 text-gray-300 px-1.5 py-0.5 text-[11px] rounded font-bold tracking-wider">{ageRating}</span>
               )}
            </div>
          </div>

          {details.genres && (
            <div className="flex flex-wrap gap-2 mb-8">
              {details.genres.map(g => (
                <span key={g.id} className="px-4 py-1.5 bg-white/5 rounded-full text-[12px] font-medium text-gray-300 border border-white/10 cursor-default">
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {director && (
            <div className="flex items-center mb-12 cursor-pointer group w-max" onClick={() => navigate(`/person/${director.id}`)}>
              <div className="w-12 h-12 rounded-full mr-4 overflow-hidden flex-none">
                {director.profile_path ? (
                  <img src={`${IMAGE_BASE_URL_W500}${director.profile_path}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" alt={director.name} />
                ) : (
                  <div className="w-full h-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"><User className="w-5 h-5 text-gray-400"/></div>
                )}
              </div>
              <div className="flex flex-col justify-center">
                <p className="font-bold text-white text-base leading-none group-hover:text-netflix-red transition-colors">{director.name}</p>
                <p className="text-gray-400 text-xs mt-1 leading-none">Director</p>
              </div>
            </div>
          )}

          <div className="mb-6 mt-4">
            <p className="text-xs font-bold text-gray-100 mb-3">Available on</p>
            <div className="w-12 h-12 bg-[#01b4e4] rounded-lg flex items-center justify-center font-black text-[10px] leading-none text-[#0d253f] text-center shadow-lg">THE<br/>MOVIE<br/>DB</div>
          </div>

          {new Date(releaseDate) > new Date() && (
            <Countdown targetDate={releaseDate} />
          )}

          <div className="flex flex-wrap gap-3 mb-12">
            {new Date(releaseDate) <= new Date() && (
              <button onClick={() => navigate(`/watch/${type}/${id}`)} className="flex items-center bg-netflix-red hover:bg-red-700 text-white rounded-full px-8 py-2.5 text-sm font-bold shadow-lg shadow-red-500/30 transition-all hover:scale-105">
                <Play className="w-5 h-5 mr-2 fill-current" />
                Play Now
              </button>
            )}
            <button onClick={toggleMyList} className="flex items-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-5 py-2.5 text-sm font-semibold text-gray-200 transition-colors group">
              <Bookmark className={`w-4 h-4 mr-2 ${inList ? 'fill-white text-white' : ''}`} />
              {inList ? 'In Watchlist' : 'Watchlist'}
            </button>
            <button onClick={toggleLike} className="flex items-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-5 py-2.5 text-sm font-semibold text-gray-200 transition-colors group">
              <Calendar className={`w-4 h-4 mr-2 ${isLiked ? 'fill-white text-white' : ''}`} />
              Reminder
            </button>
            <button className="flex items-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-5 py-2.5 text-sm font-semibold text-gray-200 transition-colors group">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </button>
          </div>

          </div>

            {/* Right Column: Cast */}
            <div className="w-full lg:w-[280px] flex-none">
              <h3 className="text-lg font-bold mb-6 text-white font-display tracking-tight">Casts & Credits</h3>
              <div className="flex flex-col space-y-4">
                {castList.map(person => (
                  <div key={person.id} className="flex items-center space-x-4 cursor-pointer group" onClick={() => navigate(`/person/${person.id}`)}>
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-none bg-white/5">
                      {person.profile_path ? (
                        <img src={`${IMAGE_BASE_URL_W500}${person.profile_path}`} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-300" alt={person.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><User className="w-4 h-4 text-gray-500" /></div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="font-bold text-[13px] text-gray-200 group-hover:text-white transition-colors leading-tight">{person.name}</span>
                      <span className="text-[11px] text-gray-500 mt-0.5 leading-tight">{person.character}</span>
                    </div>
                  </div>
                ))}
                <button className="text-blue-500 text-xs font-bold mt-2 flex items-center hover:text-blue-400 transition w-max">
                  Show All <ChevronDown className="w-3 h-3 ml-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Content Area (Aligned under logo) */}
          <div className="mt-8 w-full max-w-4xl pb-20">
            <div className="mb-12 pr-4 md:pr-12">
              <h3 className="text-lg font-bold mb-4 font-display">Overview</h3>
              <p className="text-gray-300 text-[13px] leading-relaxed mb-6">{details.overview}</p>
              
              {watchProviders.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-bold text-gray-400 mb-3">Available to Watch On</p>
                  <div className="flex flex-wrap gap-3">
                    {watchProviders.map(provider => (
                       <div key={provider.provider_id} className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shadow-lg" title={provider.provider_name}>
                          <img src={`${IMAGE_BASE_URL_W500}${provider.logo_path}`} alt={provider.provider_name} className="w-full h-full object-cover" />
                       </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {trailer && (
              <div className="mb-12 relative w-full max-w-2xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 group cursor-pointer mx-auto lg:mx-0" onClick={() => navigate(`/watch/${type}/${id}`)}>
                <img src={`${IMAGE_BASE_URL}${details.backdrop_path}`} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/30">
                     <Play className="w-8 h-8 text-white ml-1 fill-current" />
                   </div>
                </div>
                <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
                   <h2 className="text-xl md:text-2xl font-black text-white font-display drop-shadow-lg tracking-tight">{details.title || details.name}</h2>
                   <p className="text-gray-300 font-medium tracking-widest text-[10px] uppercase mt-1">Official Trailer</p>
                </div>
              </div>
            )}

            {details.belongs_to_collection && collectionMovies.length > 0 && (
              <div className="mb-12">
                <h3 className="text-lg font-bold mb-6 text-white font-display">The {details.belongs_to_collection.name} - Watch in Order</h3>
                <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4">
                  {collectionMovies.map(movie => (
                    <div 
                      key={movie.id} 
                      className={`flex-none w-32 md:w-40 aspect-[2/3] rounded-xl overflow-hidden cursor-pointer relative group border-2 ${movie.id === parseInt(id) ? 'border-netflix-red shadow-[0_0_15px_rgba(229,9,20,0.5)] scale-105 z-10' : 'border-transparent hover:border-white/30'}`}
                      onClick={() => navigate(`/title/movie/${movie.id}`)}
                    >
                      <img src={`${IMAGE_BASE_URL_W500}${movie.poster_path}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={movie.title} />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-8 h-8 text-white fill-current shadow-lg" />
                      </div>
                      {movie.id === parseInt(id) && (
                        <div className="absolute top-2 left-2 bg-netflix-red text-[10px] font-bold px-2 py-0.5 rounded shadow-md">YOU ARE HERE</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {similar?.length > 0 && (
              <div className="mb-12">
                <h3 className="text-lg font-bold mb-6 text-white font-display">Recommendation & Similar</h3>
                <div className="flex flex-col space-y-3">
                  {similar.slice(0, 4).map((movie, index) => (
                    <div 
                      key={movie.id} 
                      className="flex bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 p-3 items-center transition-colors cursor-pointer group"
                      onClick={() => {
                        navigate(`/title/${movie.media_type || type}/${movie.id}`, { state: { movie } });
                        window.scrollTo(0,0);
                      }}
                    >
                      <span className="text-gray-500 font-bold px-4 md:px-6">{index + 1}</span>
                      <img src={`${IMAGE_BASE_URL_W500}${movie.poster_path}`} className="w-12 h-20 md:w-16 md:h-24 rounded object-cover shadow-md group-hover:shadow-lg transition-shadow" alt={movie.title || movie.name} />
                      <div className="ml-4 flex-1">
                        <h4 className="font-bold text-white text-[13px] md:text-sm mb-1">{movie.title || movie.name}</h4>
                        <div className="flex items-center text-[11px] text-gray-400 space-x-3">
                          {movie.vote_average > 0 && (
                            <span className="flex items-center text-yellow-500"><Star className="w-3 h-3 mr-1 fill-current" /> {movie.vote_average.toFixed(1)}</span>
                          )}
                          <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] text-gray-300">{movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 max-w-[260px] md:max-w-md line-clamp-2 hidden sm:block pl-6 pr-4">
                        {movie.overview}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
      </div>
      </motion.div>
      <Footer />
    </motion.div>
  );
}

import Hls from 'hls.js';

const CustomPlayer = ({ src, type = 'm3u8', title, poster, onReady, onError, onProgress, captions = [] }) => {
  const playerRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    if (!playerRef.current || !src) return;
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (Hls.isSupported() && type !== 'mp4') {
      hlsRef.current = new Hls();
      hlsRef.current.loadSource(src);
      hlsRef.current.attachMedia(playerRef.current);
      hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => onReady?.());
      hlsRef.current.on(Hls.Events.ERROR, (e, data) => onError?.(data));
    } else {
      playerRef.current.src = src;
      playerRef.current.addEventListener('loadedmetadata', () => onReady?.());
    }
  }, [src, type]);

  return <video ref={playerRef} controls poster={poster} autoPlay playsInline className="w-full h-full" />;
};

function WatchPage() {
  const { type, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();
  
  const queryParams = new URLSearchParams(location.search);
  const season = queryParams.get('s') || 1;
  const episode = queryParams.get('e') || 1;  const SERVERS = ['Fast', 'Peachify (may contain hindi)', 'VidAPI', 'RGShows', 'SmashyStream', 'VidLink', 'VidSrcRU', 'VSrcSU', 'SuperEmbed', '2Embed'];
  const [server, setServer] = useLocalStorage('netphlix_server', SERVERS[0]);
  const [useSandbox, setUseSandbox] = useLocalStorage('netphlix_useSandbox', false);
  const [adfreeServer, setAdfreeServer] = useLocalStorage('netphlix_adfreeServer', 0); // Stores the index of the selected stream
  const [availableStreams, setAvailableStreams] = useState([]);

  const [watchHistory, setWatchHistory] = useLocalStorage('netphlix_watchHistory', []);
  
  const [details, setDetails] = useState(null);
  const [episodesList, setEpisodesList] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [nativeStreamUrl, setNativeStreamUrl] = useState(null);
  const [nativeStreamType, setNativeStreamType] = useState('m3u8');
  const [nativeCaptions, setNativeCaptions] = useState([]);
  const [streamLoading, setStreamLoading] = useState(true);

  // --- PWA Popup Player ---
  const isPWA = typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
  const [pwaPopupOpen, setPwaPopupOpen] = useState(false);
  const popupWindowRef = useRef(null);

  const openPwaPlayer = () => {
    const src = getIframeSrc();
    const width = Math.min(window.screen.availWidth, 1280);
    const height = Math.min(window.screen.availHeight, 720);
    const left = Math.round((window.screen.availWidth - width) / 2);
    const top = Math.round((window.screen.availHeight - height) / 2);

    // Close existing popup if still open
    if (popupWindowRef.current && !popupWindowRef.current.closed) {
      popupWindowRef.current.close();
    }

    const popup = window.open(
      src,
      'netphlix_player',
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,scrollbars=no,resizable=yes`
    );

    if (popup) {
      popupWindowRef.current = popup;
      setPwaPopupOpen(true);

      // Monitor popup close
      const checkClosed = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(checkClosed);
          setPwaPopupOpen(false);
          popupWindowRef.current = null;
        }
      }, 500);
    }
  };

  // Cleanup popup on unmount or navigation
  useEffect(() => {
    return () => {
      if (popupWindowRef.current && !popupWindowRef.current.closed) {
        popupWindowRef.current.close();
        popupWindowRef.current = null;
      }
    };
  }, [id, season, episode]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id, season, episode]);

  // Fetch Stream from Backend
  useEffect(() => {
    const fetchStream = async () => {
      if (userRole !== 'premium') return;
      try {
        setStreamLoading(true);
        const url = `https://movie-scraper-gilt.vercel.app/api?tmdb=${id}${type === 'tv' ? `&s=${season}&e=${episode}` : ''}`;
        
        let allStreams = [];
        let allCaptions = [];

        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data.success && data.streams) {
            allStreams = [...data.streams];
            allCaptions = data.captions || [];
          }
        } catch(err) {
          console.error("Error fetching primary stream API:", err);
        }

        // Fetch Backup API
        const backupUrl = `https://movie-scraper-brown.vercel.app/api/stream?tmdbId=${id}&type=${type}${type === 'tv' ? `&season=${season}&episode=${episode}` : ''}`;
        try {
          const backupRes = await fetch(backupUrl);
          const backupData = await backupRes.json();
          if (backupData.success && backupData.streamUrl) {
            allStreams.push({ name: "VidLink (Backup API)", url: backupData.streamUrl });
            // Only use backup captions if primary failed
            if (allCaptions.length === 0 && backupData.captions) {
              allCaptions = backupData.captions;
            }
          }
        } catch(err) {
          console.error("Error fetching backup stream API:", err);
        }

        // Fetch CinePro API (Render deployment)
        const cineproUrl = type === 'tv' 
          ? `https://core-4z5l.onrender.com/v1/tv/${id}/seasons/${season}/episodes/${episode}`
          : `https://core-4z5l.onrender.com/v1/movies/${id}`;
        try {
          const cineproRes = await fetch(cineproUrl);
          const cineproData = await cineproRes.json();
          if (cineproData && cineproData.sources && cineproData.sources.length > 0) {
            cineproData.sources.forEach(source => {
              if (source.url) {
                 const providerName = source.provider?.name || source.name || 'Stream';
                 allStreams.push({ 
                    name: `CinePro - ${providerName} (${source.quality || 'Auto'})`, 
                    url: source.url,
                    type: source.type || 'mp4' 
                 });
              }
            });
          }
        } catch(err) {
          console.error("Error fetching CinePro API:", err);
        }

        if (allStreams.length > 0) {
            setAvailableStreams(allStreams);
            // Default to the first stream if adfreeServer index is out of bounds
            const streamIndex = (adfreeServer < allStreams.length) ? adfreeServer : 0;
            if (streamIndex !== adfreeServer) setAdfreeServer(streamIndex);
            
            setNativeStreamUrl(allStreams[streamIndex].url);
            setNativeStreamType(allStreams[streamIndex].type || 'm3u8');
            setNativeCaptions(allCaptions);
        } else {
            console.error("No stream URLs returned from any API.");
            setAvailableStreams([]);
        }
      } catch(err) {
         console.error("Unexpected error in fetchStream:", err);
      } finally {
         setStreamLoading(false);
      }
    };
    
    if (server === 'Fast') {
       fetchStream();
    }
  }, [type, id, season, episode, server]);

  // Handle stream source switching instantly
  useEffect(() => {
      if (availableStreams.length > 0 && adfreeServer < availableStreams.length) {
          setNativeStreamUrl(availableStreams[adfreeServer].url);
          setNativeStreamType(availableStreams[adfreeServer].type || 'm3u8');
      }
  }, [adfreeServer, availableStreams]);

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
        case 'VidSrcRU': return `https://vidsrc.ru/tv/${id}/${season}/${episode}`;
        case 'VSrcSU': return `https://vsrc.su/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`;
        case 'SuperEmbed': return `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
        case '2Embed': return `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`;
        case 'Peachify (may contain hindi)': return `https://peachify.top/embed/tv/${id}/${season}/${episode}`;
        default: return `https://vaplayer.ru/embed/tv/${id}/${season}/${episode}?autoplay=1`;
      }
    } else {
      switch(server) {
        case 'VidAPI': return `https://vaplayer.ru/embed/movie/${id}?autoplay=1`;
        case 'VidLink': return `https://vidlink.pro/movie/${id}`;
        case 'RGShows': return `https://rgshows.me/player/movies/api1/index.html?id=${id}`;
        case 'SmashyStream': return `https://embed.smashystream.com/playere.php?tmdb=${id}`;
        case 'VidSrcRU': return `https://vidsrc.ru/movie/${id}`;
        case 'VSrcSU': return `https://vsrc.su/embed/movie?tmdb=${id}`;
        case 'SuperEmbed': return `https://multiembed.mov/?video_id=${id}&tmdb=1`;
        case '2Embed': return `https://www.2embed.cc/embed/${id}`;
        case 'Peachify (may contain hindi)': return `https://peachify.top/embed/movie/${id}`;
        default: return `https://vaplayer.ru/embed/movie/${id}?autoplay=1`;
      }
    }
  };

  if (!details) {
    return <div className="w-screen h-screen bg-[#0a0a0c] flex items-center justify-center"><div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const currentEpData = type === 'tv' ? episodesList.find(e => e.episode_number === parseInt(episode)) : null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.02, y: -15 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-screen bg-[#0a0a0c] text-white pb-20 md:pb-0"
    >
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Full-width Player Section */}
      <div className="pt-16 md:pt-24 w-full bg-black relative">
        <div className="max-w-[1800px] mx-auto relative group">
          <div id="video-player-container" className="relative w-full aspect-video bg-black md:rounded-xl overflow-hidden md:shadow-[0_0_60px_rgba(0,0,0,0.8)] md:border border-gray-800 transition-all duration-500">
             {userRole !== 'premium' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0c] z-30 p-4 text-center">
                   <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 border border-white/20">
                     <Lock className="w-10 h-10 text-[var(--accent-color)]" />
                   </div>
                   <h2 className="text-3xl font-black mb-2">Premium Content</h2>
                   <p className="text-gray-400 max-w-md mb-8">
                     This content is available exclusively for Netphlixx Premium members. Upgrade your account to start watching instantly.
                   </p>
                   <a 
                     href="https://t.me/Marvelousshivam" 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     className="px-8 py-4 bg-[var(--accent-color)] text-white font-bold rounded-xl shadow-[0_0_30px_rgba(229,9,20,0.5)] hover:scale-105 transition-transform"
                   >
                     Upgrade to Premium
                   </a>
                </div>
             ) : (
               <>
                 {streamLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
                       <div className="flex flex-col items-center">
                          <div className="w-12 h-12 border-4 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin"></div>
                          <p className="mt-4 text-gray-400 font-bold tracking-widest text-sm uppercase">Loading Stream</p>
                       </div>
                    </div>
                 )}
                 
                 {nativeStreamUrl ? (
                    <CustomPlayer 
                       src={nativeStreamUrl} 
                       type={nativeStreamType} 
                       captions={nativeCaptions} 
                       poster={details.backdrop_path ? `${IMAGE_BASE_URL}${details.backdrop_path}` : null}
                       title={details.title || details.name}
                       onReady={() => setStreamLoading(false)}
                       onError={(e) => {
                          console.error("Native player error:", e);
                          // Fallback logic could be added here
                       }}
                    />
                 ) : (
                    <iframe
                      id="netphlix-iframe-player"
                      src={getIframeSrc()}
                      className="w-full h-full absolute inset-0 bg-black"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      onLoad={() => setStreamLoading(false)}
                    ></iframe>
                 )}
               </>
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

              {server === 'Fast' && availableStreams.length > 0 && (
                <div className="flex items-center bg-[#1a1a1a] px-3 py-2 md:py-2.5 rounded-lg border border-gray-700 hover:border-gray-500 transition shadow-lg w-full md:w-auto">
                  <span className="text-[var(--accent-color)] text-xs font-semibold mr-2 hidden sm:block">SOURCE:</span>
                  <select 
                    value={adfreeServer} 
                    onChange={(e) => setAdfreeServer(parseInt(e.target.value))}
                    className="bg-transparent text-white font-bold outline-none text-sm cursor-pointer w-full"
                  >
                    {availableStreams.map((stream, idx) => (
                        <option key={idx} value={idx} className="bg-gray-900 text-white">
                            {stream.name}
                        </option>
                    ))}
                  </select>
                </div>
              )}

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
            </div>
         </div>
      </div>

      {/* Details Section */}
      <div className="relative">
         {/* Backdrop Image */}
         {details.backdrop_path && (
            <div className="absolute inset-0 opacity-10 pointer-events-none">
               <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/80 to-transparent z-10" />
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

function ProfilePage() {
  const { currentUser, userRole, watchlist, toggleWatchlist } = useAuth();
  const [likedMovies, setLikedMovies] = useLocalStorage('netphlix_liked', []);
  const navigate = useNavigate();

  const removeFromLiked = (id) => {
    setLikedMovies(prev => prev.filter(m => m.id !== id));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.02, y: -15 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-screen bg-shows-dark text-white pt-32 px-4 md:px-12 pb-20"
    >
      <Navbar activeTab="" setActiveTab={() => navigate('/')} />
      <div className="container mx-auto">
         <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-12">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-[#2a2a2a] rounded-full border border-gray-600 flex items-center justify-center mr-6 shadow-xl">
                 <User className="w-10 h-10 text-gray-300" />
              </div>
              <div>
                 <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight">
                   {currentUser?.displayName || 'My Profile'}
                 </h1>
                 <p className="text-gray-400 mt-2">{currentUser?.email}</p>
                 <div className="mt-2 flex items-center space-x-2">
                   <span className="px-3 py-1 bg-white/10 text-xs font-bold uppercase tracking-wider rounded-md border border-white/20">
                     Status: <span className={userRole === 'premium' ? 'text-green-500' : 'text-gray-400'}>{userRole}</span>
                   </span>
                 </div>
              </div>
            </div>
            
            {userRole !== 'premium' && (
              <div className="mt-6 md:mt-0">
                <a href="https://t.me/Marvelousshivam" target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-3 bg-[var(--accent-color)] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(229,9,20,0.4)] hover:bg-red-700 transition-colors">
                  Upgrade to Premium
                </a>
              </div>
            )}
         </div>
         
         {/* Watchlist Section */}
         <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-6 flex items-center">
               <Bookmark className="w-6 h-6 mr-3 text-netflix-red" /> My Watchlist <span className="ml-3 text-gray-500 text-lg">({watchlist.length})</span>
            </h2>
            {watchlist.length > 0 ? (
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                 {watchlist.map(movie => (
                    <div key={movie.id} className="w-full flex justify-center">
                      <RowCard movie={movie} isLargeRow={true} isTop10={false} onNavigate={(m, action) => {
                        const mediaType = m.type || m.media_type || (m.name ? 'tv' : 'movie');
                        if (action === 'play') navigate(`/watch/${mediaType}/${m.id}`);
                        else navigate(`/title/${mediaType}/${m.id}`, { state: { movie: m } });
                      }} onRemove={() => toggleWatchlist(movie)} />
                    </div>
                 ))}
               </div>
            ) : (
               <div className="text-center py-16 bg-white/5 rounded-xl border border-white/10">
                 <Bookmark className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                 <p className="text-xl text-gray-400">Your watchlist is empty</p>
                 <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">Explore Movies & TV</button>
               </div>
            )}
         </div>

         {/* Liked Section */}
         <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-6 flex items-center">
               <Heart className="w-6 h-6 mr-3 text-netflix-red fill-netflix-red" /> Liked <span className="ml-3 text-gray-500 text-lg">({likedMovies.length})</span>
            </h2>
            {likedMovies.length > 0 ? (
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                 {likedMovies.map(movie => (
                    <div key={movie.id} className="w-full flex justify-center">
                      <RowCard movie={movie} isLargeRow={true} isTop10={false} onNavigate={(m, action) => {
                        const mediaType = m.type || m.media_type || (m.name ? 'tv' : 'movie');
                        if (action === 'play') navigate(`/watch/${mediaType}/${m.id}`);
                        else navigate(`/title/${mediaType}/${m.id}`, { state: { movie: m } });
                      }} onRemove={() => removeFromLiked(movie.id)} />
                    </div>
                 ))}
               </div>
            ) : (
               <div className="text-center py-16 bg-white/5 rounded-xl border border-white/10">
                 <Heart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                 <p className="text-xl text-gray-400">You haven't liked anything yet</p>
               </div>
            )}
         </div>

         <div className="mt-12 flex justify-center">
           <button onClick={() => { auth.signOut(); navigate('/login'); }} className="px-6 py-2 border border-red-500 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-colors">
             Log Out
           </button>
         </div>
      </div>
    </motion.div>
  );
}

function CategoryPage() {
  const { title } = useParams();
  const location = useLocation();
  const fetchUrl = location.state?.fetchUrl;
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0,0);
    if (!fetchUrl) return;
    
    setMovies([]);
    setPage(1);
    setHasMore(true);

    async function fetchInitial() {
      setIsLoading(true);
      const separator = fetchUrl.includes('?') ? '&' : '?';
      const url = `${fetchUrl}${separator}page=1`;
      const req = await fetch(url).then(r=>r.json());
      setMovies(req.results || []);
      if (req.page >= req.total_pages || !req.results || req.results.length === 0) setHasMore(false);
      setIsLoading(false);
    }
    fetchInitial();
  }, [fetchUrl]);

  useEffect(() => {
    if (!fetchUrl || page === 1 || !hasMore) return;

    async function fetchMore() {
      setIsLoading(true);
      const separator = fetchUrl.includes('?') ? '&' : '?';
      const url = `${fetchUrl}${separator}page=${page}`;
      const req = await fetch(url).then(r=>r.json());
      setMovies(prev => {
        const newMovies = req.results || [];
        const map = new Map(prev.map(m => [m.id, m]));
        newMovies.forEach(m => map.set(m.id, m));
        return Array.from(map.values());
      });
      if (req.page >= req.total_pages || !req.results || req.results.length === 0) setHasMore(false);
      setIsLoading(false);
    }
    fetchMore();
  }, [page, fetchUrl]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000 && hasMore && !isLoading) {
        setPage(prev => prev + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.02, y: -15 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-screen bg-shows-dark text-white pt-32 px-4 md:px-12 pb-20"
    >
      <Navbar activeTab="" setActiveTab={() => navigate('/')} />
      <h1 className="text-3xl md:text-5xl font-display font-bold mb-10 tracking-tight">{decodeURIComponent(title)}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {movies.map(movie => (
           <div key={movie.id} className="w-full flex justify-center">
             <RowCard movie={movie} isLargeRow={true} isTop10={false} onNavigate={(m, action) => {
               const mediaType = m.type || m.media_type || (m.name ? 'tv' : 'movie');
               if (action === 'play') navigate(`/watch/${mediaType}/${m.id}`);
               else navigate(`/title/${mediaType}/${m.id}`, { state: { movie: m } });
             }} />
           </div>
        ))}
      </div>
      <Footer />
    </motion.div>
  );
}

function PersonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchPerson() {
      const url = `${BASE_URL}/person/${id}?api_key=${API_KEY}&append_to_response=movie_credits,tv_credits`;
      try {
        const res = await fetch(url).then(r => r.json());
        setPerson(res);
      } catch(e) {
        console.error("Failed to fetch person", e);
      }
    }
    fetchPerson();
  }, [id]);

  if (!person) return (
    <div className="min-h-screen bg-shows-dark text-white pt-32 px-4 md:px-12 flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const knownFor = [...(person.movie_credits?.cast || []), ...(person.tv_credits?.cast || [])]
    .filter(m => m.poster_path)
    .sort((a, b) => b.popularity - a.popularity)
    .reduce((acc, current) => {
      const x = acc.find(item => item.id === current.id);
      if (!x) return acc.concat([current]);
      return acc;
    }, [])
    .slice(0, 20);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-shows-dark text-white font-sans relative"
    >
      <Navbar activeTab="" setActiveTab={() => navigate('/')} />
      
      <div className="container mx-auto px-4 md:px-12 pt-32 pb-20">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-[300px] flex-none">
             <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl mb-6 bg-white/5">
                {person.profile_path ? (
                  <img src={`${IMAGE_BASE_URL_W500}${person.profile_path}`} className="w-full h-full object-cover" alt={person.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><User className="w-20 h-20 text-gray-500" /></div>
                )}
             </div>
             <h2 className="text-xl font-bold mb-4 font-display">Personal Info</h2>
             <div className="space-y-4 text-sm">
                <div><strong className="block text-gray-400">Known For</strong><br/>{person.known_for_department}</div>
                <div><strong className="block text-gray-400">Gender</strong><br/>{person.gender === 1 ? 'Female' : person.gender === 2 ? 'Male' : 'Other'}</div>
                {person.birthday && <div><strong className="block text-gray-400">Birthday</strong><br/>{person.birthday}</div>}
                {person.place_of_birth && <div><strong className="block text-gray-400">Place of Birth</strong><br/>{person.place_of_birth}</div>}
             </div>
          </div>
          
          <div className="flex-1">
             <h1 className="text-4xl md:text-6xl font-black font-display mb-6">{person.name}</h1>
             
             {person.biography && (
               <div className="mb-12">
                 <h3 className="text-xl font-bold mb-4 font-display">Biography</h3>
                 <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm md:text-base">{person.biography}</p>
               </div>
             )}

             {knownFor.length > 0 && (
               <div>
                 <h3 className="text-xl font-bold mb-6 font-display">Known For</h3>
                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                   {knownFor.map(movie => (
                     <div key={movie.id} className="cursor-pointer group" onClick={() => navigate(`/title/${movie.media_type || 'movie'}/${movie.id}`)}>
                        <div className="aspect-[2/3] rounded-lg overflow-hidden border border-white/10 mb-2 shadow-lg">
                           <img src={`${IMAGE_BASE_URL_W500}${movie.poster_path}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={movie.title || movie.name} />
                        </div>
                        <h4 className="text-sm font-bold truncate group-hover:text-netflix-red transition-colors">{movie.title || movie.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{movie.character}</p>
                     </div>
                   ))}
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>
      <Footer />
    </motion.div>
  );
}

function CompanyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [movies, setMovies] = useState([]);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchData() {
      try {
        const compRes = await fetch(`${BASE_URL}/company/${id}?api_key=${API_KEY}`).then(r => r.json());
        setCompany(compRes);
        
        const movRes = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_companies=${id}&sort_by=popularity.desc`).then(r => r.json());
        setMovies(movRes.results || []);
      } catch(e) {
        console.error("Failed to fetch company", e);
      }
    }
    fetchData();
  }, [id]);

  if (!company) return (
    <div className="min-h-screen bg-shows-dark text-white pt-32 px-4 flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen bg-shows-dark text-white font-sans relative pb-20"
    >
      <Navbar activeTab="" setActiveTab={() => navigate('/')} />
      
      <div className="container mx-auto px-4 md:px-12 pt-32">
         <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-12 border-b border-white/10 pb-12">
            {company.logo_path ? (
               <div className="bg-white p-6 rounded-2xl shadow-xl w-48 md:w-64 h-48 md:h-64 flex items-center justify-center flex-none">
                 <img src={`${IMAGE_BASE_URL_W500}${company.logo_path}`} className="max-w-[80%] max-h-[80%] object-contain" alt={company.name} />
               </div>
            ) : (
               <div className="w-48 md:w-64 h-48 md:h-64 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-xl flex-none">
                  <span className="text-gray-500 font-bold text-xl">{company.name}</span>
               </div>
            )}
            <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
               <h1 className="text-4xl md:text-6xl font-black font-display mb-4 tracking-tight">{company.name}</h1>
               <p className="text-gray-400 font-bold tracking-widest text-sm uppercase bg-white/10 px-4 py-1.5 rounded-full w-max mx-auto md:mx-0">Production Studio</p>
               {company.headquarters && <p className="text-gray-300 text-base mt-6 flex items-center justify-center md:justify-start"><span className="text-gray-500 mr-2">📍</span> {company.headquarters}</p>}
               {company.homepage && <a href={company.homepage} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-400 font-medium mt-3 inline-block">Visit Official Website ↗</a>}
            </div>
         </div>
         
         <h2 className="text-2xl md:text-3xl font-bold font-display mb-8">Produced by {company.name}</h2>
         {movies.length > 0 ? (
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
             {movies.map(movie => (
               <div key={movie.id} className="cursor-pointer group relative rounded-xl overflow-hidden aspect-[2/3] border border-white/10 shadow-lg hover:shadow-2xl transition-all hover:scale-105" onClick={() => navigate(`/title/movie/${movie.id}`)}>
                  <img src={`${IMAGE_BASE_URL_W500}${movie.poster_path}`} className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-500" alt={movie.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                     <p className="text-white font-bold text-sm line-clamp-2">{movie.title}</p>
                     {movie.release_date && <p className="text-gray-400 text-[10px] mt-1 font-medium">{movie.release_date.substring(0,4)}</p>}
                  </div>
               </div>
             ))}
           </div>
         ) : (
           <p className="text-gray-500 text-lg">No movies found for this studio.</p>
         )}
      </div>
      <Footer />
    </motion.div>
  );
}

function LiveTvPage() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChannel, setActiveChannel] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchChannels() {
      try {
        let res = await fetch('/combined_playlist.m3u');
        if (!res.ok) {
           res = await fetch('https://raw.githubusercontent.com/FunctionError/PiratesTv/main/combined_playlist.m3u');
        }
        if (!res.ok) throw new Error('Failed to fetch playlist');
        const text = await res.text();
        
        const channelsData = [];
        const lines = text.split('\n');
        let currentChannel = {};

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.startsWith('#EXTINF:')) {
            currentChannel = {};
            const logoMatch = line.match(/tvg-logo="([^"]*)"/);
            const groupMatch = line.match(/group-title="([^"]*)"/);
            const nameMatch = line.split(',');
            
            currentChannel.logo = logoMatch ? logoMatch[1] : '';
            currentChannel.group = groupMatch ? groupMatch[1] : 'Uncategorized';
            if (!currentChannel.group || currentChannel.group === "") currentChannel.group = 'Uncategorized';
            
            currentChannel.name = nameMatch.length > 1 ? nameMatch.slice(1).join(',').trim() : 'Unknown Channel';
          } else if (line.startsWith('http')) {
            currentChannel.url = line;
            const uniqueString = (currentChannel.name || '') + currentChannel.url;
            let hash = 0;
            for (let j = 0; j < uniqueString.length; j++) {
              hash = ((hash << 5) - hash) + uniqueString.charCodeAt(j);
              hash |= 0;
            }
            currentChannel.id = Math.abs(hash).toString(36);
            channelsData.push(currentChannel);
            currentChannel = {};
          }
        }
        
        setChannels(channelsData);
        if (channelsData.length > 0) setActiveChannel(channelsData[0]);
      } catch (err) {
        console.error("Failed to parse local m3u:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchChannels();
  }, []);

  const groups = ['All', ...new Set(channels.map(c => c.group).filter(Boolean))].sort();

  const filteredChannels = channels.filter(c => {
    const safeName = c.name || '';
    const safeGroup = c.group || '';
    const matchesSearch = safeName.toLowerCase().includes(searchQuery.toLowerCase()) || safeGroup.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroup === 'All' || safeGroup === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  // Automatically update the video player if the active channel is filtered out
  useEffect(() => {
    if (filteredChannels.length > 0) {
      const isStillVisible = filteredChannels.some(c => c.id === activeChannel?.id);
      if (!isStillVisible) {
        setActiveChannel(filteredChannels[0]);
      }
    } else {
      if (activeChannel) setActiveChannel(null);
    }
  }, [searchQuery, selectedGroup, channels]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white pt-32 px-4 flex items-center justify-center">
         <div className="w-12 h-12 border-4 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-[#0a0a0c] text-white font-sans flex flex-col h-screen overflow-hidden">
      <Navbar activeTab="Live TV" setActiveTab={() => {}} onSearch={setSearchQuery} mobileSearchOpen={mobileSearchOpen} toggleMobileSearch={() => setMobileSearchOpen(!mobileSearchOpen)} />
      
      {/* Inline Player Section */}
      <div className="w-full flex-none bg-black pt-20 pb-4 h-[45vh] md:h-[55vh] relative border-b border-white/10 shadow-2xl z-10">
         {activeChannel ? (
           <div className="w-full h-full max-w-7xl mx-auto relative flex items-center justify-center group">
              <CustomPlayer src={activeChannel.url} type="m3u8" className="w-full h-full object-contain bg-black" autoPlay controls />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg flex items-center space-x-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                 {activeChannel.logo ? (
                    <img src={activeChannel.logo} className="h-8 w-auto object-contain max-w-[80px]" alt="logo" onError={(e) => e.target.style.display = 'none'} />
                 ) : (
                    <Radio className="w-6 h-6 text-white" />
                 )}
                 <div>
                   <p className="font-bold text-white leading-tight">{activeChannel.name}</p>
                   <p className="text-xs text-[var(--accent-color)] font-bold uppercase tracking-wider flex items-center mt-0.5"><span className="w-2 h-2 rounded-full bg-[var(--accent-color)] mr-1.5 animate-pulse"></span> LIVE</p>
                 </div>
              </div>
           </div>
         ) : (
           <div className="w-full h-full flex items-center justify-center text-gray-500 flex-col">
              <Radio className="w-12 h-12 mb-4 opacity-50" />
              <p>Select a channel to play</p>
           </div>
         )}
      </div>

      {/* Guide Section */}
      <div className="flex-1 overflow-hidden flex flex-col bg-[#0a0a0c]">
         <div className="p-4 border-b border-white/5 flex items-center justify-start flex-none z-10 bg-[#0a0a0c]">
            <div className="flex space-x-2 overflow-x-auto w-full scrollbar-hide pb-2 md:pb-0">
              {groups.map(g => (
                <button key={g} onClick={() => setSelectedGroup(g)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${selectedGroup === g ? 'bg-white text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
                  {g}
                </button>
              ))}
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 pb-20 md:pb-0">
               {filteredChannels.map(channel => (
                 <div key={channel.id} onClick={() => setActiveChannel(channel)} className={`cursor-pointer rounded-xl overflow-hidden border transition-all duration-300 ${activeChannel?.id === channel.id ? 'border-[var(--accent-color)] ring-2 ring-[var(--accent-color)]/50 scale-105 bg-[var(--accent-color)]/10' : 'border-white/10 hover:border-white/30 hover:bg-white/5 bg-white/5'}`}>
                    <div className="aspect-[4/3] flex items-center justify-center p-4 bg-black/40">
                       {channel.logo ? (
                         <img src={channel.logo} className="max-w-full max-h-full object-contain filter drop-shadow-md" alt={channel.name || 'Channel'} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                       ) : null}
                       <div className="w-full h-full flex flex-col items-center justify-center text-gray-500" style={{ display: channel.logo ? 'none' : 'flex' }}>
                         <Radio className="w-8 h-8 mb-2 opacity-50" />
                         <span className="text-[10px] uppercase font-bold tracking-wider text-center px-2">{(channel.name || 'Unknown').substring(0, 15)}</span>
                       </div>
                    </div>
                    <div className="p-3 bg-black/60 border-t border-white/5 flex flex-col justify-between min-h-[60px]">
                       <p className="text-white text-xs font-bold line-clamp-1 leading-snug">{channel.name || 'Unknown Channel'}</p>
                       <p className="text-gray-500 text-[9px] uppercase tracking-wider mt-1 line-clamp-1">{channel.group || 'Uncategorized'}</p>
                    </div>
                 </div>
               ))}
            </div>
            {filteredChannels.length === 0 && (
              <div className="text-center text-gray-500 mt-12 py-12 flex flex-col items-center">
                 <Radio className="w-16 h-16 mb-4 opacity-20" />
                 <p>No channels found matching your criteria.</p>
              </div>
            )}
         </div>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [showLoader, setShowLoader] = useState(true);
  const [fadeLoader, setFadeLoader] = useState(false);
  const location = useLocation();
  const { currentUser } = useAuth();

  useEffect(() => {
    // The animation takes about 4.5 seconds to complete based on CSS.
    const fadeTimer = setTimeout(() => setFadeLoader(true), 3800);
    const removeTimer = setTimeout(() => setShowLoader(false), 4500);
    
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, []);

  return (
    <>
      {showLoader && (
        <div className={`fixed inset-0 z-[9999] bg-black transition-opacity duration-700 ${fadeLoader ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <NetflixIntro />
        </div>
      )}
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={currentUser ? <Dashboard /> : <OnboardingPage />} />
          <Route path="/login" element={!currentUser ? <AuthPage /> : <Navigate to="/" />} />
          <Route path="/watchlist" element={currentUser ? <WatchlistPage /> : <Navigate to="/login" />} />
          <Route path="/title/:type/:id" element={<TitlePage />} />
          <Route path="/watch/:type/:id" element={currentUser ? <WatchPage /> : <Navigate to="/login" />} />
          <Route path="/category/:title" element={<CategoryPage />} />
          <Route path="/profile" element={currentUser ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path="/person/:id" element={<PersonPage />} />
          <Route path="/company/:id" element={<CompanyPage />} />
          <Route path="/live" element={<LiveTvPage />} />
          <Route path="*" element={
            <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center pt-32">
              <h1 className="text-6xl font-black mb-4">404</h1>
              <p className="text-gray-400 mb-8">Oops! Page not found.</p>
              <Link to="/" className="bg-netflix-red text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition shadow-[0_0_20px_rgba(229,9,20,0.4)]">
                Return Home
              </Link>
            </div>
          } />
        </Routes>
        <OfflineToast />
      </AnimatePresence>
    </>
  );
}
