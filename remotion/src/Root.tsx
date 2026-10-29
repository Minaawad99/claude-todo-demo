import React from "react";
import { Composition } from "remotion";
import { Hello } from "./Hello";

// Every «إيه الحكاية؟» video is vertical 1080×1920 at 60 fps.
export const RemotionRoot: React.FC = () => (
  <Composition id="Hello" component={Hello} durationInFrames={180} fps={60} width={1080} height={1920} />
);
