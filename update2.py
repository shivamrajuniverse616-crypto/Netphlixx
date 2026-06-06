import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# CustomPlayer signature update
content = content.replace(
    'const CustomPlayer = ({ url, title, onBack, externalCaptions = [], hasNextEpisode, onNextEpisode }) => {',
    'const CustomPlayer = ({ url, title, onBack, externalCaptions = [], hasNextEpisode, onNextEpisode, onProgress }) => {'
)

# Add lastProgressUpdateRef
content = content.replace(
    'const wakeLockRef = useRef(null);',
    'const wakeLockRef = useRef(null);\n  const lastProgressUpdateRef = useRef(-1);'
)

# CustomPlayer onTimeUpdate
on_time_orig = 'onTimeUpdate={(e) => setPlayed(e.target.currentTime / e.target.duration || 0)}'
on_time_new = """onTimeUpdate={(e) => {
          const p = e.target.currentTime / e.target.duration || 0;
          setPlayed(p);
          const currentSec = Math.floor(e.target.currentTime);
          if (onProgress && currentSec % 5 === 0 && currentSec !== lastProgressUpdateRef.current) {
              lastProgressUpdateRef.current = currentSec;
              onProgress(p * 100);
          }
        }}"""
content = content.replace(on_time_orig, on_time_new)

# WatchPage CustomPlayer props update
watch_page_player = """<CustomPlayer 
                  url={nativeStreamUrl} 
                  title={`${details?.title || details?.name || 'Video'} ${type === 'tv' ? `(S${season} E${episode})` : ''}`}
                  onBack={() => navigate(-1)}
                  externalCaptions={nativeCaptions}
               />"""
watch_page_player_new = """<CustomPlayer 
                  url={nativeStreamUrl} 
                  title={`${details?.title || details?.name || 'Video'} ${type === 'tv' ? `(S${season} E${episode})` : ''}`}
                  onBack={() => navigate(-1)}
                  externalCaptions={nativeCaptions}
                  onProgress={(progress) => {
                     setWatchHistory(prev => prev.map(m => m.id === parseInt(id) ? { ...m, progress } : m));
                  }}
               />"""
content = content.replace(watch_page_player, watch_page_player_new)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Applied Feature 3 (Continue Watching progress tracking) successfully')
