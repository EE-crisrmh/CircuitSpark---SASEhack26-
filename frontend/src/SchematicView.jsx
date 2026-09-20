import { useEffect, useRef, useState } from "react";

const REVEAL = {
  icSelected: 2,
  icPlaced: 3,
  c4: 4,
  c5: 5,
  final: 6, // C6 bypass cap + EN-to-IN tie, revealed together at completion
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
  const icPlaced = isDone(REVEAL.icPlaced - 1);

  const cols = [1, 2, 3, 4, 5, 6];
  const rows = ["A", "B", "C", "D"];

  // Layout constants
  const LEFT_X = 60, RIGHT_X = 640, RIGHT_JUNCTION_X = 520;
  const IC_LEFT = 280, IC_RIGHT = 460, IC_TOP = 140, IC_BOTTOM = 300;
  const MID_X = (IC_LEFT + IC_RIGHT) / 2;
  const EN_TAP_X = 240;
  const TOP_Y = 40, PIN_TOP_Y = 170, PIN_BOT_Y = 250, GND_RAIL_Y = 420;

  const Cap = ({ x, yTop, label, labelSide = "right" }) => (
    <g>
      <line x1={x} y1={yTop} x2={x + 10} y2={yTop} className="sch-symbol" />
      <line x1={x - 10} y1={yTop} x2={x + 10} y2={yTop} className="sch-symbol" transform={`translate(0,0)`} />
      <line x1={x - 12} y1={yTop} x2={x + 12} y2={yTop} className="sch-symbol" />
      <line x1={x - 12} y1={yTop + 8} x2={x + 12} y2={yTop + 8} className="sch-symbol" />
      <text x={labelSide === "right" ? x + 18 : x - 60} y={yTop + 6} className="sch-label" fontSize="12">{label}</text>
    </g>
  );

  return (
    <div className="sch-canvas">
      <style>{`
        .sch-canvas { width: 100%; height: 100%; background: radial-gradient(ellipse at 50% 0%, #eff6ff 0%, #ffffff 55%); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
        .sch-pop { animation: sch-pop-anim 1.4s ease-out; }
        @keyframes sch-pop-anim {
          0%   { filter: drop-shadow(0 0 0px #eab308); transform: scale(1); }
          25%  { filter: drop-shadow(0 0 14px #eab308); transform: scale(1.06); }
          60%  { filter: drop-shadow(0 0 10px #eab308); transform: scale(1); }
          100% { filter: drop-shadow(0 0 0px #eab308); transform: scale(1); }
        }
        .sch-ghost { opacity: 0.55; animation: sch-ghost-pulse 1.6s ease-in-out infinite; }
        @keyframes sch-ghost-pulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 0.75; } }
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

      <svg viewBox="0 0 1000 650" width="96%" height="96%" style={{ maxWidth: 1100 }}>
        <rect x="20" y="20" width="960" height="610" className="sch-frame" strokeWidth="2" />
        <rect x="30" y="30" width="940" height="590" className="sch-frame" strokeWidth="1" />

        {cols.map((n, i) => {
          const x = 30 + (i + 0.5) * (940 / 6);
          return (
            <g key={`col-${n}`}>
              <text x={x} y="16" textAnchor="middle" className="sch-frame-label">{n}</text>
              <text x={x} y="644" textAnchor="middle" className="sch-frame-label">{n}</text>
            </g>
          );
        })}
        {rows.map((r, i) => {
          const y = 30 + (i + 0.5) * (590 / 4);
          return (
            <g key={`row-${r}`}>
              <text x="10" y={y + 5} textAnchor="middle" className="sch-frame-label">{r}</text>
              <text x="990" y={y + 5} textAnchor="middle" className="sch-frame-label">{r}</text>
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
          <text x="708" y="546" className="sch-tb-text">LDO Regulator Tutorial</text>
          <text x="708" y="576" className="sch-tb-text">Size: A4</text>
          <text x="858" y="576" className="sch-tb-text">Rev: 1.0</text>
          <text x="708" y="600" className="sch-tb-text">Id: {currentStep}/{totalSteps || 6}</text>
        </g>

        <g transform="translate(80, 110)">
          {icSelected && (
            <g className="sch-ghost">
              <rect x={IC_LEFT} y={IC_TOP} width={IC_RIGHT - IC_LEFT} height={IC_BOTTOM - IC_TOP} rx="6" className="sch-ic-ghost" />
              <text x={IC_LEFT + 15} y={(IC_TOP + IC_BOTTOM) / 2} className="sch-label" fontWeight="bold">TPS79333</text>
              <text x={IC_LEFT + 20} y={IC_BOTTOM - 15} className="sch-label" fontSize="11">selected</text>
            </g>
          )}

          {icPlaced && (
            <g className={popClass(REVEAL.icPlaced)}>
              {/* Left rail: 3.3V, in series through C4, down to GND */}
              <polygon points={`${LEFT_X - 8},${TOP_Y + 15} ${LEFT_X + 8},${TOP_Y + 15} ${LEFT_X},${TOP_Y}`} fill="#1d4ed8" />
              <line x1={LEFT_X} y1={TOP_Y + 15} x2={LEFT_X} y2={PIN_TOP_Y} className="sch-wire" />
              <text x={LEFT_X - 45} y={TOP_Y + 20} className="sch-label" fontSize="13">3.3V</text>
              <circle cx={LEFT_X} cy={PIN_TOP_Y} r="3" className="sch-node" />
              <Cap x={LEFT_X} yTop={PIN_TOP_Y + 35} label="C4  0.1µF" labelSide="left_below" />
              <line x1={LEFT_X} y1={PIN_TOP_Y} x2={LEFT_X} y2={PIN_TOP_Y + 35} className="sch-wire" />
              <line x1={LEFT_X} y1={PIN_TOP_Y + 43} x2={LEFT_X} y2={GND_RAIL_Y} className="sch-wire" />

              {/* IN pin wire + EN branch */}
              <line x1={LEFT_X} y1={PIN_TOP_Y} x2={IC_LEFT} y2={PIN_TOP_Y} className="sch-wire" />
              <circle cx={EN_TAP_X} cy={PIN_TOP_Y} r="3" className="sch-node" style={{ opacity: isDone(REVEAL.final) ? 1 : 0 }} />
              {isDone(REVEAL.final) && (
                <g className={popClass(REVEAL.final)}>
                  <line x1={EN_TAP_X} y1={PIN_TOP_Y} x2={EN_TAP_X} y2={PIN_BOT_Y} className="sch-wire" />
                  <line x1={EN_TAP_X} y1={PIN_BOT_Y} x2={IC_LEFT} y2={PIN_BOT_Y} className="sch-wire" />
                </g>
              )}

              {/* IC body */}
              <rect x={IC_LEFT} y={IC_TOP} width={IC_RIGHT - IC_LEFT} height={IC_BOTTOM - IC_TOP} rx="6" className="sch-ic" />
              <text x={IC_LEFT + 20} y={IC_TOP - 22} className="sch-label" fontSize="12">U2</text>
              <text x={IC_LEFT + 10} y={IC_TOP - 6} className="sch-label" fontWeight="bold" fontSize="13">TPS79333-EP</text>
              <text x={IC_LEFT + 14} y={PIN_TOP_Y + 5} className="sch-label" fontSize="12">IN</text>
              <text x={IC_LEFT + 14} y={PIN_BOT_Y + 5} className="sch-label" fontSize="12">EN</text>
              <text x={IC_RIGHT - 34} y={PIN_TOP_Y + 5} className="sch-label" fontSize="12">OUT</text>
              <text x={IC_RIGHT - 30} y={PIN_BOT_Y + 5} className="sch-label" fontSize="12">BP</text>
              <text x={MID_X - 16} y={IC_BOTTOM - 8} className="sch-label" fontSize="12">GND</text>

              {/* Pin numbers */}
              <text x={IC_LEFT - 14} y={PIN_TOP_Y + 4} className="sch-label" fontSize="11">1</text>
              <text x={IC_LEFT - 14} y={PIN_BOT_Y + 4} className="sch-label" fontSize="11">3</text>
              <text x={MID_X - 4} y={IC_BOTTOM + 14} className="sch-label" fontSize="11">2</text>
              <text x={IC_RIGHT + 6} y={PIN_TOP_Y + 4} className="sch-label" fontSize="11">5</text>
              <text x={IC_RIGHT + 6} y={PIN_BOT_Y + 4} className="sch-label" fontSize="11">4</text>

              {/* GND pin down to rail */}
              <line x1={MID_X} y1={IC_BOTTOM} x2={MID_X} y2={GND_RAIL_Y} className="sch-wire" />

              {/* GND rail + symbol */}
              <line x1={LEFT_X} y1={GND_RAIL_Y} x2={RIGHT_X} y2={GND_RAIL_Y} className="sch-wire" />
              <polygon points={`${MID_X - 8},${GND_RAIL_Y + 10} ${MID_X + 8},${GND_RAIL_Y + 10} ${MID_X},${GND_RAIL_Y + 26}`} fill="none" stroke="#0f172a" strokeWidth="2" />
              <text x={MID_X - 16} y={GND_RAIL_Y + 42} className="sch-label" fontSize="12">GND</text>
            </g>
          )}

          {isDone(REVEAL.c4 - 1) && icPlaced && (
            <g className={popClass(REVEAL.c4 - 1)} />
          )}

          {isDone(REVEAL.c5 - 1) && icPlaced && (
            <g className={popClass(REVEAL.c5 - 1)}>
              <line x1={IC_RIGHT} y1={PIN_TOP_Y} x2={RIGHT_X} y2={PIN_TOP_Y} className="sch-wire" />
              <polygon points={`${RIGHT_X - 8},${TOP_Y + 15} ${RIGHT_X + 8},${TOP_Y + 15} ${RIGHT_X},${TOP_Y}`} fill="#1d4ed8" />
              <line x1={RIGHT_X} y1={TOP_Y + 15} x2={RIGHT_X} y2={PIN_TOP_Y} className="sch-wire" />
              <text x={RIGHT_X + 15} y={TOP_Y + 20} className="sch-label" fontSize="13">2.8V</text>
              <circle cx={RIGHT_X} cy={PIN_TOP_Y} r="3" className="sch-node" />
              <line x1={RIGHT_X} y1={PIN_TOP_Y} x2={RIGHT_X} y2={PIN_TOP_Y + 35} className="sch-wire" />
              <Cap x={RIGHT_X} yTop={PIN_TOP_Y + 35} label="C5  2.2µF" />
              <line x1={RIGHT_X} y1={PIN_TOP_Y + 43} x2={RIGHT_X} y2={GND_RAIL_Y} className="sch-wire" />
            </g>
          )}

          {isDone(REVEAL.final) && (
            <g className={popClass(REVEAL.final)}>
              <line x1={IC_RIGHT} y1={PIN_BOT_Y} x2={RIGHT_JUNCTION_X} y2={PIN_BOT_Y} className="sch-wire" />
              <line x1={RIGHT_JUNCTION_X} y1={PIN_BOT_Y} x2={RIGHT_JUNCTION_X} y2={PIN_BOT_Y + 55} className="sch-wire" />
              <Cap x={RIGHT_JUNCTION_X} yTop={PIN_BOT_Y + 55} label="C6  0.01µF" />
              <line x1={RIGHT_JUNCTION_X} y1={PIN_BOT_Y + 63} x2={RIGHT_JUNCTION_X} y2={GND_RAIL_Y} className="sch-wire" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
