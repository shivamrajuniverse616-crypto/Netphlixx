import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Img, staticFile } from "remotion";

export const Scene3UIShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Intro animation for the UI
  const scale = spring({
    frame,
    fps,
    config: { damping: 15, mass: 0.5 },
    from: 0.8,
    to: 1,
  });
  
  const opacity = interpolate(frame, [0, 15], [0, 1]);

  // Scrolling animation for the rows
  const scrollX1 = interpolate(frame, [0, fps * 5], [0, -400]);
  const scrollX2 = interpolate(frame, [0, fps * 5], [0, -300]);

  const localPosters = [
    staticFile("poster0.jpg"),
    staticFile("poster1.jpg"),
    staticFile("poster2.jpg"),
    staticFile("poster3.jpg"),
    staticFile("poster4.jpg"),
    staticFile("poster5.jpg"),
    staticFile("poster6.jpg"),
    staticFile("poster7.jpg"),
  ];

  return (
    <AbsoluteFill className="justify-center items-center bg-[#0a0a0a]">
      <div 
        style={{ transform: `scale(${scale})`, opacity }}
        className="w-[1200px] h-[675px] bg-[#0a0a0c] rounded-2xl border border-gray-800 shadow-2xl flex flex-col overflow-hidden relative"
      >
        {/* Detailed Navbar mimicking actual app */}
        <div className="w-full h-16 bg-gradient-to-b from-[#0a0a0c]/90 to-transparent flex items-center justify-between px-8 z-50 absolute top-0 left-0 border-b border-white/5">
          <div className="flex items-center">
            <h1 className="font-black text-3xl tracking-tight flex items-center font-display text-[#E50914]">
              NETPHLIX
            </h1>
          </div>
          
          <div className="flex-1 flex justify-center max-w-xl px-8">
            <div className="flex items-center w-full bg-[#2a2a2a] rounded-full px-4 py-2 border border-transparent">
              <span className="text-gray-400 mr-2 text-sm">🔍</span>
              <div className="bg-transparent text-gray-500 w-full text-sm">Type / to search</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-white">
            <div className="flex space-x-2 mr-4">
              {['Movies', 'TV', 'Live TV'].map(item => (
                <div key={item} className="flex items-center px-4 py-1.5 rounded-full text-xs font-semibold border border-white/10 text-gray-300">
                  {item}
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-3 ml-2">
              <div className="w-9 h-9 rounded-full border border-white/10 bg-[#2a2a2a] flex items-center justify-center">👤</div>
              <div className="w-9 h-9 rounded-full border border-transparent flex items-center justify-center">⚙️</div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="w-full h-[65%] relative shrink-0">
          <Img 
            src={staticFile("hero-poster.png")} 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/20 to-transparent" />
          <div className="absolute bottom-12 left-12">
            <h1 className="text-white text-5xl font-black mb-4 drop-shadow-lg tracking-tight">FEATURED MOVIE</h1>
            <p className="text-gray-300 max-w-md text-sm mb-6 drop-shadow-md">
              Experience the cinematic thrill. Dive into this amazing masterpiece available exclusively on Netphlix.
            </p>
            <div className="flex gap-4">
              <div className="px-6 py-2.5 bg-white text-black font-bold rounded-md flex items-center gap-2 shadow-lg">
                <span className="text-lg">▶</span> Play
              </div>
              <div className="px-6 py-2.5 bg-[#2a2a2a]/80 text-white font-bold rounded-md flex items-center gap-2 backdrop-blur-md shadow-lg border border-white/10">
                <span className="text-lg">ⓘ</span> More Info
              </div>
            </div>
          </div>
        </div>

        {/* Rows */}
        <div className="flex-1 flex flex-col gap-6 relative z-10 -mt-8 pl-12 overflow-hidden pb-8 bg-[#0a0a0c]">
          {/* Row 1 */}
          <div className="flex flex-col gap-2">
            <h2 className="text-white text-xl font-bold drop-shadow flex items-center">
              Trending Now <span className="text-gray-500 text-sm ml-2">▶</span>
            </h2>
            <div className="flex gap-3" style={{ transform: `translateX(${scrollX1}px)` }}>
              {Array.from({length: 10}).map((_, i) => (
                <Img key={i} src={localPosters[i % localPosters.length]} className="w-48 h-72 shrink-0 rounded-md shadow-[0_8px_16px_rgba(0,0,0,0.5)] border border-white/5 object-cover" />
              ))}
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex flex-col gap-2">
            <h2 className="text-white text-xl font-bold drop-shadow flex items-center">
              Only on Netphlix <span className="text-gray-500 text-sm ml-2">▶</span>
            </h2>
            <div className="flex gap-3" style={{ transform: `translateX(${scrollX2}px)` }}>
              {Array.from({length: 10}).map((_, i) => (
                <Img key={i} src={localPosters[(i + 4) % localPosters.length]} className="w-48 h-72 shrink-0 rounded-md shadow-[0_8px_16px_rgba(0,0,0,0.5)] border border-white/5 object-cover" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
