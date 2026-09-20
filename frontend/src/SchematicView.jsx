import { useEffect, useRef, useState } from "react";

const REVEAL = {
  icSelected: 2,
  icPlaced: 3,
  cap1: 4,
  cap2: 5,
  final: 6, // Cap 3 (bypass) + EN-to-IN tie
};

export default function SchematicView({ currentStep, totalSteps, completed, stage }) {
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

  const icPlaced = isDone(REVEAL.icPlaced);
  const icSelected = currentStep >= REVEAL.icSelected && !icPlaced;
  const cap1Done = isDone(REVEAL.cap1);
  const cap2Done = isDone(REVEAL.cap2);
  const finalDone = isDone(REVEAL.final) || (currentStep === REVEAL.final && stage === "reasoning");

  const cols = [1, 2, 3, 4, 5, 6];
  const rows = ["A", "B", "C", "D"];

  // Layout constants — kept well clear of the title block (x:700-960, y:500-610)
  const LEFT_X = 70, RIGHT_X = 590, RIGHT_JUNCTION_X = 490;
  const IC_LEFT = 250, IC_RIGHT = 410, IC_TOP = 100, IC_BOTTOM = 260;
  const MID_X = (IC_LEFT + IC_RIGHT) / 2;
  const EN_TAP_X = 210;
  const TOP_Y = 30, PIN_TOP_Y = 130, PIN_BOT_Y = 200, GND_RAIL_Y = 330;

  const Cap = ({ x, yTop, label }) => (
    <g>
      <line x1={x - 12} y1={yTop} x2={x + 12} y2={yTop} className="sch-symbol" />
      <line x1={x - 12} y1={yTop + 8} x2={x + 12} y2={yTop + 8} className="sch-symbol" />
      <text x={x + 18} y={yTop + 6} className="sch-label" fontSize="12">{label}</text>
    </g>
  );

  return (
    <div className="sch-canvas">
      <style>{`
        .sch-canvas { width: 100%; height: 100%; background: radial-gradient(ellipse at 50% 0%, #eff6ff 0%, #ffffff 55%); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
        .sch-spark { position: absolute; opacity: 0.05; animation: sch-spark-drift linear infinite; }
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
        @keyframes sch-ghost-pulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 0.75; } }
        .sch-energized { stroke-dasharray: 5 6; animation: sch-flow 1s linear infinite; }
        @keyframes sch-flow { to { stroke-dashoffset: -22; } }
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

      {[
        { top: "12%", left: "8%", size: 18, duration: 9, delay: -1 },
        { top: "70%", left: "10%", size: 14, duration: 11, delay: -4 },
        { top: "20%", left: "90%", size: 16, duration: 10, delay: -2 },
        { top: "78%", left: "88%", size: 20, duration: 13, delay: -6 },
      ].map((s, i) => (
        <svg key={i} className="sch-spark" style={{ top: s.top, left: s.left, animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s` }} width={s.size} height={s.size * 1.3} viewBox="0 0 26 34">
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

        <g transform="translate(70, 80)">
          {icSelected && (
            <g className="sch-ghost">
              <rect x={IC_LEFT} y={IC_TOP} width={IC_RIGHT - IC_LEFT} height={IC_BOTTOM - IC_TOP} rx="6" className="sch-ic-ghost" />
              <text x={IC_LEFT + 15} y={(IC_TOP + IC_BOTTOM) / 2} className="sch-label" fontWeight="bold">TPS79333</text>
              <text x={IC_LEFT + 20} y={IC_BOTTOM - 15} className="sch-label" fontSize="11">selected</text>
            </g>
          )}

          {icPlaced && (
            <g className={popClass(REVEAL.icPlaced)}>
              <polygon points={`${LEFT_X - 8},${TOP_Y + 15} ${LEFT_X + 8},${TOP_Y + 15} ${LEFT_X},${TOP_Y}`} fill="#1d4ed8" />
              <line x1={LEFT_X} y1={TOP_Y + 15} x2={LEFT_X} y2={GND_RAIL_Y} className={`sch-wire ${icPlaced ? "sch-energized" : ""}`} />
              <text x={LEFT_X - 45} y={TOP_Y + 20} className="sch-label" fontSize="13">3.3V</text>
              <circle cx={LEFT_X} cy={PIN_TOP_Y} r="3" className="sch-node" />
              <line x1={LEFT_X} y1={PIN_TOP_Y} x2={IC_LEFT} y2={PIN_TOP_Y} className={`sch-wire ${icPlaced ? "sch-energized" : ""}`} />

              {finalDone && (
                <g className={popClass(REVEAL.final)}>
                  <circle cx={EN_TAP_X} cy={PIN_TOP_Y} r="3" className="sch-node" />
                  <line x1={EN_TAP_X} y1={PIN_TOP_Y} x2={EN_TAP_X} y2={PIN_BOT_Y} className="sch-wire" />
                  <line x1={EN_TAP_X} y1={PIN_BOT_Y} x2={IC_LEFT} y2={PIN_BOT_Y} className="sch-wire" />
                </g>
              )}

              <rect x={IC_LEFT} y={IC_TOP} width={IC_RIGHT - IC_LEFT} height={IC_BOTTOM - IC_TOP} rx="6" className="sch-ic" />
              <text x={IC_LEFT + 20} y={IC_TOP - 22} className="sch-label" fontSize="12">U2</text>
              <text x={IC_LEFT + 10} y={IC_TOP - 6} className="sch-label" fontWeight="bold" fontSize="13">TPS79333-EP</text>
              <text x={IC_LEFT + 14} y={PIN_TOP_Y + 5} className="sch-label" fontSize="12">IN</text>
              <text x={IC_LEFT + 14} y={PIN_BOT_Y + 5} className="sch-label" fontSize="12">EN</text>
              <text x={IC_RIGHT - 34} y={PIN_TOP_Y + 5} className="sch-label" fontSize="12">OUT</text>
              <text x={IC_RIGHT - 30} y={PIN_BOT_Y + 5} className="sch-label" fontSize="12">BP</text>
              <text x={MID_X - 16} y={IC_BOTTOM - 8} className="sch-label" fontSize="12">GND</text>
              <text x={IC_LEFT - 14} y={PIN_TOP_Y + 4} className="sch-label" fontSize="11">1</text>
              <text x={IC_LEFT - 14} y={PIN_BOT_Y + 4} className="sch-label" fontSize="11">3</text>
              <text x={MID_X - 4} y={IC_BOTTOM + 14} className="sch-label" fontSize="11">2</text>
              <text x={IC_RIGHT + 6} y={PIN_TOP_Y + 4} className="sch-label" fontSize="11">5</text>
              <text x={IC_RIGHT + 6} y={PIN_BOT_Y + 4} className="sch-label" fontSize="11">4</text>
              <line x1={MID_X} y1={IC_BOTTOM} x2={MID_X} y2={GND_RAIL_Y} className="sch-wire" />
              <line x1={LEFT_X} y1={GND_RAIL_Y} x2={RIGHT_X} y2={GND_RAIL_Y} className="sch-wire" />
              <polygon points={`${MID_X - 8},${GND_RAIL_Y + 10} ${MID_X + 8},${GND_RAIL_Y + 10} ${MID_X},${GND_RAIL_Y + 26}`} fill="none" stroke="#0f172a" strokeWidth="2" />
              <text x={MID_X - 16} y={GND_RAIL_Y + 42} className="sch-label" fontSize="12">GND</text>
            </g>
          )}

          {cap1Done && (
            <g className={popClass(REVEAL.cap1)}>
              <line x1={LEFT_X} y1={PIN_TOP_Y + 30} x2={LEFT_X} y2={PIN_TOP_Y + 30} />
              <Cap x={LEFT_X} yTop={PIN_TOP_Y + 60} label="Cap 1  0.1µF" />
              <line x1={LEFT_X} y1={PIN_TOP_Y} x2={LEFT_X} y2={PIN_TOP_Y + 52} className="sch-wire" style={{ display: "none" }} />
            </g>
          )}

          {cap2Done && (
            <g className={popClass(REVEAL.cap2)}>
              <line x1={IC_RIGHT} y1={PIN_TOP_Y} x2={RIGHT_X} y2={PIN_TOP_Y} className="sch-wire" />
              <polygon points={`${RIGHT_X - 8},${TOP_Y + 15} ${RIGHT_X + 8},${TOP_Y + 15} ${RIGHT_X},${TOP_Y}`} fill="#1d4ed8" />
              <line x1={RIGHT_X} y1={TOP_Y + 15} x2={RIGHT_X} y2={GND_RAIL_Y} className="sch-wire sch-energized" />
              <text x={RIGHT_X + 15} y={TOP_Y + 20} className="sch-label" fontSize="13">2.8V</text>
              <circle cx={RIGHT_X} cy={PIN_TOP_Y} r="3" className="sch-node" />
              <Cap x={RIGHT_X} yTop={PIN_TOP_Y + 60} label="Cap 2  2.2µF" />
            </g>
          )}

          {finalDone && (
            <g className={popClass(REVEAL.final)}>
              <line x1={IC_RIGHT} y1={PIN_BOT_Y} x2={RIGHT_JUNCTION_X} y2={PIN_BOT_Y} className="sch-wire" />
              <line x1={RIGHT_JUNCTION_X} y1={PIN_BOT_Y} x2={RIGHT_JUNCTION_X} y2={GND_RAIL_Y} className="sch-wire" />
              <Cap x={RIGHT_JUNCTION_X} yTop={PIN_BOT_Y + 60} label="Cap 3  0.01µF" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}