import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { RowCard } from './RowCard';
import { getMediaType } from '../utils/media';

export default function Row({ title, icon: Icon, fetchUrl, isLargeRow, isTop10, moviesArray, onRemove, filterUpcoming, filterReleased }) {
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
    const abortController = new AbortController();
    async function fetchData() {
      if (!fetchUrl) return;
      try {
        const request = await fetch(fetchUrl, { signal: abortController.signal }).then(res => res.json());
        let results = request.results || [];
        const now = new Date();
        if (filterUpcoming) {
          results = results.filter(m => new Date(m.release_date || m.first_air_date) > now);
        }
        if (filterReleased) {
          results = results.filter(m => new Date(m.release_date || m.first_air_date) <= now);
        }
        setMovies(results);
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    return () => abortController.abort();
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
        <div className="w-48 h-6 rounded shimmer mb-3 z-20 relative"></div>
        <div className="flex space-x-2 overflow-hidden py-4">
           {[...Array(6)].map((_, i) => (
             <div key={i} className={`flex-none rounded ${isLargeRow ? 'w-32 md:w-48 aspect-[2/3]' : 'w-44 md:w-60 aspect-video'} flex items-center relative z-10`}>
               {isTop10 && <span className="absolute left-[-20px] bottom-[-30px] text-[150px] md:text-[220px] font-black leading-none select-none tracking-tighter z-0 opacity-50" style={{ WebkitTextStroke: '2px #333', color: 'transparent' }}>{i + 1}</span>}
               <div className="w-full h-full shimmer rounded-lg z-10 opacity-70"></div>
             </div>
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
      variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } } }}
      className="pl-4 md:pl-12 my-4 md:my-6 group relative z-20"
    >
      {isTop10 ? (
        <div className="flex items-center mb-6 md:mb-10 cursor-pointer w-max pl-4 md:pl-8 group/title">
          <h2 className="text-7xl md:text-[140px] font-bold text-transparent leading-none tracking-tighter" style={{ WebkitTextStroke: '1px #555' }}>
            TOP 10
          </h2>
          <div className="ml-4 md:ml-6 flex flex-col text-sm md:text-2xl tracking-[0.4em] text-gray-300 font-light uppercase mt-2 md:mt-4">
            <span>{title.toLowerCase().includes('shows') ? 'SHOWS' : 'MOVIES'}</span>
            <span>TODAY</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between mb-4 md:mb-6 pr-4 md:pr-12 group/title">
          <div className="flex items-center cursor-pointer">
            {Icon && <Icon className="w-6 h-6 md:w-8 md:h-8 mr-3 text-white" />}
            <h2 className="text-gray-100 text-xl md:text-3xl font-display font-bold tracking-tight">{title}</h2>
            {!moviesArray && (
              <span 
                onClick={() => navigate(`/category/${encodeURIComponent(title)}`, { state: { fetchUrl } })}
                className="text-blue-500 font-medium text-sm ml-4 mt-1 hover:text-blue-400 transition hidden md:block min-h-[44px] min-w-[44px] flex items-center"
              >
                View all
              </span>
            )}
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <button onClick={() => handleScroll('left')} className="p-2 min-h-[44px] min-w-[44px] bg-transparent hover:bg-white/10 rounded-full transition"><ChevronLeft className="w-6 h-6 text-gray-400 hover:text-white" /></button>
            <button onClick={() => handleScroll('right')} className="p-2 min-h-[44px] min-w-[44px] bg-transparent hover:bg-white/10 rounded-full transition"><ChevronRight className="w-6 h-6 text-gray-400 hover:text-white" /></button>
          </div>
        </div>
      )}

      <div className="relative">
        <div 
          ref={rowRef}
          onKeyDown={(e) => {
             if (e.key === 'ArrowRight') {
                e.preventDefault();
                handleScroll('right');
             } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                handleScroll('left');
             }
          }}
          className="flex overflow-x-scroll md:overflow-x-hidden md:hover:overflow-x-scroll scrollbar-hide py-6 md:py-8 pr-4 md:pr-12 space-x-4 -ml-1 snap-x snap-mandatory focus:outline-none"
          tabIndex={-1}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {movies.slice(0, isTop10 ? 10 : movies.length).map((movie, index) => (
            ((isLargeRow && movie.poster_path) || (!isLargeRow && movie.backdrop_path)) && (
              <motion.div 
                key={movie.id} 
                className={`relative flex items-center group/card-wrapper ${isTop10 ? 'pl-8 md:pl-20' : ''}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
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
              </motion.div>
            )
          ))}
        </div>
      </div>
    </motion.div>
  );
}
