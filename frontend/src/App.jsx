import { useState } from "react";
import SchematicView from "./SchematicView";

const API_BASE = "http://localhost:8000";

export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [stepNumber, setStepNumber] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [title, setTitle] = useState("");
  const [task, setTask] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [hintLevel, setHintLevel] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [datasheetRef, setDatasheetRef] = useState(null);

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
    setCompleted(false);
    setAnswer("");
    setLoading(false);
  }

  async function submitAnswer(e) {
    e.preventDefault();
    if (!answer.trim() || loading) return;
    setLoading(true);
    const res = await fetch(`${API_BASE}/submit-answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, answer }),
    });
    const data = await res.json();
    setFeedback(data.message);
    setHintLevel(data.hint_level);
    setStepNumber(data.step_number);
    setCompleted(data.completed);
    if (data.datasheet_reference) setDatasheetRef(data.datasheet_reference);
    if (data.correct) setAnswer("");
    setLoading(false);
  }

  const pageStyle = {
    position: "fixed",
    inset: 0,
    fontFamily: "sans-serif",
    background: "#0a1628",
    color: "#e2e8f0",
  };

  if (!sessionId) {
    return (
      <div style={{ ...pageStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: 500, textAlign: "center" }}>
          <h1>CircuitSpark</h1>
          <p style={{ color: "#94a3b8" }}>Learn to design a buck converter, one step at a time.</p>
          <button onClick={startSession} disabled={loading} style={btnStyle}>
            {loading ? "Starting..." : "Start"}
          </button>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div style={{ ...pageStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: 500, textAlign: "center" }}>
          <h1>Circuit complete!</h1>
          <p>{feedback}</p>
          <button onClick={startSession} style={btnStyle}>Start over</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...pageStyle, display: "flex" }}>
      {/* Canvas: 80% */}
      <div style={{ flex: "0 0 80%", height: "100%" }}>
        <SchematicView currentStep={stepNumber} completed={completed} />
      </div>

      {/* Sidebar: 20% */}
      <div
        style={{
          flex: "0 0 20%",
          height: "100%",
          overflowY: "auto",
          borderLeft: "1px solid #1e293b",
          padding: "24px 20px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Compact step tracker */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((n) => (
            <div
              key={n}
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: "bold",
                border: `2px solid ${n < stepNumber ? "#4ade80" : n === stepNumber ? "#60a5fa" : "#334155"}`,
                background: n < stepNumber ? "#4ade80" : "transparent",
                color: n < stepNumber ? "#0a1628" : n === stepNumber ? "#60a5fa" : "#64748b",
              }}
            >
              {n < stepNumber ? "✓" : n}
            </div>
          ))}
        </div>

        <p style={{ color: "#64748b", margin: 0, fontSize: 13 }}>
          Step {stepNumber} of {totalSteps}
        </p>
        <h2 style={{ marginTop: 6, marginBottom: 12, fontSize: 20 }}>{title}</h2>
        <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.5 }}>{task}</p>

        {datasheetRef && (
          <p style={{ fontSize: 12, marginTop: 4 }}>
            <a
              href="https://www.ti.com/lit/ds/symlink/tps54331.pdf"
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
            }}
            placeholder="Type your answer..."
          />
          <button type="submit" disabled={loading} style={{ ...btnStyle, width: "100%", marginTop: 10 }}>
            {loading ? "Checking..." : "Submit"}
          </button>
        </form>

        {feedback && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              fontSize: 13,
              lineHeight: 1.5,
              background: hintLevel > 0 ? "#3f2d12" : "#123f22",
              color: hintLevel > 0 ? "#fcd34d" : "#86efac",
              borderRadius: 6,
            }}
          >
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
}

const btnStyle = {
  padding: "10px 18px",
  background: "#60a5fa",
  color: "#0a1628",
  border: "none",
  borderRadius: 6,
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: 14,
};
