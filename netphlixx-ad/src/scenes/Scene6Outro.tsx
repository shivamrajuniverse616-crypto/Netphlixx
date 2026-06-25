import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const Scene6Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({
    frame,
    fps,
    config: { damping: 15 },
    from: 2,
    to: 1,
  });

  const logoOpacity = interpolate(frame, [0, 15], [0, 1]);
  
  const ctaOpacity = interpolate(frame, [30, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ctaY = interpolate(frame, [30, 45], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="justify-center items-center bg-black flex flex-col gap-12">
      <h1 
        style={{ transform: `scale(${logoScale})`, opacity: logoOpacity }}
        className="text-[#E50914] text-9xl font-bold tracking-tighter"
      >
        Netphlixx
      </h1>
      <p 
        style={{ opacity: ctaOpacity, transform: `translateY(${ctaY}px)` }}
        className="text-gray-400 text-3xl font-medium"
      >
        Start your free trial today.
      </p>
    </AbsoluteFill>
  );
};
