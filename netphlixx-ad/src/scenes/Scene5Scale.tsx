import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Img, staticFile } from "remotion";

export const Scene5Scale: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const zoom = interpolate(frame, [0, fps * 5], [1, 1.5]);
  const opacity = interpolate(frame, [0, 15], [0, 1]);

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
    <AbsoluteFill className="justify-center items-center bg-black">
      <div 
        style={{ transform: `scale(${zoom})`, opacity }}
        className="absolute inset-0 flex flex-wrap gap-4 p-8 justify-center items-center opacity-40"
      >
        {Array.from({ length: 40 }).map((_, i) => (
          <Img 
            key={i} 
            src={localPosters[i % localPosters.length]} 
            className="w-48 h-64 rounded-lg shadow-xl object-cover" 
          />
        ))}
      </div>
      <h2 
        className="text-white text-6xl font-bold tracking-tight z-10 drop-shadow-2xl"
      >
        Your universe of stories.
      </h2>
    </AbsoluteFill>
  );
};
