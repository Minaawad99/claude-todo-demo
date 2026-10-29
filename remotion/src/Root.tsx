import React from "react";
import { Composition } from "remotion";
import { Hello } from "./Hello";
import { CartoonEpisode, cartoonMetadata } from "./CartoonEpisode";

// Every «إيه الحكاية؟» video is vertical 1080×1920 at 60 fps.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Hello" component={Hello} durationInFrames={180} fps={60} width={1080} height={1920} />
    <Composition id="SpeedRadar" component={CartoonEpisode} durationInFrames={60} fps={60} width={1080} height={1920}
      defaultProps={{ slug: "speed-radar" }} calculateMetadata={cartoonMetadata} />
  </>
);
