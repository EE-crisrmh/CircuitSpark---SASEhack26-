from ast import For

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

#Open the JSON file and load its contents into a Python dictionary. 
with open ("buck_converter_steps.json") as f:
           CIRCUIT_DATA = json.load(f)

STEPS = CIRCUIT_DATA["steps"] 

#In-memory storage: simple dictionary holding every active session.
sessions = {} 

class StartResponse(BaseModel):
        session_id: str
        step_number: int
        total_steps: int 
        title: str
        task: str

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

@app.post("/start", response_model=StartResponse) 
def start_session():
        session_id = str(uuid.uuid4())

        sessions[session_id]= {
            "current_step_index" : 0,
            "hint_level": 0,
            "attempts": 0,
        }

        first_step = STEPS[0]

        return StartResponse(
            session_id=session_id,
            step_number=1,
            total_steps=len(STEPS),
            title=first_step["title"],
            task=first_step["task"]
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

        genai.configure(api_key = os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel("gemini-3.5-flash-lite")

        expected = step["expected_answer"]

        if expected.get("type") == "conceptual": 
                criteria = f"Key ideas the answer should touch on {expected['key_ideas']}"
        else:
                criteria = f"Acceptable values: {expected.get('acceptable', [expected.get('value')])}"

        prompt = f"""You are grading a student's answer for a PCB design tutoring app.
        {criteria}

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

@app.post("/submit-answer", response_model=AnswerResponse)
def submit_answer(request: AnswerRequest):
    session = sessions.get(request.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    current_index = session["current_step_index"]
    current_step = STEPS[current_index]

    is_correct = evaluate_answer(current_step, request.answer)

    if is_correct:
        # Correct, reset hint level and move to the next step.
        session["current_step_index"] += 1
        session["hint_level"] = 0
        session["attempts"] = 0

        if session["current_step_index"] >= len(STEPS):
            return AnswerResponse(
                correct=True,
                message="Correct! You've completed the buck converter circuit!",
                hint_level=0,
                step_number=len(STEPS),
                total_steps=len(STEPS),
                completed=True,
            )

        next_step = STEPS[session["current_step_index"]]
        return AnswerResponse(
            correct=True,
            message=f"Correct! Moving to step {session['current_step_index'] + 1}: {next_step['title']}",
            hint_level=0,
            step_number=session["current_step_index"] + 1,
            total_steps=len(STEPS),
            completed=False,
        )

    else:
        # Incorrect, escalate the hint level. 
        session["hint_level"] += 1
        session["attempts"] += 1

        if session["hint_level"] > 4:
            # User has exhaused all hints, auto-advance so they're not stuck in a loop.
            session["current_step_index"] += 1
            session["hint_level"] = 0
            session["attempts"] = 0

            if session["current_step_index"] >= len(STEPS):
                return AnswerResponse(
                    correct=True,
                    message="Let's move on — you've completed the circuit!",
                    hint_level=0,
                    step_number=len(STEPS),
                    total_steps=len(STEPS),
                    completed=True,
                )

            next_step = STEPS[session["current_step_index"]]
            return AnswerResponse(
                correct=True,
                message=f"Let's move on to step {session['current_step_index'] + 1}: {next_step['title']}",
                hint_level=0,
                step_number=session["current_step_index"] + 1,
                total_steps=len(STEPS),
                completed=False,
            )

        hint_text = current_step["hints"][str(session["hint_level"])]
        return AnswerResponse(
            correct=False,
            message=hint_text,
            hint_level=session["hint_level"],
            step_number=current_index + 1,
            total_steps=len(STEPS),
            completed=False,
        )
    