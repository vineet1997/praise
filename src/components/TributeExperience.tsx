import { useRef } from "react";
import { tribute } from "../content/tribute";
import { useTributeTimeline } from "../hooks/useTributeTimeline";
import { AccessibleTribute } from "./AccessibleTribute";
import { CosmicBackdrop } from "./CosmicBackdrop";
import { FinalDedication } from "./FinalDedication";
import { FloatingWordField } from "./FloatingWordField";
import { PoemStage } from "./PoemStage";

export function TributeExperience() {
  const root = useRef<HTMLElement>(null);
  useTributeTimeline({ scope: root });

  const replay = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="tribute-experience" ref={root}>
      <AccessibleTribute />
      <section className="visual-stage" aria-label={`A tribute to ${tribute.recipient}`}>
        <CosmicBackdrop />
        <FloatingWordField />
        <div className="opening" aria-hidden="true">
          <p className="opening-salutation">{tribute.openingSalutation}</p>
          <p className="opening-message">{tribute.openingMessage}</p>
          <p className="scroll-instruction">
            {tribute.scrollInstruction}
            <span className="scroll-instruction__line" aria-hidden="true" />
          </p>
        </div>
        <PoemStage />
        <div className="convergence-cloud" aria-hidden="true" />
        <FinalDedication onReplay={replay} />
        <div className="grain" aria-hidden="true" />
        <div className="vignette" aria-hidden="true" />
      </section>
    </main>
  );
}
