import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const Scene1Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = spring({
    frame,
    fps,
    config: { damping: 100 },
  });

  const scale = 1.2 - (frame / (fps * 5)) * 0.2; // Slow zoom out

  return (
    <AbsoluteFill className="justify-center items-center">
      <h1 
        style={{ opacity, transform: `scale(${scale})` }}
        className="text-[#E50914] text-9xl font-bold tracking-tighter"
      >
        Netphlixx
      </h1>
    </AbsoluteFill>
  );
};
