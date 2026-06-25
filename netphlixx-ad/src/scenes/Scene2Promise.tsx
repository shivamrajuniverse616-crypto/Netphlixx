import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const Scene2Promise: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = spring({
    frame,
    fps,
    config: { damping: 100 },
  });

  const textY = interpolate(frame, [0, fps], [20, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="justify-center items-center">
      <h2 
        style={{ opacity, transform: `translateY(${textY}px)` }}
        className="text-white text-6xl font-semibold tracking-tight relative overflow-hidden"
      >
        <span className="relative z-10">Endless Entertainment.</span>
        <div 
          className="absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
          style={{
            transform: `translateX(${interpolate(frame, [20, 60], [-100, 100], { extrapolateRight: "clamp", extrapolateLeft: "clamp" })}%)`,
          }}
        />
      </h2>
    </AbsoluteFill>
  );
};
