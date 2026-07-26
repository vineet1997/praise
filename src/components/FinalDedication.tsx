import { tribute } from "../content/tribute";

export function FinalDedication({ onReplay }: { onReplay: () => void }) {
  return (
    <div className="final-dedication">
      <div className="final-dedication__copy" aria-hidden="true">
        <p className="final-dedication__line">{tribute.finalLine}</p>
        <p className="final-dedication__for">{tribute.dedication}</p>
        <p className="final-dedication__signature">{tribute.signature}</p>
      </div>
      <button className="replay" type="button" onClick={onReplay}>
        <span aria-hidden="true">↺</span> Replay
      </button>
    </div>
  );
}
