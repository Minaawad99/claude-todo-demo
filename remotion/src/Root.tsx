import React from "react";
import { Composition } from "remotion";
import { Hello } from "./Hello";
import { Test3D } from "./Test3D";
import { Lightning, DURATION, TAIL } from "./lightning/Lightning";
import { LightningCover } from "./lightning/Cover";
import { MRI, DURATION as MRI_DUR, TAIL as MRI_TAIL } from "./mri/MRI";
import { MRICover } from "./mri/Cover";
import { RainbowCover } from "./rainbow/Cover";
import { Rainbow, RainbowStrip, STRIP_Y, DURATION as RB_DUR, TAIL as RB_TAIL } from "./rainbow/Rainbow";

// Every «إيه الحكاية؟» video is vertical 1080×1920 at 60 fps.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Hello" component={Hello} durationInFrames={180} fps={60} width={1080} height={1920} />
    <Composition id="Test3D" component={Test3D} durationInFrames={120} fps={60} width={1080} height={1920} />
    <Composition id="Lightning" component={Lightning} durationInFrames={Math.ceil((DURATION + TAIL) * 60)} fps={60} width={1080} height={1920} />
    <Composition id="LightningCover" component={LightningCover} durationInFrames={1} fps={60} width={1080} height={1920} />
    <Composition id="Rainbow" component={Rainbow} durationInFrames={Math.ceil((RB_DUR + RB_TAIL) * 60)} fps={60} width={1080} height={1920} />
    <Composition id="RainbowStrip" component={RainbowStrip} durationInFrames={Math.ceil((RB_DUR + RB_TAIL) * 60)} fps={60} width={1080} height={1920 - STRIP_Y} />
    <Composition id="RainbowCover" component={RainbowCover} durationInFrames={1} fps={60} width={1080} height={1920} />
    <Composition id="MRI" component={MRI} durationInFrames={Math.ceil((MRI_DUR + MRI_TAIL) * 60)} fps={60} width={1080} height={1920} />
    <Composition id="MRICover" component={MRICover} durationInFrames={1} fps={60} width={1080} height={1920} />
  </>
);
