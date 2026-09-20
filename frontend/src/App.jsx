import { useState } from "react";
import SchematicView from "./SchematicView";

const API_BASE = "http://localhost:8000";

// ---------- Shared floating background pieces (title screen) ----------
const FLOATERS = [
  { type: "resistor", top: 12, size: 60, duration: 26, delay: -2 },
  { type: "capacitor", top: 28, size: 40, duration: 32, delay: -14 },
  { type: "inductor", top: 45, size: 50, duration: 22, delay: -8 },
  { type: "switch", top: 62, size: 45, duration: 30, delay: -20 },
  { type: "bolt", top: 18, size: 30, duration: 20, delay: -5 },
  { type: "resistor", top: 75, size: 55, duration: 28, delay: -16 },
  { type: "capacitor", top: 85, size: 35, duration: 24, delay: -3 },
  { type: "inductor", top: 8, size: 45, duration: 34, delay: -10 },
  { type: "bolt", top: 55, size: 26, duration: 18, delay: -12 },
  { type: "switch", top: 38, size: 42, duration: 27, delay: -22 },
];

function FloaterIcon({ type }) {
  const stroke = type === "bolt" ? "#eab308" : "#1d4ed8";
  if (type === "resistor") {
    return (
      <svg width="60" height="24" viewBox="0 0 60 24">
        <path d="M0,12 L10,12 L15,2 L25,22 L35,2 L45,22 L50,12 L60,12" stroke={stroke} strokeWidth="2" fill="none" />
      </svg>
    );
  }
  if (type === "capacitor") {
    return (
      <svg width="40" height="30" viewBox="0 0 40 30">
        <line x1="0" y1="15" x2="16" y2="15" stroke={stroke} strokeWidth="2" />
        <line x1="16" y1="2" x2="16" y2="28" stroke={stroke} strokeWidth="2" />
        <line x1="24" y1="2" x2="24" y2="28" stroke={stroke} strokeWidth="2" />
        <line x1="24" y1="15" x2="40" y2="15" stroke={stroke} strokeWidth="2" />
      </svg>
    );
  }
  if (type === "inductor") {
    return (
      <svg width="60" height="20" viewBox="0 0 60 20">
        <path d="M0,10 L8,10" stroke={stroke} strokeWidth="2" fill="none" />
        <path d="M8,10 a6,6 0 0 1 12,0 a6,6 0 0 1 12,0 a6,6 0 0 1 12,0 a6,6 0 0 1 12,0" stroke={stroke} strokeWidth="2" fill="none" />
        <path d="M56,10 L60,10" stroke={stroke} strokeWidth="2" fill="none" />
      </svg>
    );
  }
  if (type === "switch") {
    return (
      <svg width="50" height="24" viewBox="0 0 50 24">
        <line x1="0" y1="18" x2="15" y2="18" stroke={stroke} strokeWidth="2" />
        <line x1="15" y1="18" x2="35" y2="6" stroke={stroke} strokeWidth="2" />
        <line x1="35" y1="18" x2="50" y2="18" stroke={stroke} strokeWidth="2" />
        <circle cx="15" cy="18" r="2.5" fill={stroke} />
        <circle cx="35" cy="18" r="2.5" fill={stroke} />
      </svg>
    );
  }
  return (
    <svg width="26" height="34" viewBox="0 0 26 34">
      <path d="M15,0 L2,20 L11,20 L8,34 L24,12 L14,12 Z" fill={stroke} />
    </svg>
  );
}

// Shared CSS for all three "bookend" screens (title, library, completed)
const bookendStyles = `
  @keyframes driftX {
    0%   { transform: translate(0, 0) rotate(0deg); opacity: 0.25; }
    10%  { opacity: 0.35; }
    25%  { transform: translate(25vw, -18px) rotate(8deg); }
    50%  { transform: translate(50vw, 14px) rotate(-6deg); }
    75%  { transform: translate(75vw, -10px) rotate(6deg); }
    90%  { opacity: 0.35; }
    100% { transform: translate(105vw, 0) rotate(0deg); opacity: 0.25; }
  }
  .floater { position: absolute; left: -80px; animation-name: driftX; animation-timing-function: linear; animation-iteration-count: infinite; }
  .floater-chip {
    position: absolute;
    left: -240px;
    white-space: nowrap;
    padding: 8px 16px;
    border: 2px solid #1d4ed8;
    border-radius: 999px;
    background: #ffffff;
    color: #1d4ed8;
    font-family: "Space Mono", monospace;
    font-size: 13px;
    font-weight: bold;
    box-shadow: 0 2px 8px rgba(29,78,216,0.15);
    animation-name: driftX;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
  @keyframes titleFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  @keyframes boltGlow {
    0%, 100% { filter: drop-shadow(0 0 6px rgba(234,179,8,0.6)); }
    50% { filter: drop-shadow(0 0 18px rgba(234,179,8,0.95)); }
  }
  .cs-title { animation: titleFloat 3.2s ease-in-out infinite; }
  .cs-bolt { animation: boltGlow 1.8s ease-in-out infinite; }
  .cs-btn { transition: transform 0.15s ease, box-shadow 0.15s ease; }
  .cs-btn:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 8px 24px rgba(29, 78, 216, 0.35); }
  .cs-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
  .cs-card:hover { transform: translateY(-4px); box-shadow: 0 10px 24px rgba(29,78,216,0.18); }
`;

function BigTitle({ word1, word2 }) {
  return (
    <div
      className="cs-title"
      style={{
        fontFamily: '"Orbitron", sans-serif',
        fontSize: "clamp(40px, 7vw, 88px)",
        fontWeight: 900,
        color: "#1d4ed8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.15em",
        letterSpacing: "1px",
      }}
    >
      <span>{word1}</span>
      <span className="cs-bolt" style={{ display: "inline-flex" }}>
        <svg width="0.7em" height="1em" viewBox="0 0 26 34" style={{ display: "block" }}>
          <path d="M15,0 L2,20 L11,20 L8,34 L24,12 L14,12 Z" fill="#eab308" />
        </svg>
      </span>
      <span>{word2}</span>
    </div>
  );
}

// ---------- Screen 1: Title ----------
function StartScreen({ onStart }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "linear-gradient(180deg, #ffffff 0%, #eff6ff 100%)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <style>{bookendStyles}</style>

      {FLOATERS.map((f, i) => (
        <div
          key={i}
          className="floater"
          style={{ top: `${f.top}%`, width: f.size, animationDuration: `${f.duration}s`, animationDelay: `${f.delay}s` }}
        >
          <FloaterIcon type={f.type} />
        </div>
      ))}

      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <BigTitle word1="Circuit" word2="Spark" />
        <button
          onClick={onStart}
          className="cs-btn"
          style={{
            marginTop: 40,
            padding: "16px 44px",
            fontSize: 18,
            fontWeight: "bold",
            fontFamily: '"Space Mono", monospace',
            background: "#1d4ed8",
            color: "#ffffff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(29, 78, 216, 0.25)",
          }}
        >
          Start
        </button>
      </div>
    </div>
  );
}

function CircuitLibraryScreen({ onSelectBuck, loading }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#ffffff", overflowY: "auto", padding: "60px 40px", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontFamily: '"Orbitron", sans-serif', color: "#1d4ed8", fontSize: 34, marginBottom: 8 }}>
          Circuit Library
        </h1>
        <p style={{ fontFamily: '"Space Mono", monospace', color: "#475569", marginBottom: 36, fontSize: 14 }}>
          Pick a circuit to learn how it works, step by step, straight from the real datasheet.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
          <div
            className="cs-card"
            onClick={!loading ? onSelectBuck : undefined}
            style={{
              cursor: loading ? "default" : "pointer",
              border: "2px solid #1d4ed8",
              borderRadius: 12,
              padding: 20,
              background: "#eff6ff",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚡</div>
            <h3 style={{ fontFamily: '"Orbitron", sans-serif', color: "#1d4ed8", margin: "0 0 8px", fontSize: 17 }}>
              LDO Regulator
            </h3>
            <p style={{ fontFamily: '"Space Mono", monospace', color: "#475569", fontSize: 13, lineHeight: 1.5 }}>
              Build a 3.3V → 2.8V linear regulator using the TPS79333-EP, guided by the real datasheet.
            </p>
            <div style={{ marginTop: 16, fontWeight: "bold", color: "#1d4ed8", fontFamily: '"Space Mono", monospace', fontSize: 13 }}>
              {loading ? "Loading..." : "Start →"}
            </div>
          </div>

          {["Buck Converter", "555 Timer Circuit"].map((name) => (
            <div
              key={name}
              style={{ border: "2px dashed #cbd5e1", borderRadius: 12, padding: 20, background: "#f8fafc", opacity: 0.6 }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
              <h3 style={{ fontFamily: '"Orbitron", sans-serif', color: "#94a3b8", margin: "0 0 8px", fontSize: 17 }}>
                {name}
              </h3>
              <p style={{ fontFamily: '"Space Mono", monospace', color: "#94a3b8", fontSize: 13 }}>Coming soon</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



// ---------- Screen 4: Circuit Built (completion) ----------
const CONCEPT_CHIPS = [
  { text: "Switching Regulation", top: 15, duration: 24, delay: -3 },
  { text: "Efficiency", top: 30, duration: 28, delay: -12 },
  { text: "Inductor Energy Storage", top: 48, duration: 32, delay: -6 },
  { text: "Voltage Feedback", top: 65, duration: 26, delay: -18 },
  { text: "Duty Cycle Control", top: 80, duration: 30, delay: -9 },
  { text: "Output Filtering", top: 22, duration: 22, delay: -20 },
];

function CircuitBuiltScreen({ onKeepBuilding }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "linear-gradient(180deg, #ffffff 0%, #eff6ff 100%)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <style>{bookendStyles}</style>

      {CONCEPT_CHIPS.map((c, i) => (
        <div
          key={i}
          className="floater-chip"
          style={{ top: `${c.top}%`, animationDuration: `${c.duration}s`, animationDelay: `${c.delay}s` }}
        >
          {c.text}
        </div>
      ))}

      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <BigTitle word1="Circuit" word2="Built!" />
        <p style={{ fontFamily: '"Space Mono", monospace', color: "#1d4ed8", fontSize: 16, marginTop: 20 }}>
          You just learned how a real switching regulator works, step by step.
        </p>
        <button
          onClick={onKeepBuilding}
          className="cs-btn"
          style={{
            marginTop: 32,
            padding: "16px 44px",
            fontSize: 18,
            fontWeight: "bold",
            fontFamily: '"Space Mono", monospace',
            background: "#1d4ed8",
            color: "#ffffff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(29, 78, 216, 0.25)",
          }}
        >
          Keep Building
        </button>
      </div>
    </div>
  );
}

// Main App
export default function App() {
  const [screen, setScreen] = useState("title"); // "title" | "library" | "building" | "completed"
  const [sessionId, setSessionId] = useState(null);
  const [stepNumber, setStepNumber] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [title, setTitle] = useState("");
  const [task, setTask] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [hintLevel, setHintLevel] = useState(0);
  const [loading, setLoading] = useState(false);
  const [datasheetRef, setDatasheetRef] = useState(null);
  const [stage, setStage] = useState(null);

  async function startSession() {
    setLoading(true);
    const res = await fetch(`${API_BASE}/start`, { method: "POST" });
    const data = await res.json();
    setSessionId(data.session_id);
    setStepNumber(data.step_number);
    setTotalSteps(data.total_steps);
    setTitle(data.title);
    setTask(data.task);
    setDatasheetRef(data.datasheet_reference || null);
    setFeedback("");
    setHintLevel(0);
    setAnswer("");
    setLoading(false);
    setScreen("building");
    setStage(data.stage ?? null);
  }

  async function submitAnswer(e) {
    e.preventDefault();
    if (!answer.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/submit-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, answer }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error("submit-answer failed:", res.status, errText);
        setFeedback(`Error ${res.status}: check backend terminal for details.`);
        return;
      }
      const data = await res.json();
      setFeedback(data.message);
      setHintLevel(data.hint_level);
      setStepNumber(data.step_number);
      if (data.title) setTitle(data.title);
      if (data.task) setTask(data.task);
      if (data.datasheet_reference) setDatasheetRef(data.datasheet_reference);
      if (data.correct) setAnswer("");
      if (data.completed) {
        setScreen("completed");
      }
    } catch (err) {
      console.error("submit-answer network error:", err);
      setFeedback("Network error — is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  function keepBuilding() {
    setSessionId(null);
    setScreen("library");
  }

  if (screen === "title") {
    return <StartScreen onStart={() => setScreen("library")} />;
  }

  if (screen === "library") {
    return <CircuitLibraryScreen onSelectBuck={startSession} loading={loading} />;
  }

  if (screen === "completed") {
    return <CircuitBuiltScreen onKeepBuilding={keepBuilding} />;
  }

  // screen === "building"
  return (
    <div style={{ position: "fixed", inset: 0, fontFamily: '"Space Mono", monospace', display: "flex" }}>
      <style>{`
        @keyframes sidebarShimmer {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .cs-accent-bar {
          height: 4px;
          width: 100%;
          background: linear-gradient(90deg, #1d4ed8, #eab308, #1d4ed8);
          background-size: 200% 100%;
          animation: sidebarShimmer 4s linear infinite;
        }
        @keyframes feedbackIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cs-feedback { animation: feedbackIn 0.35s ease-out; }
        .cs-textarea:focus {
          outline: none;
          border-color: #60a5fa !important;
          box-shadow: 0 0 0 3px rgba(96,165,250,0.25);
        }
        .cs-submit {
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .cs-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(96,165,250,0.35);
        }
        .cs-dot { transition: all 0.35s ease; }
        .cs-sidebar-spark {
          position: absolute;
          opacity: 0.06;
          animation: driftX linear infinite;
        }
        @keyframes driftX {
          0%   { transform: translate(0, 0) rotate(0deg); }
          50%  { transform: translate(30px, -20px) rotate(10deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
      `}</style>

      {/* Canvas: 80% */}
      <div style={{ flex: "0 0 80%", height: "100%" }}>
        <SchematicView currentStep={stepNumber} totalSteps={totalSteps} completed={false} />
      </div>

      {/* Sidebar: 20% */}
      <div
        style={{
          flex: "0 0 20%",
          height: "100%",
          overflowY: "auto",
          background: "linear-gradient(180deg, #0a1628 0%, #0f1c33 100%)",
          color: "#e2e8f0",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="cs-accent-bar" />

        {/* faint drifting sparks in the background */}
        {[
          { top: "15%", left: "70%", duration: 14, delay: -2 },
          { top: "55%", left: "15%", duration: 18, delay: -6 },
          { top: "85%", left: "60%", duration: 16, delay: -9 },
        ].map((s, i) => (
          <svg key={i} className="cs-sidebar-spark" style={{ top: s.top, left: s.left, animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s` }} width="24" height="30" viewBox="0 0 26 34">
            <path d="M15,0 L2,20 L11,20 L8,34 L24,12 L14,12 Z" fill="#eab308" />
          </svg>
        ))}

        <div style={{ padding: "24px 20px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((n) => (
              <div
                key={n}
                className="cs-dot"
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: "bold",
                  border: `2px solid ${n < stepNumber ? "#4ade80" : n === stepNumber ? "#eab308" : "#334155"}`,
                  background: n < stepNumber ? "#4ade80" : "transparent",
                  color: n < stepNumber ? "#0a1628" : n === stepNumber ? "#eab308" : "#64748b",
                  transform: n === stepNumber ? "scale(1.15)" : "scale(1)",
                  boxShadow: n === stepNumber ? "0 0 10px rgba(234,179,8,0.5)" : "none",
                }}
              >
                {n < stepNumber ? "✓" : n}
              </div>
            ))}
          </div>

          <p style={{ color: "#64748b", margin: 0, fontSize: 13 }}>
            Step {stepNumber} of {totalSteps}
          </p>
          <h2 style={{ marginTop: 6, marginBottom: 12, fontSize: 20, color: "#f8fafc", fontFamily: '"Orbitron", sans-serif' }}>
            {title}
          </h2>

          {stage === "reasoning" && (
            <div style={{
              display: "inline-block",
              background: "#eab308",
              color: "#1e293b",
              fontFamily: '"Space Mono", monospace',
              fontSize: 12,
              fontWeight: "bold",
              padding: "4px 10px",
              borderRadius: 6,
              marginBottom: 8,
              width: "fit-content",
            }}>
              NOW: explain your reasoning
            </div>
          )}

          <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.5 }}>{task}</p>

          {datasheetRef && (
            <p style={{ fontSize: 12, marginTop: 4 }}>
              <a
                href="https://www.ti.com/lit/ds/symlink/tps79333-ep.pdf"
                target="_blank"
                rel="noreferrer"
                style={{ color: "#60a5fa" }}
              >
                Datasheet: Section {datasheetRef.section} — {datasheetRef.title}
              </a>
            </p>
          )}

          <form onSubmit={submitAnswer} style={{ marginTop: "auto" }}>
            <textarea
              className="cs-textarea"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={5}
              style={{
                width: "100%",
                padding: 10,
                boxSizing: "border-box",
                background: "#0f1420",
                color: "#e2e8f0",
                border: "1px solid #334155",
                borderRadius: 6,
                resize: "vertical",
                fontFamily: "inherit",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              }}
              placeholder="Type your answer..."
            />
            <button type="submit" disabled={loading} className="cs-submit" style={{ ...btnStyle, width: "100%", marginTop: 10 }}>
              {loading ? "Checking..." : "Submit"}
            </button>
          </form>

          {feedback && (
            <div
              key={feedback}
              className="cs-feedback"
              style={{
                marginTop: 16,
                padding: 12,
                fontSize: 13,
                lineHeight: 1.5,
                background: hintLevel > 0 ? "#3f2d12" : "#123f22",
                color: hintLevel > 0 ? "#fcd34d" : "#86efac",
                borderRadius: 6,
                border: `1px solid ${hintLevel > 0 ? "#78350f" : "#166534"}`,
              }}
            >
              {feedback}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  padding: "12px 18px",
  background: "#1d4ed8",
  color: "#ffffff",
  border: "none",
  borderRadius: 6,
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: 14,
};
