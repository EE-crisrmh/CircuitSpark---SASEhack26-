import { useEffect, useRef, useState } from "react";

// Thresholds: a piece is revealed once currentStep is PAST the given step.
const REVEAL = {
  icSelected: 2,
  icPlaced: 3,
  c1: 4,
  inductor: 5,
  c2: 6,
  feedback: 7,
};

export default function SchematicView({ currentStep, completed }) {
  const [justRevealed, setJustRevealed] = useState(null);
  const prevStep = useRef(currentStep);

  const isDone = (step) => completed || currentStep > step;

  useEffect(() => {
    if (prevStep.current !== currentStep || completed) {
      setJustRevealed(currentStep - 1);
      const t = setTimeout(() => setJustRevealed(null), 1400);
      prevStep.current = currentStep;
      return () => clearTimeout(t);
    }
  }, [currentStep, completed]);

  const popClass = (revealStep) => (justRevealed === revealStep ? "sch-pop" : "");

  const icSelected = isDone(REVEAL.icSelected - 1) && !isDone(REVEAL.icPlaced - 1);
  const railsShown = isDone(REVEAL.icPlaced - 1);

  return (
    <div className="sch-canvas">
      <style>{`
        .sch-canvas {
          width: 100%;
          height: 100%;
          background-color: #0a1628;
          background-image:
            linear-gradient(rgba(96, 165, 250, 0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(96, 165, 250, 0.12) 1px, transparent 1px),
            linear-gradient(rgba(96, 165, 250, 0.28) 1px, transparent 1px),
            linear-gradient(90deg, rgba(96, 165, 250, 0.28) 1px, transparent 1px);
          background-size: 20px 20px, 20px 20px, 100px 100px, 100px 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .sch-pop { animation: sch-pop-anim 1.4s ease-out; }
        @keyframes sch-pop-anim {
          0%   { filter: drop-shadow(0 0 0px #4ade80); transform: scale(1); }
          25%  { filter: drop-shadow(0 0 14px #4ade80); transform: scale(1.06); }
          60%  { filter: drop-shadow(0 0 10px #4ade80); transform: scale(1); }
          100% { filter: drop-shadow(0 0 0px #4ade80); transform: scale(1); }
        }
        .sch-ghost { opacity: 0.5; animation: sch-ghost-pulse 1.6s ease-in-out infinite; }
        @keyframes sch-ghost-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.65; }
        }
        .sch-label { fill: #93c5fd; font-size: 13px; font-family: "Menlo", "Consolas", monospace; }
        .sch-wire { stroke: #7dd3fc; stroke-width: 2; fill: none; }
        .sch-symbol { stroke: #e0f2fe; stroke-width: 2; fill: none; }
        .sch-ic { fill: #132038; stroke: #60a5fa; stroke-width: 2; }
        .sch-ic-ghost { fill: none; stroke: #60a5fa; stroke-width: 2; stroke-dasharray: 6 5; }
      `}</style>

      <svg viewBox="0 0 720 300" width="90%" height="90%" style={{ maxWidth: 900 }}>
        {railsShown && (
          <g className={popClass(REVEAL.icPlaced - 1)}>
            <line x1="40" y1="60" x2="40" y2="260" className="sch-wire" />
            <text x="10" y="55" className="sch-label">5V</text>
            <line x1="40" y1="260" x2="620" y2="260" className="sch-wire" />
            <text x="330" y="278" className="sch-label">GND</text>
            <line x1="40" y1="150" x2="190" y2="150" className="sch-wire" />
          </g>
        )}

        {isDone(REVEAL.c1 - 1) && (
          <g className={popClass(REVEAL.c1 - 1)}>
            <line x1="100" y1="150" x2="100" y2="170" className="sch-wire" />
            <line x1="90" y1="170" x2="110" y2="170" className="sch-symbol" />
            <line x1="90" y1="178" x2="110" y2="178" className="sch-symbol" />
            <line x1="100" y1="178" x2="100" y2="260" className="sch-wire" />
            <text x="112" y="178" className="sch-label">C1</text>
          </g>
        )}

        {icSelected && (
          <g className="sch-ghost">
            <rect x="190" y="100" width="140" height="120" rx="6" className="sch-ic-ghost" />
            <text x="205" y="165" className="sch-label" fontWeight="bold">TPS54331</text>
            <text x="200" y="240" className="sch-label" fontSize="11">selected</text>
          </g>
        )}

        {isDone(REVEAL.icPlaced) && (
          <g className={popClass(REVEAL.icPlaced)}>
            <rect x="190" y="100" width="140" height="120" rx="6" className="sch-ic" />
            <text x="205" y="165" className="sch-label" fontWeight="bold">TPS54331</text>
            <text x="196" y="115" className="sch-label" fontSize="11">VIN</text>
            <text x="296" y="115" className="sch-label" fontSize="11">SW</text>
            <text x="196" y="212" className="sch-label" fontSize="11">GND</text>
            <text x="290" y="212" className="sch-label" fontSize="11">FB</text>
            <line x1="250" y1="220" x2="250" y2="260" className="sch-wire" />
          </g>
        )}

        {isDone(REVEAL.inductor - 1) && (
          <g className={popClass(REVEAL.inductor - 1)}>
            <line x1="330" y1="150" x2="360" y2="150" className="sch-wire" />
            <path
              d="M360,150 a6,6 0 0 1 12,0 a6,6 0 0 1 12,0 a6,6 0 0 1 12,0 a6,6 0 0 1 12,0"
              className="sch-symbol"
            />
            <line x1="408" y1="150" x2="440" y2="150" className="sch-wire" />
            <text x="368" y="135" className="sch-label">L1</text>
            <line x1="440" y1="60" x2="440" y2="260" className="sch-wire" />
            <text x="450" y="55" className="sch-label">VOUT 3.3V</text>
          </g>
        )}

        {isDone(REVEAL.c2 - 1) && (
          <g className={popClass(REVEAL.c2 - 1)}>
            <line x1="500" y1="150" x2="500" y2="170" className="sch-wire" />
            <line x1="490" y1="170" x2="510" y2="170" className="sch-symbol" />
            <line x1="490" y1="178" x2="510" y2="178" className="sch-symbol" />
            <line x1="500" y1="178" x2="500" y2="260" className="sch-wire" />
            <line x1="440" y1="150" x2="500" y2="150" className="sch-wire" />
            <text x="512" y="178" className="sch-label">C2</text>
          </g>
        )}

        {isDone(REVEAL.feedback - 1) && (
          <g className={popClass(REVEAL.feedback - 1)}>
            <line x1="580" y1="90" x2="580" y2="115" className="sch-wire" />
            <rect x="570" y="115" width="20" height="35" className="sch-symbol" />
            <text x="592" y="135" className="sch-label" fontSize="11">R1</text>
            <line x1="580" y1="150" x2="580" y2="170" className="sch-wire" />
            <rect x="570" y="170" width="20" height="35" className="sch-symbol" />
            <text x="592" y="190" className="sch-label" fontSize="11">R2</text>
            <line x1="580" y1="205" x2="580" y2="260" className="sch-wire" />
            <line x1="440" y1="90" x2="580" y2="90" className="sch-wire" />
            <path d="M580,160 L620,160 L620,80 L305,80 L305,100" className="sch-wire" />
            <circle cx="580" cy="160" r="3" fill="#7dd3fc" />
          </g>
        )}
      </svg>
    </div>
  );
}
