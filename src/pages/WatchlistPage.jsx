import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, Play } from 'lucide-react';
import Navbar from '../App'; // We might need to extract Navbar if it's not exported, or just use a simple header. Let's assume we can reuse or just build a basic UI since Navbar is in App.jsx and not exported as a standalone component if it's inside App.jsx.
// Wait, I should probably just render a standard page layout or extract Navbar. For now I'll create the UI.

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const WatchlistPage = () => {
  const { watchlist } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pt-24 px-6 md:px-12">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <Film className="w-8 h-8 text-[var(--accent-color)]" />
          <h1 className="text-3xl font-black tracking-tight">My Watchlist</h1>
        </div>

        {watchlist && watchlist.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {watchlist.map((item) => (
              <div 
                key={`${item.type}-${item.id}`}
                onClick={() => navigate(`/title/${item.type}/${item.id}`)}
                className="group relative rounded-xl overflow-hidden cursor-pointer aspect-[2/3] bg-gray-900 shadow-lg"
              >
                <img 
                  src={item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image'} 
                  alt={item.title || item.name} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <h3 className="font-bold text-white text-sm md:text-base line-clamp-2 mb-2">
                    {item.title || item.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-[var(--accent-color)] rounded text-[10px] font-bold uppercase tracking-wider">
                      {item.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center bg-white/5 rounded-2xl border border-white/10">
            <Film className="w-16 h-16 text-gray-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-400 mb-2">Your watchlist is empty</h2>
            <p className="text-gray-500 max-w-md">
              Movies and TV shows you add to your watchlist will appear here.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-2 bg-[var(--accent-color)] rounded-lg font-bold hover:bg-red-700 transition"
            >
              Explore Titles
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;
