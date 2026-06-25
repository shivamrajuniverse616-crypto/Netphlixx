import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const Scene4Flexibility: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 100 },
    from: 0.2,
    to: 1,
  });

  const textOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="justify-center items-center bg-black">
      <div 
        style={{ transform: `scale(${scale})` }}
        className="w-[800px] h-[500px] border-[16px] border-gray-800 rounded-[3rem] shadow-[0_0_50px_rgba(255,255,255,0.1)] flex justify-center items-center relative"
      >
        <h2 
          style={{ opacity: textOpacity }}
          className="text-white text-5xl font-bold tracking-tight"
        >
          Anywhere. Anytime.
        </h2>
      </div>
    </AbsoluteFill>
  );
};
