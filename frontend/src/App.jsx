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

  async function startSession() {
    setLoading(true);
    const res = await fetch(`${API_BASE}/start`, { method: "POST" });
    const data = await res.json();
    setSessionId(data.session_id);
    setStepNumber(data.step_number);
    setTotalSteps(data.total_steps);
    setTitle(data.title);
    setTask(data.task);
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
    if (data.correct) setAnswer("");
    setLoading(false);
  }

  if (!sessionId) {
    return (
      <div style={{ maxWidth: 600, margin: "80px auto", fontFamily: "sans-serif" }}>
        <h1>CircuitSpark</h1>
        <p>Learn to design a buck converter, one step at a time.</p>
        <button onClick={startSession} disabled={loading}>
          {loading ? "Starting..." : "Start"}
        </button>
      </div>
    );
  }

  if (completed) {
    return (
      <div style={{ maxWidth: 600, margin: "80px auto", fontFamily: "sans-serif" }}>
        <h1>🎉 Circuit complete!</h1>
        <p>{feedback}</p>
        <button onClick={startSession}>Start over</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "60px auto", fontFamily: "sans-serif" }}>
      <SchematicView currentStep={stepNumber} completed={completed} />
      <p style={{ color: "#666" }}>
        Step {stepNumber} of {totalSteps}
      </p>
      <h2>{title}</h2>
      <p>{task}</p>

      <form onSubmit={submitAnswer}>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={4}
          style={{ width: "100%", padding: 8 }}
          placeholder="Type your answer..."
        />
        <br />
        <button type="submit" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? "Checking..." : "Submit"}
        </button>
      </form>

      {feedback && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: hintLevel > 0 ? "#fff4e5" : "#e6ffed",
            borderRadius: 6,
          }}
        >
          {feedback}
        </div>
      )}
    </div>
  );
}
