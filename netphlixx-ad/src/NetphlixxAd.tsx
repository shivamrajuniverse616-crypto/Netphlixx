import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { Scene1Reveal } from "./scenes/Scene1Reveal";
import { Scene2Promise } from "./scenes/Scene2Promise";
import { Scene3UIShowcase } from "./scenes/Scene3UIShowcase";
import { Scene4Flexibility } from "./scenes/Scene4Flexibility";
import { Scene5Scale } from "./scenes/Scene5Scale";
import { Scene6Outro } from "./scenes/Scene6Outro";

export const NetphlixxAd: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill className="bg-black text-white font-sans overflow-hidden">
      <Sequence from={0} durationInFrames={fps * 5}>
        <Scene1Reveal />
      </Sequence>
      <Sequence from={fps * 5} durationInFrames={fps * 5}>
        <Scene2Promise />
      </Sequence>
      <Sequence from={fps * 10} durationInFrames={fps * 5}>
        <Scene3UIShowcase />
      </Sequence>
      <Sequence from={fps * 15} durationInFrames={fps * 5}>
        <Scene4Flexibility />
      </Sequence>
      <Sequence
        from={fps * 20}
        durationInFrames={fps * 5}
        style={{
          translate: "4px 0px",
        }}
      >
        <Scene5Scale />
      </Sequence>
      <Sequence from={fps * 25} durationInFrames={fps * 5}>
        <Scene6Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
