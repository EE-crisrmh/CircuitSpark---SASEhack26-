import { useEffect, useRef, useState } from "react";

// Thresholds: a piece is revealed once currentStep is PAST the given step.
const REVEAL = {
  icSelected: 2,   // ghost outline appears once step 2 (choose IC) is done
  icPlaced: 3,     // solid IC + VIN wire once step 3 (place IC) is done
  c1: 4,
  inductor: 5,
  c2: 6,
  feedback: 7,
};

const STEP_LABELS = [
  "Concept",
  "Choose IC",
  "Place IC",
  "Input cap",
  "Inductor",
  "Output cap",
  "Feedback",
  "Review",
];

export default function SchematicView({ currentStep, completed }) {
  const [justRevealed, setJustRevealed] = useState(null);
  const [flash, setFlash] = useState(false);
  const prevStep = useRef(currentStep);

  const isDone = (step) => completed || currentStep > step;

  useEffect(() => {
    if (prevStep.current !== currentStep || completed) {
      setFlash(true);
      setJustRevealed(currentStep - 1);
      const t1 = setTimeout(() => setFlash(false), 700);
      const t2 = setTimeout(() => setJustRevealed(null), 1400);
      prevStep.current = currentStep;
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [currentStep, completed]);

  const cls = (revealStep) =>
    `sch-piece ${isDone(revealStep) ? "sch-visible" : "sch-hidden"} ${
      justRevealed === revealStep ? "sch-pop" : ""
    }`;

  const icSelected = isDone(REVEAL.icSelected - 1) && !isDone(REVEAL.icPlaced - 1);

  return (
    <div className={`sch-wrap ${flash ? "sch-flash" : ""}`}>
      <style>{`
        .sch-wrap {
          background: #0f1420;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
          border: 2px solid transparent;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .sch-flash {
          border-color: #4ade80;
          box-shadow: 0 0 24px rgba(74, 222, 128, 0.45);
        }
        .sch-piece { transition: opacity 0.6s ease, transform 0.4s ease; transform-origin: center; }
        .sch-hidden { opacity: 0.08; }
        .sch-visible { opacity: 1; }
        .sch-pop { animation: sch-pop-anim 1.4s ease-out; }
        @keyframes sch-pop-anim {
          0%   { filter: drop-shadow(0 0 0px #4ade80); transform: scale(1); }
          25%  { filter: drop-shadow(0 0 14px #4ade80); transform: scale(1.06); }
          60%  { filter: drop-shadow(0 0 10px #4ade80); transform: scale(1); }
          100% { filter: drop-shadow(0 0 0px #4ade80); transform: scale(1); }
        }
        .sch-ghost { opacity: 0.5; animation: sch-ghost-pulse 1.6s ease-in-out infinite; }
        @keyframes sch-ghost-pulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.7; }
        }
        .sch-label { fill: #cbd5e1; font-size: 13px; font-family: "Menlo", "Consolas", monospace; }
        .sch-wire { stroke: #94a3b8; stroke-width: 2; fill: none; }
        .sch-symbol { stroke: #e2e8f0; stroke-width: 2; fill: none; }
        .sch-ic { fill: #1e293b; stroke: #60a5fa; stroke-width: 2; }
        .sch-ic-ghost { fill: none; stroke: #60a5fa; stroke-width: 2; stroke-dasharray: 6 5; }

        .sch-progress { display: flex; justify-content: space-between; margin-bottom: 14px; gap: 4px; }
        .sch-dot-wrap { display: flex; flex-direction: column; align-items: center; flex: 1; }
        .sch-dot {
          width: 22px; height: 22px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: bold; border: 2px solid #334155;
          color: #64748b; background: #0f1420; transition: all 0.4s ease;
        }
        .sch-dot-done { border-color: #4ade80; background: #4ade80; color: #0f1420; }
        .sch-dot-current { border-color: #60a5fa; color: #60a5fa; box-shadow: 0 0 8px rgba(96, 165, 250, 0.6); }
        .sch-dot-label { font-size: 9px; color: #64748b; margin-top: 4px; text-align: center; }
      `}</style>

      <div className="sch-progress">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          const done = completed || currentStep > stepNum;
          const current = !completed && currentStep === stepNum;
          return (
            <div className="sch-dot-wrap" key={stepNum}>
              <div className={`sch-dot ${done ? "sch-dot-done" : ""} ${current ? "sch-dot-current" : ""}`}>
                {done ? "✓" : stepNum}
              </div>
              <span className="sch-dot-label">{label}</span>
            </div>
          );
        })}
      </div>

      <svg viewBox="0 0 720 300" width="100%" height="auto">
        <line x1="40" y1="60" x2="40" y2="260" className="sch-wire" />
        <text x="10" y="55" className="sch-label">5V</text>

        <g className={cls(REVEAL.icPlaced - 1)}>
          <line x1="40" y1="150" x2="190" y2="150" className="sch-wire" />
        </g>

        <g className={cls(REVEAL.c1 - 1)}>
          <line x1="100" y1="150" x2="100" y2="170" className="sch-wire" />
          <line x1="90" y1="170" x2="110" y2="170" className="sch-symbol" />
          <line x1="90" y1="178" x2="110" y2="178" className="sch-symbol" />
          <line x1="100" y1="178" x2="100" y2="260" className="sch-wire" />
          <text x="112" y="178" className="sch-label">C1</text>
        </g>

        {icSelected && (
          <g className="sch-ghost">
            <rect x="190" y="100" width="140" height="120" rx="6" className="sch-ic-ghost" />
            <text x="205" y="165" className="sch-label" fontWeight="bold">TPS54331</text>
            <text x="200" y="240" className="sch-label" fontSize="11">selected ✓</text>
          </g>
        )}

        <g className={cls(REVEAL.icPlaced)}>
          <rect x="190" y="100" width="140" height="120" rx="6" className="sch-ic" />
          <text x="205" y="165" className="sch-label" fontWeight="bold">TPS54331</text>
          <text x="196" y="115" className="sch-label" fontSize="11">VIN</text>
          <text x="296" y="115" className="sch-label" fontSize="11">SW</text>
          <text x="196" y="212" className="sch-label" fontSize="11">GND</text>
          <text x="290" y="212" className="sch-label" fontSize="11">FB</text>
        </g>

        <g className={cls(REVEAL.icPlaced)}>
          <line x1="250" y1="220" x2="250" y2="260" className="sch-wire" />
        </g>

        <line x1="40" y1="260" x2="620" y2="260" className="sch-wire" />
        <text x="330" y="278" className="sch-label">GND</text>

        <g className={cls(REVEAL.inductor - 1)}>
          <line x1="330" y1="150" x2="360" y2="150" className="sch-wire" />
          <path d="M360,150 a6,6 0 0 1 12,0 a6,6 0 0 1 12,0 a6,6 0 0 1 12,0 a6,6 0 0 1 12,0" className="sch-symbol" />
          <line x1="408" y1="150" x2="440" y2="150" className="sch-wire" />
          <text x="368" y="135" className="sch-label">L1</text>
        </g>

        <g className={cls(REVEAL.inductor - 1)}>
          <line x1="440" y1="60" x2="440" y2="260" className="sch-wire" />
          <text x="450" y="55" className="sch-label">VOUT 3.3V</text>
        </g>

        <g className={cls(REVEAL.c2 - 1)}>
          <line x1="500" y1="150" x2="500" y2="170" className="sch-wire" />
          <line x1="490" y1="170" x2="510" y2="170" className="sch-symbol" />
          <line x1="490" y1="178" x2="510" y2="178" className="sch-symbol" />
          <line x1="500" y1="178" x2="500" y2="260" className="sch-wire" />
          <line x1="440" y1="150" x2="500" y2="150" className="sch-wire" />
          <text x="512" y="178" className="sch-label">C2</text>
        </g>

        <g className={cls(REVEAL.feedback - 1)}>
          <line x1="580" y1="90" x2="580" y2="115" className="sch-wire" />
          <rect x="570" y="115" width="20" height="35" className="sch-symbol" />
          <text x="592" y="135" className="sch-label" fontSize="11">R1</text>

          <line x1="580" y1="150" x2="580" y2="170" className="sch-wire" />
          <rect x="570" y="170" width="20" height="35" className="sch-symbol" />
          <text x="592" y="190" className="sch-label" fontSize="11">R2</text>
          <line x1="580" y1="205" x2="580" y2="260" className="sch-wire" />

          <line x1="440" y1="90" x2="580" y2="90" className="sch-wire" />

          <path d="M580,160 L620,160 L620,80 L305,80 L305,100" className="sch-wire" />
          <circle cx="580" cy="160" r="3" fill="#94a3b8" />
          <text x="595" y="158" className="sch-label" fontSize="11">FB node</text>
        </g>
      </svg>
    </div>
  );
}
