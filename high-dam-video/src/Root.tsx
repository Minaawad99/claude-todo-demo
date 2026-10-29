import { Composition } from "remotion";
import { HighDam } from "./HighDam";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HighDam"
        component={HighDam}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
