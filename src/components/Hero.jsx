import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import { FaPlay as Play, FaVolumeHigh as Volume2, FaVolumeXmark as VolumeX } from 'react-icons/fa6';
import MagneticButton from './MagneticButton';
import { getMediaType } from '../utils/media';
import { API_KEY, BASE_URL, IMAGE_BASE_URL_W1280, IMAGE_BASE_URL_W500 } from '../utils/constants';

export default function Hero({ movie, trending = [], onSelect }) {
  const [trailerKey, setTrailerKey] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [videoEnded, setVideoEnded] = useState(false);
  const [details, setDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!movie) return;
    setVideoEnded(false);
    
    async function fetchTrailer() {
      const mediaType = getMediaType(movie);
      
      try {
        const detailsRes = await fetch(`${BASE_URL}/${mediaType}/${movie.id}?api_key=${API_KEY}`).then(r => r.json());
        setDetails(detailsRes);
      } catch(e) { console.error(e); }

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

  const isTV = getMediaType(movie) === 'tv';

  const onPlay = () => {
    navigate(`/watch/${isTV ? 'tv' : 'movie'}/${movie.id}`);
  };

  const onInfo = () => {
    navigate(`/title/${isTV ? 'tv' : 'movie'}/${movie.id}`, { state: { movie } });
  };

  return (
    <header className="h-[65vh] md:h-[85vh] relative text-white bg-[#141414] overflow-hidden">
      {/* Static Color Gradient Overlay */}
      <div 
        className="absolute inset-0 w-full h-full z-0 transition-colors duration-1000 opacity-60" 
        style={{ background: `radial-gradient(circle at 70% 30%, rgba(20,20,20,0.8) 0%, transparent 60%)` }}
      ></div>

      <div className="absolute inset-0 w-full h-full z-0">
        <div className={`w-full h-full animate-in fade-in duration-1000`}>
           <img src={`${IMAGE_BASE_URL_W1280}${movie?.backdrop_path || movie?.poster_path}`} alt="Hero Banner" className="w-full h-full object-cover object-center md:object-top" />
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-10 hidden md:block"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent z-10 md:via-[#141414]/20"></div>
      
      <AnimatePresence mode="wait">
        <motion.div 
          key={movie?.id}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute inset-y-0 left-0 px-4 md:ml-12 w-full md:max-w-2xl z-20 flex flex-col items-center md:items-start justify-center text-center md:text-left pt-20 md:pt-24 pb-12"
        >
          <div className="flex items-center justify-center md:justify-start space-x-2 mb-2 md:mb-4">
            <div className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 bg-[#E50914] text-white font-black text-[10px] md:text-xs rounded-sm shadow-lg">1S</div>
            <span className="text-gray-300 text-[10px] md:text-xs font-bold tracking-[0.2em]">{isTV ? 'SERIES' : 'FILM'}</span>
          </div>
        
        <h1 className="text-5xl md:text-[75px] font-black font-sans uppercase text-white tracking-tighter mb-4 drop-shadow-2xl leading-[0.9] transition-all duration-700">
          {movie?.title || movie?.name || movie?.original_name}
        </h1>
        
        <div className="hidden md:flex items-center space-x-3 mb-6">
           <div className="flex items-center space-x-1.5 bg-[#222]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-sm font-medium">
             <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
             <span className="text-white">{movie?.vote_average ? movie.vote_average.toFixed(1) : 'NR'}</span>
           </div>
           {details?.runtime && (
             <div className="bg-[#222]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-sm font-medium text-white">
               {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
             </div>
           )}
           {details?.genres?.[0] && (
             <div className="bg-[#222]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-sm font-medium text-white">
               {details.genres[0].name}
             </div>
           )}
        </div>

        <div className="hidden md:block mb-8 max-w-xl">
          <p className="text-sm md:text-base text-gray-200 font-medium drop-shadow-2xl leading-snug line-clamp-3">
            {movie?.overview}
          </p>
        </div>
        
        <div className="flex space-x-4 w-full md:w-auto justify-center md:justify-start">
          <MagneticButton 
            onClick={onPlay}
            className="min-w-[44px] min-h-[44px] px-6 md:px-8 py-3 bg-[#0A4191] rounded-full flex items-center justify-center hover:bg-blue-600 transition-all shadow-xl"
          >
            <Play className="w-5 h-5 md:w-6 md:h-6 text-white fill-white mr-2 pointer-events-none" />
            <span className="font-bold pointer-events-none">Play Now</span>
          </MagneticButton>
          <MagneticButton 
            onClick={onInfo}
            className="flex items-center px-6 md:px-8 py-3 min-w-[44px] min-h-[44px] bg-[#0A4191]/40 text-white font-medium rounded-full border border-[#0A4191] hover:bg-[#0A4191]/60 transition-all backdrop-blur-md shadow-lg"
          >
             <div className="w-4 h-4 border-2 border-white rounded-full flex items-center justify-center mr-2 pointer-events-none"><span className="text-[10px] font-bold">i</span></div>
             <span className="pointer-events-none font-bold">See More</span>
          </MagneticButton>
        </div>
        </motion.div>
      </AnimatePresence>

      {trending?.length > 0 && (
         <div className="absolute bottom-6 md:bottom-8 right-4 md:right-8 z-40 hidden md:flex space-x-3 overflow-x-auto scrollbar-hide max-w-[40vw] p-2">
            {trending.slice(0, 6).map(m => (
               <div 
                 key={m.id} 
                 onClick={() => onSelect && onSelect(m)}
                 className={`flex-none w-32 aspect-video rounded-lg cursor-pointer overflow-hidden transition-all duration-300 shadow-xl border-2 ${movie?.id === m.id ? 'border-blue-500 scale-105 brightness-110' : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'}`}
               >
                  <img src={`${IMAGE_BASE_URL_W500}${m.backdrop_path}`} className="w-full h-full object-cover pointer-events-none" />
               </div>
            ))}
         </div>
      )}

      {trailerKey && !videoEnded && (
        <div className="hidden md:flex absolute bottom-32 right-12 z-30 items-center space-x-4">
           <button 
             onClick={() => setIsMuted(!isMuted)}
             className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-white/50 bg-black/20 backdrop-blur-md flex items-center justify-center hover:bg-white/10 transition-colors text-white"
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
