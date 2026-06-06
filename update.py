import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Floating Hover Modal for RowCard
# Import createPortal
if 'createPortal' not in content:
    content = content.replace("import React, { useState, useEffect, useRef } from 'react';", "import React, { useState, useEffect, useRef } from 'react';\nimport { createPortal } from 'react-dom';")

# Add HoverPortal component at the top of the file
portal_code = """
function HoverPortal({ children, coordinates, isHovered, onMouseLeave }) {
  if (!isHovered || !coordinates) return null;
  return createPortal(
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1.15 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="fixed z-[999] rounded-md shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-[#141414] overflow-hidden"
      style={{
        top: coordinates.top - 20,
        left: coordinates.left - 20,
        width: coordinates.width + 40,
        height: 'auto',
      }}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </motion.div>,
    document.body
  );
}
"""
if 'HoverPortal' not in content:
    content = content.replace('function getMediaType(item) {', portal_code + '\nfunction getMediaType(item) {')

# Modify RowCard to use HoverPortal
rowcard_original = re.search(r'const RowCard = React\.memo\(function RowCard\(.*?\}\);', content, re.DOTALL)
if rowcard_original:
    rowcard_new = """const RowCard = React.memo(function RowCard({ movie, isLargeRow, isTop10, onNavigate, onRemove }) {
  const [isHovered, setIsHovered] = useState(false);
  const [trailer, setTrailer] = useState(null);
  const cardRef = useRef(null);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    let timeout;
    let abortController;
    if (isHovered) {
      if (cardRef.current) {
         setCoords(cardRef.current.getBoundingClientRect());
      }
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
      setCoords(null);
    }
    return () => {
      clearTimeout(timeout);
      if (abortController) abortController.abort();
    };
  }, [isHovered, movie.id]);

  const ratingColor = movie.vote_average >= 8 ? 'ring-green-400' : movie.vote_average >= 6 ? 'ring-yellow-400' : 'ring-red-400';

  const cardContent = (inPortal = false) => (
    <>
      <div className={`relative w-full ${isLargeRow && !inPortal ? 'aspect-[2/3]' : 'aspect-video'} rounded-lg overflow-hidden transition-all`}>
        {inPortal && trailer && !isLargeRow ? (
          <iframe
            src={`https://www.youtube.com/embed/${trailer}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${trailer}`}
            className="w-full h-full object-cover scale-[1.3] pointer-events-none"
            allow="autoplay; encrypted-media"
          />
        ) : (
          <LazyLoadImage effect="blur"
            src={`${isLargeRow && !inPortal ? IMAGE_BASE_URL_W500 : IMAGE_BASE_URL}${isLargeRow && !inPortal ? movie.poster_path : (movie.backdrop_path || movie.poster_path)}`}
            alt={movie.title || movie.name}
            className="w-full h-full object-cover"
          />
        )}
        
        {movie.vote_average > 0 && !isTop10 && (
          <div className={`absolute top-2 left-2 w-8 h-8 rounded-full bg-[#111] flex items-center justify-center ring-2 ${ratingColor} shadow-black/50 shadow-md`}>
            <span className="text-white text-[10px] font-bold">{movie.vote_average.toFixed(1)}</span>
          </div>
        )}

        {isLargeRow && !isTop10 && !inPortal && (
          <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-center py-1 font-semibold text-[9px] uppercase tracking-wider flex items-center justify-center z-20 shadow-lg shadow-black/50">
            Most Viewed on NETPHLIX <Star className="w-2.5 h-2.5 ml-1 fill-white" />
          </div>
        )}

        {onRemove && (
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition border border-white/20 z-50"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        {/* Continue watching progress bar */}
        {movie.progress && (
           <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600 z-50">
              <div className="h-full bg-netflix-red" style={{ width: `${movie.progress}%` }}></div>
           </div>
        )}
      </div>

      {(!isTop10 || inPortal) && (
        <div className={`flex flex-col px-2 ${inPortal ? 'py-3' : 'pt-1'} bg-[#141414]`}>
          <h3 className="text-white font-bold text-sm md:text-base line-clamp-1">
            {movie.title || movie.name}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center text-xs md:text-sm text-gray-400 space-x-2 font-semibold">
              <span className="text-green-500">{movie.vote_average?.toFixed(1)} Match</span>
              <span className="border border-gray-600 px-1 rounded-sm text-[10px]">HD</span>
              <span>{movie.release_date?.substring(0,4) || movie.first_air_date?.substring(0,4)}</span>
            </div>
          </div>
          
          {inPortal && (
             <div className="flex space-x-2 mt-3">
                <button onClick={() => onNavigate(movie, 'play')} className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-300 transition"><Play className="w-3 h-3 text-black fill-black ml-0.5" /></button>
                <button onClick={() => onNavigate(movie, 'info')} className="w-8 h-8 border border-gray-500 rounded-full flex items-center justify-center hover:border-white transition"><ChevronDown className="w-4 h-4 text-white" /></button>
             </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <>
    <div 
      ref={cardRef}
      className={`relative flex-none cursor-pointer rounded-md bg-transparent ${
        isLargeRow ? 'w-32 md:w-48' : 'w-44 md:w-60'
      } z-10 origin-center snap-center flex flex-col gap-2`}
      onClick={() => onNavigate(movie, 'info')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {cardContent()}
    </div>
    <AnimatePresence>
      {isHovered && coords && !isTop10 && (
        <HoverPortal coordinates={coords} isHovered={isHovered} onMouseLeave={() => setIsHovered(false)}>
           <div className="cursor-pointer" onClick={() => onNavigate(movie, 'info')}>
              {cardContent(true)}
           </div>
        </HoverPortal>
      )}
    </AnimatePresence>
    </>
  );
});"""
    content = content.replace(rowcard_original.group(0), rowcard_new)

# 2. Rich Skeleton Loaders
skeleton_orig = """  if (isLoading) {
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
  }"""
skeleton_new = """  if (isLoading) {
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
  }"""
if skeleton_orig in content:
    content = content.replace(skeleton_orig, skeleton_new)


with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Applied Features 1 and 4 successfully')
