import React from "react";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { useVideoConfig } from "remotion";
import { FactsScene } from "./scenes/FactsScene";
import { GeneratorScene } from "./scenes/GeneratorScene";
import { GridScene } from "./scenes/GridScene";
import { StorageScene } from "./scenes/StorageScene";
import { TitleScene } from "./scenes/TitleScene";
import { TurbineScene } from "./scenes/TurbineScene";

// 6 scenes = 32.5s, minus 5 half-second transitions = 30s.
export const HighDam: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <TransitionSeries name="Scenes">
      <TransitionSeries.Sequence name="Title" durationInFrames={5 * fps}>
        <TitleScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 0.5 * fps })} />
      <TransitionSeries.Sequence name="Facts" durationInFrames={5.5 * fps}>
        <FactsScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 0.5 * fps })} />
      <TransitionSeries.Sequence name="Storage" durationInFrames={5.5 * fps}>
        <StorageScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 0.5 * fps })} />
      <TransitionSeries.Sequence name="Turbine" durationInFrames={5.5 * fps}>
        <TurbineScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-left" })} timing={linearTiming({ durationInFrames: 0.5 * fps })} />
      <TransitionSeries.Sequence name="Generator" durationInFrames={5.5 * fps}>
        <GeneratorScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-left" })} timing={linearTiming({ durationInFrames: 0.5 * fps })} />
      <TransitionSeries.Sequence name="Grid" durationInFrames={5.5 * fps}>
        <GridScene />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
