from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import json
import uuid

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Open the JSON file and load its contents into a Python dictionary.
with open("buck_converter_steps.json") as f:
    CIRCUIT_DATA = json.load(f)

STEPS = CIRCUIT_DATA["steps"]

# In-memory storage: simple dictionary holding every active session.
sessions = {}


class DatasheetReference(BaseModel):
    section: str
    title: str


class StartResponse(BaseModel):
    session_id: str
    step_number: int
    total_steps: int
    title: str
    task: str
    datasheet_reference: DatasheetReference


class AnswerRequest(BaseModel):
    session_id: str
    answer: str


class AnswerResponse(BaseModel):
    correct: bool
    message: str
    hint_level: int
    step_number: int
    total_steps: int
    completed: bool
    title: str | None = None
    task: str | None = None
    datasheet_reference: DatasheetReference | None = None
    stage: str | None = None # "component" | "reasoning" | None 


@app.post("/start", response_model=StartResponse)
def start_session():
    session_id = str(uuid.uuid4())

    sessions[session_id] = {
    "current_step_index": 0,
    "hint_level": 0,
    "attempts": 0,
    "stage": "component",          # NEW
    "reasoning_hint_level": 0,     # NEW
}

    first_step = STEPS[0]

    return StartResponse(
        session_id=session_id,
        step_number=1,
        total_steps=len(STEPS),
        title=first_step["title"],
        task=first_step["task"],
        datasheet_reference=first_step["datasheet_reference"],
    )


def evaluate_component_step(step, student_answer):
    """For steps 3-7: keyword match, no API call needed."""
    expected_components = [c.lower() for c in step["expected_answer"]["components"]]
    answer_lower = student_answer.lower()

    abbreviations = {
        "capacitor": ["capacitor", "cap", "caps"],
        "inductor": ["inductor", "coil", "ind"],
        "resistor": ["resistor", "res", "resist"],
    }

    for comp in expected_components:
        accepted_terms = abbreviations.get(comp, [comp])
        if not any(term in answer_lower for term in accepted_terms):
            return False
    return True


def evaluate_conceptual_step(step, student_answer):
    """For steps 1, 2, and 8: uses Gemini to judge free-text answers."""
    import google.generativeai as genai

    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel("gemini-3.5-flash-lite")

    expected = step["expected_answer"]

    if expected.get("type") == "conceptual":
        criteria = f"Key ideas the answer should touch on {expected['key_ideas']}"
    else:
        criteria = f"Acceptable values: {expected.get('acceptable', [expected.get('value')])}"

    prompt = f"""You are grading a student's short answer for a beginner PCB design tutoring app.
    Students type quick, casual answers while learning — not polished essays.

    {criteria}

    Mark CORRECT if the answer shows a reasonable grasp of the core idea(s) above,
    even if brief, informally worded, or missing minor details.
    Mark INCORRECT only if the answer is off-topic, factually wrong, just repeats
    the question back, or shows no real understanding.

    Student's answer: "{student_answer}"

    Reply with ONLY the word CORRECT or INCORRECT, and nothing else."""

    response = model.generate_content(prompt)
    result = response.text.strip().upper()
    return result == "CORRECT"

def evaluate_reasoning_step(key_ideas, student_answer):
    import google.generativeai as genai

    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel("gemini-3.5-flash-lite")

    criteria = "Key idea(s) the answer should reflect:\n" + "\n".join(f"- {idea}" for idea in key_ideas)
    prompt = f"""You are grading a student's short answer for a beginner PCB design tutoring app.
Students type quick, casual answers while learning — not polished essays.

{criteria}

Mark CORRECT if the answer shows a reasonable grasp of the core idea(s) above,
even if brief, informally worded, or missing minor details.
Mark INCORRECT only if the answer is off-topic, factually wrong, just repeats
the question back, or shows no real understanding.

Student's answer: "{student_answer}"

Reply with ONLY the word CORRECT or INCORRECT, and nothing else."""
    response = model.generate_content(prompt)
    result = response.text.strip().upper()
    return result == "CORRECT"

def evaluate_answer(step, student_answer):
    """Routes to the right evaluator depending on the step type."""
    if "components" in step["expected_answer"]:
        return evaluate_component_step(step, student_answer)
    else:
        return evaluate_conceptual_step(step, student_answer)

def advance_to_next_step(session, steps):
    idx = session["current_step_index"] + 1
    session["current_step_index"] = idx
    session["hint_level"] = 0
    session["reasoning_hint_level"] = 0
    session["stage"] = "component"

    if idx >= len(steps):
        return AnswerResponse(
            correct=True,
            message="Correct! You've completed the buck converter circuit!",
            hint_level=0,
            step_number=idx,
            total_steps=len(steps),
            completed=True,
            stage=None,
        )

    next_step = steps[idx]
    return AnswerResponse(
        correct=True,
        message="Correct!",
        hint_level=0,
        step_number=idx + 1,
        total_steps=len(steps),
        completed=False,
        title=next_step["title"],
        task=next_step["task"],
        datasheet_reference=next_step.get("datasheet_reference"),
        stage="component" if "reasoning_prompt" in next_step["expected_answer"] else None,
    )


@app.post("/submit-answer", response_model=AnswerResponse)
def submit_answer(req: AnswerRequest):
    session = sessions.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    steps = CIRCUIT_DATA["steps"]
    idx = session["current_step_index"]
    current_step = steps[idx]
    expected = current_step["expected_answer"]
    staged = "reasoning_prompt" in expected
    stage = session.get("stage", "component")

    #Stage A: placement/keyword check 
    if staged and stage == "component":
        if evaluate_component_step(current_step, req.answer):
            session["stage"] = "reasoning"
            session["reasoning_hint_level"] = 0
            return AnswerResponse(
                correct=True,
                message="Nice — that's placed correctly. Now let's think about why.",
                hint_level=0,
                step_number=idx + 1,
                total_steps=len(steps),
                completed=False,
                title=current_step["title"],
                task=expected["reasoning_prompt"],
                datasheet_reference=current_step.get("datasheet_reference"),
                stage="reasoning",
            )
        session["hint_level"] = session.get("hint_level", 0) + 1
        hint_level = session["hint_level"]
        hints = current_step.get("hints", [])
        if hint_level > 4:
            session["stage"] = "reasoning"
            session["hint_level"] = 0
            return AnswerResponse(
                correct=False,
                message="No worries — here's the placement. Let's move on to why it matters.",
                hint_level=0,
                step_number=idx + 1,
                total_steps=len(steps),
                completed=False,
                title=current_step["title"],
                task=expected["reasoning_prompt"],
                datasheet_reference=current_step.get("datasheet_reference"),
                stage="reasoning",
            )
        hint_text = hints.get(str(min(hint_level, len(hints)))) or "Take another look at the datasheet section referenced above."
        return AnswerResponse(
            correct=False,
            message=hint_text,
            hint_level=hint_level,
            step_number=idx + 1,
            total_steps=len(steps),
            completed=False,
            title=current_step["title"],
            task=current_step["task"],
            datasheet_reference=current_step.get("datasheet_reference"),
            stage="component",
        )

    #Stage B: reasoning follow-up 
    if staged and stage == "reasoning":
        if evaluate_reasoning_step(expected["reasoning_key_ideas"], req.answer):
            return advance_to_next_step(session, steps)
        session["reasoning_hint_level"] = session.get("reasoning_hint_level", 0) + 1
        r_hint_level = session["reasoning_hint_level"]
        r_hints = expected.get("reasoning_hints", [])
        if r_hint_level > 4:
            return advance_to_next_step(session, steps)
        hint_text = r_hints.get(str(min(r_hint_level, len(r_hints)))) or "Think about what happens the instant the switch turns on or off."
        return AnswerResponse(
            correct=False,
            message=hint_text,
            hint_level=r_hint_level,
            step_number=idx + 1,
            total_steps=len(steps),
            completed=False,
            title=current_step["title"],
            task=expected["reasoning_prompt"],
            datasheet_reference=current_step.get("datasheet_reference"),
            stage="reasoning",
        )

    #Unstaged steps (1, 2, 8): original single-shot flow
    if evaluate_answer(current_step, req.answer):
        return advance_to_next_step(session, steps)

    session["hint_level"] = session.get("hint_level", 0) + 1
    hint_level = session["hint_level"]
    hints = current_step.get("hints", [])
    if hint_level > 4:
        return advance_to_next_step(session, steps)
    hint_text = hints[min(hint_level, len(hints)) - 1] if hints else "Take another look at the datasheet section referenced above."
    return AnswerResponse(
        correct=False,
        message=hint_text,
        hint_level=hint_level,
        step_number=idx + 1,
        total_steps=len(steps),
        completed=False,
        title=current_step["title"],
        task=current_step["task"],
        datasheet_reference=current_step.get("datasheet_reference"),
        stage=None,
    )

