import React from "react";
import { Composition } from "remotion";
import { Hello } from "./Hello";
import { Test3D } from "./Test3D";
import { Lightning, DURATION, TAIL } from "./lightning/Lightning";
import { LightningCover } from "./lightning/Cover";
import { Rainbow, DURATION as RB_DUR, TAIL as RB_TAIL } from "./rainbow/Rainbow";

// Every «إيه الحكاية؟» video is vertical 1080×1920 at 60 fps.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Hello" component={Hello} durationInFrames={180} fps={60} width={1080} height={1920} />
    <Composition id="Test3D" component={Test3D} durationInFrames={120} fps={60} width={1080} height={1920} />
    <Composition id="Lightning" component={Lightning} durationInFrames={Math.ceil((DURATION + TAIL) * 60)} fps={60} width={1080} height={1920} />
    <Composition id="LightningCover" component={LightningCover} durationInFrames={1} fps={60} width={1080} height={1920} />
    <Composition id="Rainbow" component={Rainbow} durationInFrames={Math.ceil((RB_DUR + RB_TAIL) * 60)} fps={60} width={1080} height={1920} />
  </>
);
