import React, { useState, useEffect, useRef } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { motion } from 'framer-motion';
import { Star, ChevronRight, X } from 'lucide-react';
import MagneticButton from './MagneticButton';
import { getMediaType } from '../utils/media';
import { API_KEY, BASE_URL, IMAGE_BASE_URL, IMAGE_BASE_URL_W500 } from '../utils/constants';

export const RowCard = React.memo(function RowCard({ movie, isLargeRow, isTop10, onNavigate, onRemove }) {
  const [isHovered, setIsHovered] = useState(false);
  const [trailer, setTrailer] = useState(null);
  const cardRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onNavigate(movie, 'play');
    }
  };

  useEffect(() => {
    let timeout;
    let abortController;
    if (isHovered) {
      abortController = new AbortController();
      timeout = setTimeout(async () => {
         try {
           const type = getMediaType(movie);
           const res = await fetch(`${BASE_URL}/${type}/${movie.id}/videos?api_key=${API_KEY}`, { signal: abortController.signal }).then(r => r.json());
           const t = res.results?.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
           if (t) setTrailer(t.key);
         } catch (e) {
           if (e.name !== 'AbortError') console.log('Error fetching trailer for row card', e);
         }
      }, 700);
    } else {
      setTrailer(null);
    }
    return () => {
      clearTimeout(timeout);
      if (abortController) abortController.abort();
    };
  }, [isHovered, movie.id]);

  const ratingColor = movie.vote_average >= 8 ? 'ring-green-400' : movie.vote_average >= 6 ? 'ring-yellow-400' : 'ring-red-400';

  return (
    <motion.div 
      ref={cardRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      whileHover={{ scale: 1.05, zIndex: 50 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`group/card relative flex-none cursor-pointer rounded-md overflow-visible bg-transparent focus:ring-4 focus:ring-white outline-none ${
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
          <LazyLoadImage effect="blur"
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

        {isLargeRow && !isTop10 && (
          <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-center py-1 font-semibold text-[9px] uppercase tracking-wider flex items-center justify-center z-20 shadow-lg shadow-black/50">
            Most Viewed on NETPHLIX <Star className="w-2.5 h-2.5 ml-1 fill-white" />
          </div>
        )}

        {onRemove && (
          <MagneticButton 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute top-2 right-2 min-w-[44px] min-h-[44px] bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition border border-white/20 z-50"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </MagneticButton>
        )}

        {/* Continue watching progress bar */}
        {movie.progress && (
           <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600 z-50">
              <div className="h-full bg-netflix-red" style={{ width: `${movie.progress}%` }}></div>
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
            <MagneticButton className="w-full bg-white/10 hover:bg-netflix-red text-white text-xs font-bold py-2 min-h-[44px] rounded-full transition-colors flex items-center justify-center">
              <span className="pointer-events-none flex items-center">Details <ChevronRight className="w-4 h-4 ml-1" /></span>
            </MagneticButton>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
});
