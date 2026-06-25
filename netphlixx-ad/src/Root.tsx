import "./index.css";
import { Composition } from "remotion";
import { NetphlixxAd } from "./NetphlixxAd";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="NetphlixxAd"
        component={NetphlixxAd}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
