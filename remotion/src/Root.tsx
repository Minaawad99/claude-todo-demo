import React from "react";
import { Composition } from "remotion";
import { Hello } from "./Hello";
import { Test3D } from "./Test3D";

// Every «إيه الحكاية؟» video is vertical 1080×1920 at 60 fps.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Hello" component={Hello} durationInFrames={180} fps={60} width={1080} height={1920} />
    <Composition id="Test3D" component={Test3D} durationInFrames={120} fps={60} width={1080} height={1920} />
  </>
);
