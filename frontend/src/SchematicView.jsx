import { useEffect, useRef, useState } from "react";

const REVEAL = {
  icSelected: 2,
  icPlaced: 3,
  c1: 4,
  inductor: 5,
  c2: 6,
  feedback: 7,
};

export default function SchematicView({ currentStep, totalSteps, completed }) {
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

  const cols = [1, 2, 3, 4, 5, 6];
  const rows = ["A", "B", "C", "D"];

  return (
    <div className="sch-canvas">
      <style>{`
        .sch-canvas {
          width: 100%;
          height: 100%;
          background: radial-gradient(ellipse at 50% 0%, #eff6ff 0%, #ffffff 55%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .sch-spark {
          position: absolute;
          opacity: 0.05;
          animation: sch-spark-drift linear infinite;
        }
        @keyframes sch-spark-drift {
          0%   { transform: translate(0,0) rotate(0deg); }
          50%  { transform: translate(40px,-30px) rotate(15deg); }
          100% { transform: translate(0,0) rotate(0deg); }
        }
        .sch-pop { animation: sch-pop-anim 1.4s ease-out; }
        @keyframes sch-pop-anim {
          0%   { filter: drop-shadow(0 0 0px #eab308); transform: scale(1); }
          25%  { filter: drop-shadow(0 0 14px #eab308); transform: scale(1.06); }
          60%  { filter: drop-shadow(0 0 10px #eab308); transform: scale(1); }
          100% { filter: drop-shadow(0 0 0px #eab308); transform: scale(1); }
        }
        .sch-ghost { opacity: 0.55; animation: sch-ghost-pulse 1.6s ease-in-out infinite; }
        @keyframes sch-ghost-pulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.75; }
        }
        .sch-energized {
          stroke-dasharray: 5 6;
          animation: sch-flow 1s linear infinite;
        }
        @keyframes sch-flow {
          to { stroke-dashoffset: -22; }
        }
        .sch-label { fill: #0f172a; font-size: 14px; font-family: "Menlo", "Consolas", monospace; }
        .sch-wire { stroke: #1d4ed8; stroke-width: 2; fill: none; }
        .sch-symbol { stroke: #0f172a; stroke-width: 2; fill: none; }
        .sch-ic { fill: #eff6ff; stroke: #1d4ed8; stroke-width: 2.5; }
        .sch-ic-ghost { fill: none; stroke: #eab308; stroke-width: 2; stroke-dasharray: 6 5; }
        .sch-frame { stroke: #1d4ed8; fill: none; }
        .sch-tick { stroke: #1d4ed8; stroke-width: 1; }
        .sch-frame-label { fill: #1d4ed8; font-size: 13px; font-family: "Menlo", "Consolas", monospace; }
        .sch-tb-text { fill: #1d4ed8; font-size: 12px; font-family: "Menlo", "Consolas", monospace; }
        .sch-tb-title { fill: #1d4ed8; font-size: 15px; font-weight: bold; font-family: "Menlo", "Consolas", monospace; }
        .sch-node { fill: #1d4ed8; }
      `}</style>

      {/* Faint drifting spark particles, echoing the title screen */}
      {[
        { top: "12%", left: "8%", size: 18, duration: 9, delay: -1 },
        { top: "70%", left: "12%", size: 14, duration: 11, delay: -4 },
        { top: "22%", left: "90%", size: 16, duration: 10, delay: -2 },
        { top: "80%", left: "85%", size: 20, duration: 13, delay: -6 },
      ].map((s, i) => (
        <svg
          key={i}
          className="sch-spark"
          style={{ top: s.top, left: s.left, animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s` }}
          width={s.size}
          height={s.size * 1.3}
          viewBox="0 0 26 34"
        >
          <path d="M15,0 L2,20 L11,20 L8,34 L24,12 L14,12 Z" fill="#eab308" />
        </svg>
      ))}

      <svg viewBox="0 0 1000 650" width="96%" height="96%" style={{ maxWidth: 1100, position: "relative", zIndex: 1 }}>
        <rect x="20" y="20" width="960" height="610" className="sch-frame" strokeWidth="2" />
        <rect x="30" y="30" width="940" height="590" className="sch-frame" strokeWidth="1" />

        {cols.map((n, i) => {
          const x = 30 + (i + 0.5) * (940 / 6);
          return (
            <g key={`col-${n}`}>
              <text x={x} y="16" textAnchor="middle" className="sch-frame-label">{n}</text>
              <text x={x} y="644" textAnchor="middle" className="sch-frame-label">{n}</text>
              <line x1={30 + (i + 1) * (940 / 6)} y1="20" x2={30 + (i + 1) * (940 / 6)} y2="30" className="sch-tick" />
              <line x1={30 + (i + 1) * (940 / 6)} y1="610" x2={30 + (i + 1) * (940 / 6)} y2="620" className="sch-tick" />
            </g>
          );
        })}

        {rows.map((r, i) => {
          const y = 30 + (i + 0.5) * (590 / 4);
          return (
            <g key={`row-${r}`}>
              <text x="10" y={y + 5} textAnchor="middle" className="sch-frame-label">{r}</text>
              <text x="990" y={y + 5} textAnchor="middle" className="sch-frame-label">{r}</text>
              <line x1="20" y1={30 + (i + 1) * (590 / 4)} x2="30" y2={30 + (i + 1) * (590 / 4)} className="sch-tick" />
              <line x1="970" y1={30 + (i + 1) * (590 / 4)} x2="980" y2={30 + (i + 1) * (590 / 4)} className="sch-tick" />
            </g>
          );
        })}

        <g>
          <rect x="700" y="500" width="260" height="110" className="sch-frame" strokeWidth="1.5" />
          <line x1="700" y1="530" x2="960" y2="530" className="sch-tick" />
          <line x1="700" y1="560" x2="960" y2="560" className="sch-tick" />
          <line x1="700" y1="580" x2="960" y2="580" className="sch-tick" />
          <line x1="850" y1="560" x2="850" y2="610" className="sch-tick" />
          <text x="708" y="522" className="sch-tb-title">CircuitSpark</text>
          <text x="708" y="546" className="sch-tb-text">Buck Converter Tutorial</text>
          <text x="708" y="576" className="sch-tb-text">Size: A4</text>
          <text x="858" y="576" className="sch-tb-text">Rev: 1.0</text>
          <text x="708" y="600" className="sch-tb-text">Id: {currentStep}/{totalSteps || 8}</text>
        </g>

        {/* --- Circuit --- */}
        <g transform="translate(140, 140)">
          {railsShown && (
            <g className={popClass(REVEAL.icPlaced - 1)}>
              <line x1="40" y1="60" x2="40" y2="300" className={`sch-wire ${isDone(REVEAL.icPlaced) ? "sch-energized" : ""}`} />
              <text x="10" y="55" className="sch-label">12V</text>
              <line x1="40" y1="300" x2="650" y2="300" className="sch-wire" />
              <text x="330" y="318" className="sch-label">GND</text>
              <line x1="40" y1="150" x2="190" y2="150" className={`sch-wire ${isDone(REVEAL.icPlaced) ? "sch-energized" : ""}`} />
            </g>
          )}

          {isDone(REVEAL.c1 - 1) && (
            <g className={popClass(REVEAL.c1 - 1)}>
              <line x1="100" y1="150" x2="100" y2="170" className="sch-wire" />
              <line x1="90" y1="170" x2="110" y2="170" className="sch-symbol" />
              <line x1="90" y1="178" x2="110" y2="178" className="sch-symbol" />
              <line x1="100" y1="178" x2="100" y2="300" className="sch-wire" />
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
              <text x="278" y="212" className="sch-label" fontSize="11">FB</text>
              <line x1="250" y1="220" x2="250" y2="300" className="sch-wire" />
            </g>
          )}

          {isDone(REVEAL.inductor - 1) && (
            <g className={popClass(REVEAL.inductor - 1)}>
              <line x1="330" y1="150" x2="360" y2="150" className={`sch-wire ${isDone(REVEAL.inductor) ? "sch-energized" : ""}`} />
              <path d="M360,150 a6,6 0 0 1 12,0 a6,6 0 0 1 12,0 a6,6 0 0 1 12,0 a6,6 0 0 1 12,0" className="sch-symbol" />
              <line x1="408" y1="150" x2="440" y2="150" className={`sch-wire ${isDone(REVEAL.inductor) ? "sch-energized" : ""}`} />
              <text x="368" y="135" className="sch-label">L1</text>
              <line x1="440" y1="60" x2="440" y2="300" className={`sch-wire ${isDone(REVEAL.inductor) ? "sch-energized" : ""}`} />
              <text x="450" y="55" className="sch-label">VOUT 3.3V</text>
            </g>
          )}

          {isDone(REVEAL.c2 - 1) && (
            <g className={popClass(REVEAL.c2 - 1)}>
              <line x1="500" y1="150" x2="500" y2="170" className="sch-wire" />
              <line x1="490" y1="170" x2="510" y2="170" className="sch-symbol" />
              <line x1="490" y1="178" x2="510" y2="178" className="sch-symbol" />
              <line x1="500" y1="178" x2="500" y2="300" className="sch-wire" />
              <line x1="440" y1="150" x2="500" y2="150" className="sch-wire" />
              <text x="512" y="178" className="sch-label">C2</text>
            </g>
          )}

          {isDone(REVEAL.feedback - 1) && (
            <g className={popClass(REVEAL.feedback - 1)}>
              <line x1="440" y1="90" x2="610" y2="90" className="sch-wire" />
              <line x1="610" y1="90" x2="610" y2="115" className="sch-wire" />
              <rect x="600" y="115" width="20" height="35" className="sch-symbol" />
              <text x="626" y="136" className="sch-label" fontSize="11">R1</text>
              <line x1="610" y1="150" x2="610" y2="170" className="sch-wire" />
              <rect x="600" y="170" width="20" height="35" className="sch-symbol" />
              <text x="626" y="191" className="sch-label" fontSize="11">R2</text>
              <line x1="610" y1="205" x2="610" y2="300" className="sch-wire" />
              <path d="M610,150 L610,235 L310,235 L310,220" className="sch-wire" />
              <circle cx="610" cy="150" r="3" className="sch-node" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
